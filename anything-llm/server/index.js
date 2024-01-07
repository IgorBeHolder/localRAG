process.env.NODE_ENV === "development"
  ? require("dotenv").config({path: `.env.${process.env.NODE_ENV}`})
  : require("dotenv").config();

const express = require("express");
const chardet = require("chardet");
const bodyParser = require("body-parser");
const serveIndex = require("serve-index");
const cors = require("cors");
const path = require("path");

const http = require("http");
const WebSocket = require("ws");
const sshMiddleware = require("./utils/middleware/sshMiddleware");
const {reqBody} = require("./utils/http");
const {systemEndpoints} = require("./endpoints/system");
const {workspaceEndpoints} = require("./endpoints/workspaces");
//const {analystEndpoints} = require("./endpoints/analyst");
const {chatEndpoints} = require("./endpoints/chat");
const {getVectorDbClass, serverLog} = require("./utils/helpers");
const {adminEndpoints} = require("./endpoints/admin");
const {inviteEndpoints} = require("./endpoints/invite");
const {utilEndpoints} = require("./endpoints/utils");
const {Telemetry} = require("./models/telemetry");
const {developerEndpoints} = require("./endpoints/api");
const setupTelemetry = require("./utils/telemetry");
const {v4: uuidv4} = require("uuid");
const {SSH_HOST, SSH_PORT, WS_PORT, FILE_LIMIT, APP_PORT, NO_MATCHES_PHRASE} = require("./utils/helpers/constants");

const app = express();
const apiRouter = express.Router();

console.log("*** IS_CODER", process.env.IS_CODER);
console.log("*** USE_SEM_SEARCH", process.env.USE_SEM_SEARCH);
console.log("*** COMPLETION_MODEL_ENDPOINT", process.env.COMPLETION_MODEL_ENDPOINT);
console.log("*** EMBEDDING_MODEL_ENDPOINT", process.env.EMBEDDING_MODEL_ENDPOINT);
console.log("*** EMBEDDING_MODEL_NAME", process.env.EMBEDDING_MODEL_NAME);
console.log("*** SSH_HOST", SSH_HOST);
console.log("*** SSH_PORT", SSH_PORT);
console.log("*** WS_PORT", WS_PORT);

app.use(cors({
  // origin: 'http://localhost:3000',
  // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  // allowedHeaders: 'Content-Type,Authorization',
  origin: true
}));
app.use(bodyParser.text({limit: FILE_LIMIT}));
app.use(bodyParser.json({limit: FILE_LIMIT}));
app.use(
  bodyParser.urlencoded({
    limit: FILE_LIMIT,
    extended: true
  })
);

app.use("/api", apiRouter);

