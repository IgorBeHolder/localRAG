import {useState, useEffect, useCallback} from "react";
import ChatHistory from "./ChatHistory";
import PromptInput from "./PromptInput";
import Workspace from "../../../models/workspace";
import handleChat from "../../../utils/chat";

export default function ChatContainer({workspace, knownHistory = []}) {
  const [message, setMessage] = useState("");
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [chatHistory, setChatHistory] = useState(knownHistory);
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("");
  const [ws, setWs] = useState(null);

  const storageKey = `workspace_chat_mode_${workspace.slug}`;

  const mode = window.localStorage.getItem(storageKey);

  console.log("mode", mode);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const sendCommand = useCallback(() => {
    console.log("sendCommand", ws, command);
    // Отправляем команду на сервер через WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(command);
    }
  }, [command]);

  const handleSSH = async (msg) => {
    console.log("handleSubmit", msg);
    if (!msg || msg === "") return false;

    const prevChatHistory = [
      ...chatHistory,
      {content: msg, role: "user"},
      {
        content: "",
        role: "assistant",
        pending: true,
        userMessage: msg,
        animate: true
      }
    ];

    setCommand(msg);
    setChatHistory(prevChatHistory);
    setMessage("");
    setLoadingResponse(true);
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
    // Устанавливаем WebSocket-соединение
    const newWs = new WebSocket("ws://localhost:3030");
    setWs(newWs);

    newWs.onopen = () => {
      console.log("WebSocket connection opened.");
    };

    newWs.onmessage = (event) => {
      setOutput(event.data);
    };

    newWs.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    // Очищаем ресурсы при размонтировании компонента
    return () => {
      newWs.close();
    };
  }, []);

  useEffect(() => {
    async function fetchReply() {
      console.log("fetchReply", mode);
      if (mode === "analyst") {
        sendCommand();
      } else {
        const promptMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
        const remHistory = chatHistory.length > 0 ? chatHistory.slice(0, -1) : [];
        let _chatHistory = [...remHistory];

        if (!promptMessage || !promptMessage?.userMessage) {
          setLoadingResponse(false);
          return false;
        }

        const chatResult = await Workspace.sendChat(
          workspace,
          promptMessage.userMessage,
          mode ?? "query"
        );
        handleChat(
          chatResult,
          setLoadingResponse,
          setChatHistory,
          remHistory,
          _chatHistory
        );
      }
    }

    loadingResponse === true && fetchReply();
  }, [loadingResponse, chatHistory, workspace, mode]);

  return (
    <div
      className="main-content flex-1 lg:max-w-[var(--max-content)] relative bg-white dark:bg-black-900 lg:h-full"
    >

      <div className="main-box relative flex flex-col w-full h-full overflow-y-auto p-[16px] lg:p-[32px] !pb-0">
        <div className="flex flex-col flex-1 w-full bg-white shadow-md relative">
          <ChatHistory mode={mode} history={chatHistory} workspace={workspace}/>
        </div>
      </div>
      <PromptInput
        mode={mode}
        workspace={workspace}
        message={message}
        submit={mode === "analyst" ? handleSSH : handleSubmit}
        onChange={handleMessageChange}
        inputDisabled={loadingResponse}
        buttonDisabled={loadingResponse}
      />
    </div>
  );
}
