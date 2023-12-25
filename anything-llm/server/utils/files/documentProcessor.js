// When running locally will occupy the 0.0.0.0 hostname space but when deployed inside
// of docker this endpoint is not exposed so it is only on the Docker instances internal network
// so no additional security is needed on the endpoint directly. Auth is done however by the express
// middleware prior to leaving the node-side of the application so that is good enough >:)

const {serverLog} = require("../helpers");
const mode = process.env.MODE;

let PYTHON_API = mode === "production" ? "http://localhost:3005" : "http://0.0.0.0:3005";
//                   doc server running   in docker container       on host machine

console.log("PYTHON_API:*********************", PYTHON_API);

async function checkPythonAppAlive() {
  return await fetch(`${PYTHON_API}`)
    .then((res) => res.ok)
    .catch((e) => {
      serverLog("PYTHON_API:******* ERROR", PYTHON_API, e);
      return false;
    });
}

async function acceptedFileTypes() {
  return await fetch(`${PYTHON_API}/accepts`)
    .then((res) => {
      if (!res.ok) throw new Error("Could not reach");
      return res.json();
    })
    .then((res) => res)
    .catch(() => null);
}

async function processDocument(filename = "") {
  if (!filename) return false;
  // send filename to python app:
  return await fetch(`${PYTHON_API}/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    // limit filename to 30 characters
    body: JSON.stringify({filename})
  })
    .then((res) => {
      if (!res.ok) throw new Error("Запрос не удался");
      return res.json();
    })
    .then((res) => res)
    .catch((e) => {
      console.log(e.message);
      return {success: false, reason: e.message};
    });
}

async function processCsvDocument(filename = "") {
  if (!filename) return false;
  // send filename to python app:
  return await fetch(`${PYTHON_API}/save_csv`, {
    method: "POST",
    body: JSON.stringify({filename})
  })
    .then((res) => {
      if (!res.ok) throw new Error("Запрос не удался");
      return res.json();
    })
    .then((res) => res)
    .catch((e) => {
      serverLog("PYTHON_API:******* ERROR", PYTHON_API, e);
      return {success: false, reason: e.message};
    });
}

module.exports = {
  checkPythonAppAlive,
  processDocument,
  processCsvDocument,
  acceptedFileTypes
};
