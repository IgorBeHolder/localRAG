import {useCallback, useEffect, useState} from "react";
import ChatHistory from "./ChatHistory";
import PromptInput from "./PromptInput";
import Typewriter from 'typewriter-effect/dist/core';
import Workspace from "../../../models/workspace";
import handleChat from "../../../utils/chat";
import useWebSocket, {ReadyState} from "react-use-websocket";
import {TYPE_EFFECT_DELAY, TYPE_STRING_DELAY, WS_URL} from "../../../utils/constants.js";
import {safeTagsReplace} from "../../../utils/functions.js";
import renderMarkdown from "../../../utils/chat/markdown.js";

export default function ChatContainer({workspace, isCoder, knownHistory = []}) {
  const [message, setMessage] = useState("");
  const [connStatus, setConnStatus] = useState("");
  const [chatHistory, setChatHistory] = useState(knownHistory);
  const [command, setCommand] = useState("");
  const [typeWriterStack, setTypeWriterStack] = useState([]);
  const [typeWriterIsBusy, setTypeWriterIsBusy] = useState(false);
  const [typeWriterRef, setTypeWriterRef] = useState(null);
  const [typeWriterInstance, setTypeWriterInstance] = useState(null);
  const storageKey = `workspace_chat_mode_${workspace.slug}`;

  let mode = window.localStorage.getItem(storageKey);

  const setQueryMode = () => {
    mode = "query";
    window.localStorage.setItem(storageKey, mode);
  }

  if (mode === "analyst") {
    if (!isCoder) {
      setQueryMode();
    }

    if (!window.location.pathname.startsWith('/analyst/')) {
      setQueryMode();
      window.location = "/workspace/" + workspace.slug;
    }
  }

  const [loadingResponse, setLoadingResponse] = useState(mode === "analyst");
  const [newWsMessage, setNewWsMessage] = useState(false);

  const lastMessageRef = useCallback((ref) => {
    console.log('lastMessageRef', ref);
    if (mode === "analyst") {
      if (ref?.current) {
        const tw = new Typewriter(ref.current, {
          delay: TYPE_EFFECT_DELAY,
          autoStart: false
        });

        if (typeWriterStack.length) {
          typeWriterStack.forEach(str => {
            tw
              .typeString((str))
              .pauseFor(TYPE_STRING_DELAY);
          });

          setTypeWriterIsBusy(true);

          tw
            .callFunction((e) => {
              console.log('callFunction', e);
              setTypeWriterIsBusy(false);
              setTypeWriterStack([]);
            })
            .start();
        }

        setTypeWriterRef(ref);
        setTypeWriterInstance(tw);
      }
    }
  }, [mode, typeWriterStack, typeWriterIsBusy]);

  const typeMessage = useCallback((text) => {
    console.log('typeMessage', typeWriterRef, typeWriterInstance?.state.elements.container, text);
    if (mode === "analyst") {
      if (typeWriterRef?.current && typeWriterInstance?.state) {
        if (typeWriterIsBusy) {
          console.log('typeWriterIsBusy', typeWriterIsBusy);
          debugger;
        } else {
          typeWriterInstance
            .pauseFor(100)
            .typeString(text)
            .start();
        }
      } else {
        console.log('repeat');
        setTypeWriterStack(typeWriterStack.concat(text));
      }
    }
  }, [typeWriterRef, typeWriterInstance, mode, typeWriterStack, typeWriterIsBusy]);

  if (mode === "analyst" && isCoder) {
    //Public API that will echo messages sent to it back to the client
    const [socketUrl, setSocketUrl] = useState(WS_URL);

    const onWsMessage = useCallback((msg) => {
      console.log('onWsMessage', msg, chatHistory);

      const remHistory = (chatHistory.length > 0 ? chatHistory.slice(0, -1) : []).map((m, mi) => {
        if (m.typeWriter) {
          m.typeWriter = false;
          m.content = safeTagsReplace(m.content);
        }

        return m;
      });

      let _chatHistory = [...remHistory];

      let chatResult = JSON.parse(msg.data);

      chatResult.typeWriter = true;
      chatResult.textResponse = (chatResult.textResponse.trim());

      console.log("chatResult", chatResult, _chatHistory);

      if (_chatHistory.length) {
        let lastChatMessage = _chatHistory[_chatHistory.length - 1];

        if (lastChatMessage.role === "assistant") {
          _chatHistory[_chatHistory.length - 1].content += safeTagsReplace(chatResult.textResponse);

          console.log('lastChatMessage', lastChatMessage, _chatHistory);
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

      typeMessage(((chatResult.textResponse)));

      setChatHistory(_chatHistory);
      setLoadingResponse(false);
    }, [setLoadingResponse, setChatHistory, chatHistory, typeWriterRef, typeWriterInstance]);

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

    useEffect(() => {
      setConnStatus(connectionStatus);
    }, [connectionStatus]);
  } else {
    useEffect(() => {
      const promptMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;

      async function fetchReply() {
        return await Workspace.sendChat(
          workspace,
          promptMessage.userMessage,
          mode ?? "query"
        );
      }

      if (loadingResponse && mode !== "analyst") {
        fetchReply().then(chatResult => {
          const remHistory = chatHistory.length > 0 ? chatHistory.slice(0, -1) : [];
          let _chatHistory = [...remHistory];

          if (!promptMessage || !promptMessage?.userMessage) {
            setLoadingResponse(false);
            return false;
          }

          handleChat(
            chatResult,
            setLoadingResponse,
            setChatHistory,
            remHistory,
            _chatHistory
          );
        });
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
      {/*{mode === "analyst" && connStatus ? <div className="absolute top-0 left-0 z-10 bg-white p-2">*/}
      {/*  WS Status: {connStatus}*/}
      {/*</div> : null}*/}
      <div className="main-box relative flex flex-col w-full h-full overflow-y-auto p-[16px] lg:p-[32px] !pb-0">
        <div className="flex flex-col flex-1 w-full bg-white shadow-md relative">
          {
            // mode === "analyst" ?
            // <div ref={analystChat}
            //      className={`flex flex-col w-full flex-grow-1 p-1 md:p-8 lg:p-[50px] relative !pb-[350px]`}/>
            // :
            <ChatHistory mode={mode} history={chatHistory} workspace={workspace} analyst={mode === "analyst"}
                         lastMessageRef={lastMessageRef}/>
          }
        </div>
      </div>
      <PromptInput
        analyst={mode === "analyst"}
        resetChatSSH={resetChatSSH}
        mode={mode}
        isCoder={isCoder}
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