// WS+SSH FOR CODER MODE
if (process.env.IS_CODER === 'TRUE') {

  let activeStream = null;

  const executeSSHCommand = (command, sshConnection, ws) => {
    serverLog("@@@@@@@ executeSSHCommand", command);

    try {
      //sshConnection.exec(command, (err, stream) => {
      //  if (err) throw err;
      //
      //  // Обработка вывода команды
      //  stream.on("data", (data) => {
      //    console.log("Command Output:", data.toString());
      //  });
      //
      //  // Завершение соединения после выполнения команды
      //  stream.on("close", (code, signal) => {
      //    console.log(`Stream closed with code ${code} and signal ${signal}`);
      //    //sshConnection.end();
      //  });
      //});

      if (activeStream) {
        serverLog("@@@@@@@@@@ activeStream", command);

        activeStream.write(command.trim() + "\n");
      } else {
        // xterm: Один из наиболее распространенных типов терминалов в системах Unix.
        // xterm-256color: Расширение xterm, поддерживающее 256 цветов.
        // rxvt: Другой популярный терминал.
        // gnome-terminal: Используется в графической оболочке GNOME.
        // konsole: Терминал в KDE.
        // tmux-256color: Для использования с tmux, поддерживающим 256 цветов.
        // screen: Для использования с программой screen.
        // vt220: Эмуляция терминала DEC VT220.

        sshConnection.shell({
          term: 'xterm-color',
          // term: 'xterm-256color'
        }, (err, stream) => {
          if (err) {
            throw err;
          }

          // sshConnection.exec(command, (err, stream) => {
          serverLog("xterm-color", err, stream);

          if (err) {
            serverLog("Error executing command:", err);

            let chatResult = {
              id: uuidv4(),
              type: "abort",
              textResponse: "Error executing SSH command",
              sources: [],
              error: JSON.stringify(err),
              close: true
            };

            ws.send(JSON.stringify(chatResult));
            return;
          }

          let result = "";
          stream
            .on("data", (data) => {
              const detectedEncoding = chardet.detect(data);
              // const types = ['ascii', 'utf8', 'utf16le', 'ucs2', 'base64', 'base64url', 'latin1', 'binary', 'hex', detectedEncoding];

              // for (let i = 0; i < types.length; i++) {
              //   const type = types[i];
              serverLog("@@@@@@@@@@ CommandOutput:", detectedEncoding, `${data.toString()}`);
              // }

              result = data.toString().trim();

              if (result === ">") {
                activeStream = stream;
              }

              let chatResult = {
                id: uuidv4(),
                type: "textResponse",
                textResponse: result,
                sources: [],
                error: null,
                close: true
              };

              ws.send(JSON.stringify(chatResult));

              serverLog("Stream is open, result was sent");
            })
            .on("close", (code, signal) => {
              activeStream = null;

              if (code) {
                let chatResult = {
                  id: uuidv4(),
                  type: "abort",
                  textResponse: "Connection close event",
                  sources: [],
                  error: null,
                  close: true
                };

                chatResult.errorCode = code;
                chatResult.error = (code === 127 ? "-bash: no such command" :
                  (code === 1 ? "-ssh: answered with error" :
                    "-bash: unknown error"));

                ws.send(JSON.stringify(chatResult));

                serverLog("@@@@@@@ SSH Close code", code, "signal", signal);
              }
            })
            .on("exit", (code) => {
              //activeStream = null;

              serverLog("@@@@@@@ SSH stream :: exit\n", {code});

              //sshConnection.end();
            });

          activeStream = stream;

          // activeStream.write("interpreter\n");

        });

        // });
      }
    } catch (e) {
      serverLog("@@@@@@@ executeSSHCommand", e);
    }
  }

  const server = http.createServer((req, res) => {
    // Ваш обработчик HTTP-запросов (если необходимо)
  });

  const wss = new WebSocket.Server(
    {
      // port: WS_PORT
      noServer: true
    }
  );

// Используем middleware для управления соединением SSH
  server.on("upgrade", (request, socket, head) => {
    serverLog("##################### WS upgrade start sshMiddleware");

    sshMiddleware(request, {}, (err) => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        if (err) {
          serverLog('##################### handleUpgrade', err);
          wss.emit("sshError", ws, err);
        } else {
          if (request?.sshConnection) {
            wss.emit("connection", ws, request, request?.sshConnection);
          } else {
            serverLog("##################### WS NO connection");
          }
        }
      });
    });
  });

  wss.on("sshError", (ws, error) => {
    let chatResult = {
      id: uuidv4(),
      type: "abort",
      textResponse: "NO SSH connection",
      sources: [],
      error: JSON.stringify(error),
      close: true
    };

    ws.send(JSON.stringify(chatResult));
  });

  wss.on("connection", (ws, request, sshConnection) => {
    serverLog("##################### WS activeStream", activeStream !== null);
    // serverLog("##################### WS connection", activeStream ? {
    //   keys: Object.keys(activeStream),
    //   stdout: Object.keys(activeStream.stdout)
    // } : activeStream);

    activeStream = null;

    executeSSHCommand("interpreter", sshConnection, ws);

    ws.on("message", (message) => {
      const command = message.toString();

      serverLog("##################### WS message", process.env.USE_SEM_SEARCH === "TRUE", command, activeStream);

      if (activeStream) {
        // Получаем команду от клиента и выполняем ее на сервере SSH

        if (process.env.USE_SEM_SEARCH === "TRUE") {
          const {sem_search} = require("./utils/AiProviders/openAi/pseudo_search");

          sem_search(command, NO_MATCHES_PHRASE, function (s) {
            if (s.error) {
              serverLog("##################### WS sem_search", s.error);

              executeSSHCommand(command, sshConnection, ws);
            } else if (s.result) {
              executeSSHCommand(s.result, sshConnection, ws);
            }
          });
        } else {
          serverLog("##################### skip sem_search");

          executeSSHCommand(command, sshConnection, ws);
        }
      }
    });

    ws.on("close", (message) => {
      const command = message.toString();

      if (activeStream) {
        // Получаем команду от клиента и выполняем ее на сервере SSH
        // executeSSHCommand("exit\n", sshConnection, ws);
      }
    });
  });

  server.listen(WS_PORT, () => {
    serverLog(`##################### WS Server is running on port ${WS_PORT}`);
  });
}

systemEndpoints(apiRouter);
workspaceEndpoints(apiRouter);
//analystEndpoints(apiRouter);
chatEndpoints(apiRouter);
adminEndpoints(apiRouter);
inviteEndpoints(apiRouter);
utilEndpoints(apiRouter);
developerEndpoints(app, apiRouter);

apiRouter.post("/v/:command", async (request, response) => {
  try {
    const VectorDb = getVectorDbClass();
    const {command} = request.params;
    if (!Object.getOwnPropertyNames(VectorDb).includes(command)) {
      response.status(500).json({
        message: "invalid interface command",
        commands: Object.getOwnPropertyNames(VectorDb)
      });
      return;
    }

    try {
      const body = reqBody(request);
      const resBody = await VectorDb[command](body);
      response.status(200).json({...resBody});
    } catch (e) {
      serverLog(JSON.stringify(e));
      response.status(500).json({error: e.message});
    }
  } catch (e) {
    response.sendStatus(500).end();
  }
});

if (process.env.NODE_ENV !== "development") {
  app.use(
    express.static(path.resolve(__dirname, "public"), {extensions: ["js"]})
  );

  app.use("/", function (_, response) {
    response.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

app.use(
  "/system/data-exports",
  serveIndex(__dirname + "/storage/exports", {icons: true})
);

app.all("*", function (_, response) {
  response.sendStatus(404);
});

app
  .listen(APP_PORT, async () => {
    await setupTelemetry();
    serverLog(`Example app listening on port ${APP_PORT}`);
  })
  .on("error", function (err) {
    process.once("SIGUSR2", function () {
      Telemetry.flush();
      process.kill(process.pid, "SIGUSR2");
    });
    process.on("SIGINT", function () {
      Telemetry.flush();
      process.kill(process.pid, "SIGINT");
    });
  });
