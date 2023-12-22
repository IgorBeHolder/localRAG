import {useState, useEffect, useCallback} from "react";
import ChatHistory from "./ChatHistory";
import PromptInput from "./PromptInput";
import Workspace from "../../../models/workspace";
import handleChat from "../../../utils/chat";
import useWebSocket, {ReadyState} from "react-use-websocket";
import {WS_URL} from "../../../utils/constants.js";
import {safeTagsReplace} from "../../../utils/functions.js";

export default function ChatContainer({workspace, knownHistory = []}) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState(knownHistory);
  const [command, setCommand] = useState("");

  const storageKey = `workspace_chat_mode_${workspace.slug}`;

  const mode = window.localStorage.getItem(storageKey);

  const [loadingResponse, setLoadingResponse] = useState(mode === "analyst");
  const [newWsMessage, setNewWsMessage] = useState(false);

  if (mode === "analyst") {
    //Public API that will echo messages sent to it back to the client
    const [socketUrl, setSocketUrl] = useState(WS_URL);
    const [messageHistory, setMessageHistory] = useState([]);

    const onWsMessage = useCallback((msg) => {
      // setNewWsMessage(false);

      console.log('onWsMessage', msg, chatHistory);

      const remHistory = (chatHistory.length > 0 ? chatHistory.slice(0, -1) : []).map(m => {
        m.typeWriter = false;
        m.content = safeTagsReplace(m.content);
        return m;
      });

      let _chatHistory = [...remHistory];

      let chatResult = JSON.parse(msg.data);

      chatResult.typeWriter = true;
      chatResult.textResponse = chatResult.textResponse.trim();

      console.log("chatResult", chatResult, _chatHistory);

      if (_chatHistory.length) {
        let lastMessage = _chatHistory[_chatHistory.length - 1];

        if (lastMessage.role !== "user") {
          _chatHistory[_chatHistory.length - 1].content += chatResult.textResponse;

          console.log('lastMessage', lastMessage, _chatHistory);
        } else {
          handleChat(
            chatResult,
            setLoadingResponse,
            setChatHistory,
            remHistory,
            _chatHistory
          );
        }
      } else {
        handleChat(
          chatResult,
          setLoadingResponse,
          setChatHistory,
          remHistory,
          _chatHistory
        );
      }

      setChatHistory(_chatHistory);
      setLoadingResponse(false);
    }, [setLoadingResponse, setChatHistory, chatHistory]);

    const {sendMessage, lastMessage, readyState} = useWebSocket(socketUrl, {
      shouldReconnect: (closeEvent) => true,
      share: true,
      reconnectAttempts: 10,
      onMessage: (msg) => {
        onWsMessage(msg);
      },
      //attemptNumber will be 0 the first time it attempts to reconnect, so this equation results in a reconnect pattern of 1 second, 2 seconds, 4 seconds, 8 seconds, and then caps at 10 seconds until the maximum number of attempts is reached
      reconnectInterval: (attemptNumber) => {
        console.log("reconnectInterval", attemptNumber);
        Math.min(Math.pow(2, attemptNumber) * 1000, 10000)
      }
    });

    const connectionStatus = {
      [ReadyState.CONNECTING]: "Connecting",
      [ReadyState.OPEN]: "Open",
      [ReadyState.CLOSING]: "Closing",
      [ReadyState.CLOSED]: "Closed",
      [ReadyState.UNINSTANTIATED]: "Uninstantiated"
    }[readyState];

    const sendCommand = useCallback(() => {
      if (connectionStatus === "Open") {
        sendMessage(command);
      }
    }, [command, connectionStatus, sendMessage]);

    useEffect(() => {
      sendCommand();
    }, [command]);

  } else {
    useEffect(() => {
      async function fetchReply() {
        console.log("fetchReply", mode);
        if (mode === "analyst") {
          //sendCommand();
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

          console.log("chatResult", chatResult);

          handleChat(
            chatResult,
            setLoadingResponse,
            setChatHistory,
            remHistory,
            _chatHistory
          );
        }
      }

      if (loadingResponse) {
        fetchReply();
      }
    }, [loadingResponse, chatHistory, workspace, mode]);
  }

  const resetChatSSH = () => {
    if (mode === "analyst") {
      setCommand("%reset\n");
    }
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message || message === "") return false;

    console.log('handleSubmit', message, chatHistory);

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

    if (mode === "analyst") {
      setNewWsMessage(true);
      setCommand(message);
    } else {
      setLoadingResponse(true);
    }
  };

  return (
    <div
      className="main-content flex-1 lg:max-w-[var(--max-content)] relative bg-white dark:bg-black-900 lg:h-full"
    >
      <div className="main-box relative flex flex-col w-full h-full overflow-y-auto p-[16px] lg:p-[32px] !pb-0">
        <div className="flex flex-col flex-1 w-full bg-white shadow-md relative">
          <ChatHistory mode={mode} history={chatHistory} workspace={workspace} analyst={mode === "analyst"}/>
        </div>
      </div>
      <PromptInput
        analyst={mode === "analyst"}
        resetChatSSH={resetChatSSH}
        mode={mode}
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
      setCommand(message);
    } else {
      setLoadingResponse(true);
    }
  };

  return (
    <div
      className="main-content flex-1 lg:max-w-[var(--max-content)] relative bg-white dark:bg-black-900 lg:h-full"
    >
      {/*{mode === "analyst" && connStatus ? <div className="absolute top-0 left-0 z-10 bg-white p-2">*/}
      {/*  WS Status: {connStatus}*/}
      {/*</div> : null}*/}
      <div className="main-box relative flex flex-col w-full h-full overflow-y-auto p-[16px] lg:p-[32px] !pb-0">
        <div className="flex flex-col flex-1 w-full bg-white shadow-md relative">
          <ChatHistory mode={mode} history={chatHistory} workspace={workspace} analyst={mode === "analyst"}/>
        </div>
      </div>
      <PromptInput
        analyst={mode === "analyst"}
        resetChatSSH={resetChatSSH}
        mode={mode}
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
