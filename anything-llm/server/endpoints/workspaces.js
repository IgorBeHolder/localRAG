const path = require("path");
const fs = require("fs");
const {reqBody, multiUserMode, userFromSession} = require("../utils/http");
const {Workspace} = require("../models/workspace");
const {Document} = require("../models/documents");
const {DocumentVectors} = require("../models/vectors");
const {WorkspaceChats} = require("../models/workspaceChats");
const {convertToChatHistory} = require("../utils/chats");
const {getVectorDbClass, fixEncoding, serverLog} = require("../utils/helpers");
const {setupMulter} = require("../utils/files/multer");
const {
  checkPythonAppAlive,
  processDocument
} = require("../utils/files/documentProcessor");
const {validatedRequest} = require("../utils/middleware/validatedRequest");
const {SystemSettings} = require("../models/systemSettings");
const {Telemetry} = require("../models/telemetry");
const {handleUploads} = setupMulter();

const CODER_DIR = "./storage/coder";

function workspaceEndpoints(app) {
  if (!app) return;

  app.post("/workspace/new", [validatedRequest], async (request, response) => {
    try {
      const user = await userFromSession(request, response);
      const {name = null} = reqBody(request);
      const {workspace, message} = await Workspace.new(name, user?.id);
      await Telemetry.sendTelemetry("workspace_created", {
        multiUserMode: multiUserMode(response),
        LLMSelection: process.env.LLM_PROVIDER || "openai",
        VectorDbSelection: process.env.VECTOR_DB || "lancedb"
      });
      response.status(200).json({workspace, message});
    } catch (e) {
      serverLog(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.post(
    "/workspace/:slug/update",
    [validatedRequest],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const {slug = null} = request.params;
        const data = reqBody(request);
        const currWorkspace = multiUserMode(response)
          ? await Workspace.getWithUser(user, {slug})
          : await Workspace.get({slug});

        if (!currWorkspace) {
          response.sendStatus(400).end();
          return;
        }

        const {workspace, message} = await Workspace.update(
          currWorkspace.id,
          data
        );
        response.status(200).json({workspace, message});
      } catch (e) {
        serverLog(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/save_csv",
    handleUploads.single("file"),
    async function (request, response) {
      if (!request.file) {
        response.status(400).json({success: false, error: "No file uploaded"}).end();
        return;
      }

      const {originalname, path: tempPath} = request.file;
      const destFilePath = path.join(CODER_DIR, originalname);

      serverLog('destFilePath', destFilePath, tempPath, originalname, CODER_DIR);

      try {
        fs.renameSync(tempPath, destFilePath);
        serverLog(`CSV file ${originalname} saved successfully in ${CODER_DIR}.`);
        response.status(200).json({success: true, error: null});
      } catch (e) {
        serverLog(`Error saving file: ${e.message}`, e);
        response.status(500).json({success: false, error: `Error saving file: ${e.message}`}).end();
      }
    }
  );

  app.post(
    "/workspace/:slug/upload",
    handleUploads.single("file"),
    async function (request, response) {
      const originalname = request.file.originalname;
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

      serverLog(
        `Document ${originalname} uploaded and processed successfully. It is now available in documents.`
      );
      await Telemetry.sendTelemetry("document_uploaded");
      response.status(200).json({success: true, error: null});
    }
  );

  app.post(
    "/workspace/:slug/update-embeddings",
    [validatedRequest],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const {slug = null} = request.params;
        const {adds = [], deletes = []} = reqBody(request);
        const currWorkspace = multiUserMode(response)
          ? await Workspace.getWithUser(user, {slug})
          : await Workspace.get({slug});

        if (!currWorkspace) {
          response.sendStatus(400).end();
          return;
        }

        await Document.removeDocuments(currWorkspace, deletes);
        await Document.addDocuments(currWorkspace, adds);
        const updatedWorkspace = await Workspace.get({id: currWorkspace.id});
        response.status(200).json({workspace: updatedWorkspace});
      } catch (e) {
        serverLog(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.delete(
    "/workspace/:slug",
    [validatedRequest],
    async (request, response) => {
      try {
        const {slug = ""} = request.params;
        const user = await userFromSession(request, response);
        const VectorDb = getVectorDbClass();
        const workspace = multiUserMode(response)
          ? await Workspace.getWithUser(user, {slug})
          : await Workspace.get({slug});

        if (!workspace) {
          response.sendStatus(400).end();
          return;
        }

        if (multiUserMode(response) && user.role !== "admin") {
          const canDelete =
            (await SystemSettings.get({label: "users_can_delete_workspaces"}))
              ?.value === "true";
          if (!canDelete) {
            response.sendStatus(500).end();
            return;
          }
        }

        await WorkspaceChats.delete({workspaceId: Number(workspace.id)});
        await DocumentVectors.deleteForWorkspace(workspace.id);
        await Document.delete({workspaceId: Number(workspace.id)});
        await Workspace.delete({id: Number(workspace.id)});

        try {
          await VectorDb["delete-namespace"]({namespace: slug});
        } catch (e) {
          serverLog(e.message);
        }
        response.sendStatus(200).end();
      } catch (e) {
        serverLog(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.get("/workspaces", [validatedRequest], async (request, response) => {
    try {
      const user = await userFromSession(request, response);
      const workspaces = multiUserMode(response)
        ? await Workspace.whereWithUser(user)
        : await Workspace.where();

      response.status(200).json({workspaces});
    } catch (e) {
      serverLog(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.get("/workspace/:slug", [validatedRequest], async (request, response) => {
    try {
      const {slug} = request.params;
      const user = await userFromSession(request, response);
      const workspace = multiUserMode(response)
        ? await Workspace.getWithUser(user, {slug})
        : await Workspace.get({slug});

      response.status(200).json({workspace});
    } catch (e) {
      serverLog(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.get(
    "/workspace/:slug/chats",
    [validatedRequest],
    async (request, response) => {
      try {
        const {slug} = request.params;
        const user = await userFromSession(request, response);
        const workspace = multiUserMode(response)
          ? await Workspace.getWithUser(user, {slug})
          : await Workspace.get({slug});

        if (!workspace) {
          response.sendStatus(400).end();
          return;
        }

        const history = multiUserMode(response)
          ? await WorkspaceChats.forWorkspaceByUser(workspace.id, user.id)
          : await WorkspaceChats.forWorkspace(workspace.id);

        response.status(200).json({history: convertToChatHistory(history)});
      } catch (e) {
        serverLog(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );
}

module.exports = {workspaceEndpoints};
