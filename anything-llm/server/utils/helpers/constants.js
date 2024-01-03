const FILE_LIMIT = "3GB";

const NO_MATCHES_PHRASE = "нет точного соответствия";
const SSH_HOST = process.env.SSH_HOST || "coder";
const SSH_PORT = process.env.SSH_PORT || 22;
const APP_PORT = process.env.SERVER_PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3006;

module.exports = {
  FILE_LIMIT,
  NO_MATCHES_PHRASE,
  SSH_HOST,
  SSH_PORT,
  APP_PORT,
  WS_PORT,
};
