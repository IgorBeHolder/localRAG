// For handling of synchronous chats that are not utilizing streaming or chat requests.
export default function handleChat(
  chatResult,
  setLoadingResponse,
  setChatHistory,
  remHistory,
  _chatHistory
) {
  const { uuid, textResponse, type, sources = [], error, close } = chatResult;

  if (type === "abort") {
    setLoadingResponse(false);
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
    setLoadingResponse(false);
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
}

export function chatPrompt(workspace) {
  return (
    workspace?.openAiPrompt ??
    "Учитывая следующий разговор, соответствующий контекст и дополнительный вопрос, ответьте на текущий вопрос, который задает пользователь. Отправьте только свой ответ на вопрос с учетом приведенной выше информации, следуя инструкциям пользователя по мере необходимости."
  );
}
