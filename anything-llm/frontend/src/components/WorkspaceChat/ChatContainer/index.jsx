import {useState, useEffect} from "react";
import ChatHistory from "./ChatHistory";
import PromptInput from "./PromptInput";
import Workspace from "../../../models/workspace";
import handleChat from "../../../utils/chat";

export default function ChatContainer({workspace, knownHistory = []}) {
  const [message, setMessage] = useState("");
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [chatHistory, setChatHistory] = useState(knownHistory);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message || message === "") return false;

    const prevChatHistory = [
      ...chatHistory,
      {content: message, role: "user"},
      {
        content: "",
        role: "assistant",
        pending: true,
        userMessage: message,
        animate: true
      }
    ];

    setChatHistory(prevChatHistory);
    setMessage("");
    setLoadingResponse(true);
  };

  useEffect(() => {
    async function fetchReply() {
      const promptMessage =
        chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
      const remHistory = chatHistory.length > 0 ? chatHistory.slice(0, -1) : [];
      let _chatHistory = [...remHistory];

      if (!promptMessage || !promptMessage?.userMessage) {
        setLoadingResponse(false);
        return false;
      }

      const chatResult = await Workspace.sendChat(
        workspace,
        promptMessage.userMessage,
        window.localStorage.getItem(`workspace_chat_mode_${workspace.slug}`) ??
        "query"
      );
      handleChat(
        chatResult,
        setLoadingResponse,
        setChatHistory,
        remHistory,
        _chatHistory
      );
    }

    loadingResponse === true && fetchReply();
  }, [loadingResponse, chatHistory, workspace]);

  return (
    <div
      className="main-content flex-1 lg:max-w-[var(--max-content)] relative bg-white dark:bg-black-900 lg:h-full"
    >

      <div className="main-box relative flex flex-col w-full h-full overflow-y-auto p-[16px] lg:p-[32px] !pb-0">
        <div className="flex flex-col flex-1 w-full bg-white shadow-md relative">
          <ChatHistory history={chatHistory} workspace={workspace}/>
        </div>
      </div>
      <PromptInput
        workspace={workspace}
        message={message}
        submit={handleSubmit}
        onChange={handleMessageChange}
        inputDisabled={loadingResponse}
        buttonDisabled={loadingResponse}
      />
    </div>
  );
}
