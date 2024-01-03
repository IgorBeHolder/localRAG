const {Client} = require("ssh2");
const {SSH_HOST, SSH_PORT} = require("../helpers/constants");
const {serverLog} = require("../helpers");

function sshMiddleware(req, res, next) {
  const sshConfig = {
    host: SSH_HOST,
    port: SSH_PORT,
    username: "coder",
    password: "coder"
  };

  const conn = new Client();

  conn.on("ready", () => {
    serverLog("$$$$$$$$$$$$$$ SSH connection established.");
    req.sshConnection = conn; // Добавляем соединение в объект запроса
    next(); // Переходим к следующему middleware или маршруту
  });

  conn.on("error", (err) => {
    next(err);
  });

  conn.on("end", () => {
    serverLog("$$$$$$$$$$$$$$ SSH connection closed.");
  });

  conn.connect(sshConfig);
}

module.exports = sshMiddleware;
