const { v4: uuidv4 } = require("uuid");
const { OpenAi } = require("../AiProviders/openAi");
const { WorkspaceChats } = require("../../models/workspaceChats");
const { resetMemory } = require("./commands/reset");
const moment = require("moment");
const { getVectorDbClass, getLLMProvider } = require("../helpers");
const { prompt_templates } = require("../vectorDbProviders/lance/index");

// const { BOS, EOS, assistance_prefix, end_of_turn, user_prefix } = prompt_templates();

function convertToChatHistory(history = []) {
  const formattedHistory = [];
  history.forEach((history) => {
    const { prompt, response, createdAt } = history;
    const data = JSON.parse(response);
    formattedHistory.push([
      {
        role: "user",
        content: prompt,
        sentAt: moment(createdAt).unix()
      },
      {
        role: "assistant",
        content: data.text,
        sources: data.sources || [],
        sentAt: moment(createdAt).unix()
      }
    ]);
  });

  return formattedHistory.flat();
}

//
function convertToPromptHistory(history = []) {
  const formattedHistory = [];
  history.forEach((history) => {
    const { prompt, response } = history;
    const data = JSON.parse(response);
    formattedHistory.push([
      { role: "user", content: prompt },
      { role: "assistant", content: data.text }
    ]);
  });
  return formattedHistory.flat();
}

const VALID_COMMANDS = {
  "/reset": resetMemory
};

function grepCommand(message) {
  const availableCommands = Object.keys(VALID_COMMANDS);

  for (let i = 0; i < availableCommands.length; i++) {
    const cmd = availableCommands[i];
    const re = new RegExp(`^(${cmd})`, "i");
    if (re.test(message)) {
      return cmd;
    }
  }

  return null;
}

async function chatWithWorkspace(
  workspace,
  message,
  chatMode = "query",
  user = null,
  request = null
) {
  const uuid = uuidv4();
  const LLMConnector = getLLMProvider();
  const VectorDb = getVectorDbClass();
  const command = grepCommand(message);

  console.log("chatWithWorkspace $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", chatMode, request?.sshConnection ?? "no sshConnection");

  if (!!command && Object.keys(VALID_COMMANDS).includes(command)) {
    return await VALID_COMMANDS[command](workspace, message, uuid, user);
  }

  if (chatMode === "analyst") {
    return {
      id: uuid,
      type: "textResponse",
      textResponse: "ssh me",
      sources: [],
      close: true,
      error: null
    }
  } else {
    const { safe, reasons = [] } = await LLMConnector.isSafe(message);
    if (!safe) {
      return {
        id: uuid,
        type: "abort",
        textResponse: null,
        sources: [],
        close: true,
        // error: `This message was moderated and will not be allowed. Violations for ${reasons.join(
        //   ", "
        // )} found.`,
        error: `Это сообщение не прошло модерацию по причине ${reasons.join(
          ", "
        )}.`
      };
    }

    const hasVectorizedSpace = await VectorDb.hasNamespace(workspace.slug);
    const embeddingsCount = await VectorDb.namespaceCount(workspace.slug);

    var messageLimit = workspace?.openAiHistory;
    let chatHistory = [];

    if (chatMode === 'chat') {
      const rawHistory = await WorkspaceChats.forWorkspace(workspace.id, messageLimit);
      chatHistory = convertToPromptHistory(rawHistory);
    }

    //  has NO vectorized space - 
    if (!hasVectorizedSpace || embeddingsCount === 0) {

      const response = await LLMConnector.sendChat(
        chatHistory,
        message,
        workspace
      );
      const data = { text: response, sources: [], type: chatMode };

      await WorkspaceChats.new({
        workspaceId: workspace.id,
        prompt: message,
        response: data,
        user
      });
      return {
        id: uuid,
        type: "textResponse",
        textResponse: response,
        sources: [],
        close: true,
        error: null
      };


    } else {    //  HAS vectorized space
      
      const {
        response,
        sources,
        message: error
      } = await VectorDb[chatMode]({
        namespace: workspace.slug,
        input: message,
        workspace,
        chatHistory
      });
      if (!response) {
        return {
          id: uuid,
          type: "abort",
          textResponse: null,
          sources: [],
          close: true,
          error
        };
      }

      const data = { text: response, sources, type: chatMode };
      await WorkspaceChats.new({
        workspaceId: workspace.id,
        prompt: message,
        response: data,
        user
      });
      return {
        id: uuid,
        type: "textResponse",
        textResponse: response,
        sources,
        close: true,
        error
      };
    } // end has vectorized space
  }
}

function chatPrompt(workspace) {
  return (
    workspace.openAiPrompt
  );
}

module.exports = {
  convertToChatHistory,
  chatWithWorkspace,
  chatPrompt
};
