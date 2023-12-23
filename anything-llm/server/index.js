process.env.NODE_ENV === "development"
  ? require("dotenv").config({path: `.env.${process.env.NODE_ENV}`})
  : require("dotenv").config();
console.log("*** SSH_HOST", process.env.SSH_HOST);
console.log("*** SSH_PORT", process.env.SSH_PORT);
console.log("*** WS_PORT", process.env.WS_PORT);
console.log("*** IS_CODER", process.env.IS_CODER);
console.log("*** COMPLETION_MODEL_ENDPOINT", process.env.COMPLETION_MODEL_ENDPOINT);
console.log("*** COMPLETION_MODEL_NAME", process.env.COMPLETION_MODEL_NAME);
console.log("*** EMBEDDING_MODEL_ENDPOINT", process.env.EMBEDDING_MODEL_ENDPOINT);
console.log("*** EMBEDDING_MODEL_NAME", process.env.EMBEDDING_MODEL_NAME);

const WS_PORT = process.env.WS_PORT || 3006;

const express = require("express");
const bodyParser = require("body-parser");
const serveIndex = require("serve-index");
const cors = require("cors");
const path = require("path");

const http = require("http");
const WebSocket = require("ws");
const sshMiddleware = require("./endpoints/sshMiddleware");
const {reqBody} = require("./utils/http");
const {systemEndpoints} = require("./endpoints/system");
const {workspaceEndpoints} = require("./endpoints/workspaces");
//const {analystEndpoints} = require("./endpoints/analyst");
const {chatEndpoints} = require("./endpoints/chat");
const {getVectorDbClass} = require("./utils/helpers");
const {adminEndpoints} = require("./endpoints/admin");
const {inviteEndpoints} = require("./endpoints/invite");
const {utilEndpoints} = require("./endpoints/utils");
const {Telemetry} = require("./models/telemetry");
const {developerEndpoints} = require("./endpoints/api");
const setupTelemetry = require("./utils/telemetry");
const {v4: uuidv4} = require("uuid");
const {sem_search} = require("./utils/AiProviders/openAi/pseudossearsh");
const app = express();
const apiRouter = express.Router();
const FILE_LIMIT = "3GB";

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

let activeStream = null;

function executeSSHCommand(command, sshConnection, ws) {
  console.log("@@@@@@@ executeSSHCommand", command);
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
      console.log("@@@@@@@@@@ activeStream", command);
      activeStream.write(command + "\n");
    } else {
      sshConnection.exec(command, (err, stream) => {
        if (err) {
          console.error("Error executing command:", err);
          ws.send("Error executing command");
          return;
        }

        let result = "";
        stream
          .on("data", (data) => {
            if (process.env.NODE_ENV === "development") {
              console.log("@@@@@@@@@@ CommandOutput:", data, `'${data.toString()}'`);
            }

            result = data.toString();

            if (result === "> ") {
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

            if (process.env.NODE_ENV === "development") {
              console.log("Stream is open, result was sent");
            }
          })
          .on("close", (code, signal) => {
            activeStream = null;

            if (code) {
              let chatResult = {
                id: uuidv4(),
                type: "textResponse",
                textResponse: "Connection close event",
                sources: [],
                error: null,
                close: true
              };

              chatResult.error = {code, text: (code === 127 ? "-bash: no such command" : "-bash: unknown error")};

              if (process.env.NODE_ENV === "development") {
                console.warn("@@@@@@@ SSH Result", code, signal);
              }

              ws.send(JSON.stringify(chatResult));

              if (process.env.NODE_ENV === "development") {
                console.log("Stream closed with code " + code + " and signal " + signal + " result was sent");
              }
            }
          })
          .on("exit", (code) => {
            //activeStream = null;
            //
            //console.log("@@@@@@@ SSH stream :: exit\n", {code});
            //sshConnection.end();
          });
      });
    }
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.log("@@@@@@@ executeSSHCommand", e);
    }
  }
}

const server = http.createServer((req, res) => {
  // Ваш обработчик HTTP-запросов (если необходимо)
});

const APP_PORT = process.env.SERVER_PORT || 3001;

const wss = new WebSocket.Server({noServer: true});

// Используем middleware для управления соединением SSH
server.on("upgrade", (request, socket, head) => {
  if (process.env.NODE_ENV === "development") {
    console.log("##################### WS upgrade");
  }
  sshMiddleware(request, {}, () => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      if (request?.sshConnection) {
        wss.emit("connection", ws, request, request?.sshConnection);
      } else {
        if (process.env.NODE_ENV === "development") {
          console.log("##################### WS NO connection");
        }
      }
    });
  });
});

wss.on("connection", (ws, request, sshConnection) => {
  if (process.env.NODE_ENV === "development") {
    console.log("##################### WS connection", activeStream ? {
      keys: Object.keys(activeStream),
      stdout: Object.keys(activeStream.stdout)
    } : activeStream);
  }

  activeStream = null;

  executeSSHCommand("interpreter\n", sshConnection, ws);

  ws.on("message", (message) => {
    const command = message.toString();

    if (process.env.NODE_ENV === "development") {
      console.log("##################### WS message", command);
    }

    if (activeStream) {
      // sem_search(command).then(s => {
      //   console.log('sem_search', s);
      // });

      // Получаем команду от клиента и выполняем ее на сервере SSH
      executeSSHCommand(command, sshConnection, ws);
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
  if (process.env.NODE_ENV === "development") {
    console.log(`##################### WS Server is running on port ${WS_PORT}`);
  }
});

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
      // console.error(e)
      console.error(JSON.stringify(e));
      response.status(500).json({error: e.message});
    }
  } catch (e) {
    // console.log(e.message, e);
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
    if (process.env.NODE_ENV === "development") {
      console.log(`Example app listening on port ${APP_PORT}`);
    }
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
