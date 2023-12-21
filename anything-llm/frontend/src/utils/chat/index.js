// For handling of synchronous chats that are not utilizing streaming or chat requests.
import {DEFAULT_CHAT_OPTIONS} from "../constants.js";
import {safeTagsReplace} from "../functions.js";

export default function handleChat(
  chatResult,
  setLoadingResponse,
  setChatHistory,
  remHistory,
  _chatHistory
) {
  const {uuid, textResponse: text, type, sources = [], error, close} = chatResult;
  const textResponse = safeTagsReplace(text);

  if (type === "abort") {
    setChatHistory([
      ...remHistory,
      {
        uuid,
        content: textResponse,
        role: "assistant",
        sources,
        closed: true,
        error,
        animate: true,
      },
    ]);
    _chatHistory.push({
      uuid,
      content: textResponse,
      role: "assistant",
      sources,
      closed: true,
      error,
      animate: true,
    });
  } else if (type === "textResponse") {
    setChatHistory([
      ...remHistory,
      {
        uuid,
        content: textResponse,
        role: "assistant",
        sources,
        closed: close,
        error,
        animate: true,
      },
    ]);
    _chatHistory.push({
      uuid,
      content: textResponse,
      role: "assistant",
      sources,
      closed: close,
      error,
      animate: true,
    });
  }

  setLoadingResponse(false);
}
