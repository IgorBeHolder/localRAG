const {Client} = require("ssh2");

const SSH_HOST = process.env.SSH_HOST || "coder";
const SSH_PORT = process.env.SSH_PORT || 22;

function sshMiddleware(req, res, next) {
  const sshConfig = {
    host: SSH_HOST,
    port: SSH_PORT,
    username: "coder",
    password: "coder"
  };

  const conn = new Client();

  conn.on("ready", () => {
    console.log("$$$$$$$$$$$$$$ SSH connection established.");
    req.sshConnection = conn; // Добавляем соединение в объект запроса
    next(); // Переходим к следующему middleware или маршруту
  });

  conn.on("error", (err) => {
    console.error("$$$$$$$$$$$$$$ Error connecting to the server:", err);
    res.status(500).send("Error connecting to the server"); // Обработка ошибки подключения
  });

  conn.on("end", () => {
    console.log("$$$$$$$$$$$$$$ SSH connection closed.");
  });

  conn.connect(sshConfig);
}

module.exports = sshMiddleware;
