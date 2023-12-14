const { ApiKey } = require("../../models/apiKeys");
const { SystemSettings } = require("../../models/systemSettings");

async function validApiKey(request, response, next) {
  response.locals.multiUserMode = await SystemSettings.isMultiUserMode();

  const auth = request.header("Authorization");
  const bearerKey = auth ? auth.split(" ")[1] : null;
  if (!bearerKey) {
    response.status(403).json({
      error: "No valid api key found.",
    });
    return;
  }

  if (!(await ApiKey.get({ secret: bearerKey }))) {
    response.status(403).json({
      error: "No valid api key found.",
    });
    return;
  }

  next();
}

module.exports = {
  validApiKey,
};
