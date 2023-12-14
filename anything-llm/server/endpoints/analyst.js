const {reqBody, multiUserMode, userFromSession} = require("../utils/http");
const {Analyst} = require("../models/analyst");
const {Document} = require("../models/documents");
const {DocumentVectors} = require("../models/vectors");
const {AnalystChats} = require("../models/analystChats");
const {convertToChatHistory} = require("../utils/chats");
const {getVectorDbClass} = require("../utils/helpers");
const {setupMulter} = require("../utils/files/multer");
const {
  checkPythonAppAlive,
  processDocument
} = require("../utils/files/documentProcessor");
const {validatedRequest} = require("../utils/middleware/validatedRequest");
const {SystemSettings} = require("../models/systemSettings");
const {Telemetry} = require("../models/telemetry");
const {handleUploads} = setupMulter();

function analystndpoints(app) {
  if (!app) return;

  app.post("/analyst/new", [validatedRequest], async (request, response) => {
    try {
      const user = await userFromSession(request, response);
      const {name = null} = reqBody(request);
      const {analyst, message} = await Analyst.new(name, user?.id);
      await Telemetry.sendTelemetry("analyst_created", {
        multiUserMode: multiUserMode(response),
        LLMSelection: process.env.LLM_PROVIDER || "openai",
        VectorDbSelection: process.env.VECTOR_DB || "pinecone"
      });
      response.status(200).json({analyst, message});
    } catch (e) {
      console.log(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.post(
    "/analyst/:slug/update",
    [validatedRequest],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const {slug = null} = request.params;
        const data = reqBody(request);
        const currAnalyst = multiUserMode(response)
          ? await Analyst.getWithUser(user, {slug})
          : await Analyst.get({slug});

        if (!currAnalyst) {
          response.sendStatus(400).end();
          return;
        }

        const {analyst, message} = await Analyst.update(
          currAnalyst.id,
          data
        );
        response.status(200).json({analyst, message});
      } catch (e) {
        console.log(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/analyst/:slug/upload",
    handleUploads.single("file"),
    async function (request, response) {
      const {originalname} = request.file;
      const processingOnline = await checkPythonAppAlive();

      if (!processingOnline) {
        response
          .status(500)
          .json({
            success: false,
            error: `Python processing API is not online. Document ${originalname} will not be processed automatically.`
          })
          .end();
        return;
      }

      const {success, reason} = await processDocument(originalname);
      if (!success) {
        response.status(500).json({success: false, error: reason}).end();
        return;
      }

      console.log(
        `Document ${originalname} uploaded processed and successfully. It is now available in documents.`
      );
      await Telemetry.sendTelemetry("document_uploaded");
      response.status(200).json({success: true, error: null});
    }
  );

  app.post(
    "/analyst/:slug/update-embeddings",
    [validatedRequest],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const {slug = null} = request.params;
        const {adds = [], deletes = []} = reqBody(request);
        const currAnalyst = multiUserMode(response)
          ? await Analyst.getWithUser(user, {slug})
          : await Analyst.get({slug});

        if (!currAnalyst) {
          response.sendStatus(400).end();
          return;
        }

        await Document.removeDocuments(currAnalyst, deletes);
        await Document.addDocuments(currAnalyst, adds);
        const updatedAnalyst = await Analyst.get({id: currAnalyst.id});
        response.status(200).json({analyst: updatedAnalyst});
      } catch (e) {
        console.log(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.delete(
    "/analyst/:slug",
    [validatedRequest],
    async (request, response) => {
      try {
        const {slug = ""} = request.params;
        const user = await userFromSession(request, response);
        const VectorDb = getVectorDbClass();
        const analyst = multiUserMode(response)
          ? await Analyst.getWithUser(user, {slug})
          : await Analyst.get({slug});

        if (!analyst) {
          response.sendStatus(400).end();
          return;
        }

        if (multiUserMode(response) && user.role !== "admin") {
          const canDelete =
            (await SystemSettings.get({label: "users_can_delete_analysts"}))
              ?.value === "true";
          if (!canDelete) {
            response.sendStatus(500).end();
            return;
          }
        }

        await AnalystChats.delete({analystId: Number(analyst.id)});
        await DocumentVectors.deleteForAnalyst(analyst.id);
        await Document.delete({analystId: Number(analyst.id)});
        await Analyst.delete({id: Number(analyst.id)});

        try {
          await VectorDb["delete-namespace"]({namespace: slug});
        } catch (e) {
          console.error(e.message);
        }
        response.sendStatus(200).end();
      } catch (e) {
        console.log(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.get("/analysts", [validatedRequest], async (request, response) => {
    try {
      const user = await userFromSession(request, response);
      const analysts = multiUserMode(response)
        ? await Analyst.whereWithUser(user)
        : await Analyst.where();

      response.status(200).json({analysts});
    } catch (e) {
      console.log(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.get("/analyst/:slug", [validatedRequest], async (request, response) => {
    try {
      const {slug} = request.params;
      const user = await userFromSession(request, response);
      const analyst = multiUserMode(response)
        ? await Analyst.getWithUser(user, {slug})
        : await Analyst.get({slug});

      response.status(200).json({analyst});
    } catch (e) {
      console.log(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.get(
    "/analyst/:slug/chats",
    [validatedRequest],
    async (request, response) => {
      try {
        const {slug} = request.params;
        const user = await userFromSession(request, response);
        const analyst = multiUserMode(response)
          ? await Analyst.getWithUser(user, {slug})
          : await Analyst.get({slug});

        if (!analyst) {
          response.sendStatus(400).end();
          return;
        }

        const history = multiUserMode(response)
          ? await AnalystChats.forAnalystByUser(analyst.id, user.id)
          : await AnalystChats.forAnalyst(analyst.id);

        response.status(200).json({history: convertToChatHistory(history)});
      } catch (e) {
        console.log(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );
}

module.exports = {analystndpoints};
