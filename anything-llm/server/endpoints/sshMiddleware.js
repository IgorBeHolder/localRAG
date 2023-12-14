const {Client} = require("ssh2");

function sshMiddleware(req, res, next) {
  const sshConfig = {
    host: "localhost",
    port: 2222,
    username: "coder",
    password: "coder"
  };

  const conn = new Client();

  conn.on("ready", () => {
    console.log("SSH connection established.");
    req.sshConnection = conn; // Добавляем соединение в объект запроса
    next(); // Переходим к следующему middleware или маршруту
  });

  conn.on("error", (err) => {
    console.error("Error connecting to the server:", err);
    res.status(500).send("Error connecting to the server"); // Обработка ошибки подключения
  });

  conn.on("end", () => {
    console.log("SSH connection closed.");
  });

  conn.connect(sshConfig);
}

module.exports = sshMiddleware;
