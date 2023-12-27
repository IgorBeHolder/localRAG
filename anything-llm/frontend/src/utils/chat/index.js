import {safeTagsReplace} from "../functions.js";

export default function handleChat(
  chatResult,
  setLoadingResponse,
  setChatHistory,
  remHistory,
  _chatHistory
) {
  const {uuid, textResponse: text, type, sources = [], error, close, typeWriter} = chatResult;
  const textResponse = typeWriter ? safeTagsReplace(text) : text;

  

  if (type === "abort") {
    setChatHistory([
      ...remHistory,
      {
        uuid,
        content: textResponse,
        role: "assistant",
        sources,
        closed: true,
        typeWriter: false,
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
      typeWriter: false,
      error,
      animate: true,
    });
  } else if (type === "textResponse") {
    setChatHistory([
      ...remHistory,
      {
        uuid,
        content: textResponse,
        typeWriter: false,
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
      typeWriter: typeWriter,
      role: "assistant",
      sources,
      closed: typeWriter || close,
      error,
      animate: true,
    });
  }

  setLoadingResponse(false);
}
