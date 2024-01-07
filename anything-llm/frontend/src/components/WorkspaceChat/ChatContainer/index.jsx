import React, {useCallback, useEffect, useRef, useState} from "react";
import ChatHistory from "./ChatHistory";
import PromptInput from "./PromptInput";
import Typewriter from "typewriter-effect/dist/core";
import Convert from "ansi-to-html";
import ansiHTML from "ansi-html";
import GraphemeSplitter from "grapheme-splitter";
import Workspace from "../../../models/workspace";
import handleChat from "../../../utils/chat";
import useWebSocket, {ReadyState} from "react-use-websocket";
import {ID_DEV, TYPE_EFFECT_DELAY, TYPE_STRING_DELAY, WS_RECONNECT_ATTEMPTS, WS_URL} from "../../../utils/constants.js";
import {safeTagsReplace} from "../../../utils/functions.js";
import renderMarkdown from "../../../utils/chat/markdown.js";

import Terminal from "terminal-in-react/lib/bundle/terminal-react";

let typeWriterStack = [];

const ansiConverter = new Convert();

const setTypeWriterStack = (arr) => {
  typeWriterStack = [...arr];
}

export default function ChatContainer({workspace, termRoute, isCoder, knownHistory = []}) {
  const [message, setMessage] = useState("");
  const [connStatus, setConnStatus] = useState("");
  const [connAttempt, setConnAttempt] = useState(1);
  const [chatHistory, setChatHistory] = useState(knownHistory);
  const [command, setCommand] = useState("");
  const [termOutput, setTermOutput] = useState([]);

  // const [typeWriterStack, setTypeWriterStack] = useState([]);
  const [typeWriterIsBusy, setTypeWriterIsBusy] = useState(false);
  const [typeWriterRef, setTypeWriterRef] = useState(null);
  const [typeWriterInstance, setTypeWriterInstance] = useState(null);
  const storageKey = `workspace_chat_mode_${workspace.slug}`;
  const [terminalKey, setTerminalKey] = useState(0);
  const terminalRef = useRef();
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

  const resetTypewriter = (arr) => {
    return arr.map((m, mi) => {
      if (m.typeWriter) {
        m.typeWriter = false;
        // m.content = safeTagsReplace(m.content);
      }

      return m;
    })
  }

  const stringSplitter = (string) => {
    const splitter = new GraphemeSplitter();
    return splitter.splitGraphemes(string);
  };

  const twUpdateScroll = (twContainer) => {
    setTimeout(() => {
      twContainer.scrollIntoView({behavior: "smooth", block: "end"});
    }, 10 + TYPE_STRING_DELAY);
  };

  const lastMessageRef = useCallback((ref) => {
    console.log('lastMessageRef', ref);
    if (mode === "analyst") {
      if (ref?.current) {
        const tw = new Typewriter(ref.current, {
          delay: TYPE_EFFECT_DELAY,
          // skipAddStyles: true,
          autoStart: false,
          stringSplitter
        });

        if (typeWriterStack.length) {
          setTypeWriterIsBusy(true);

          typeWriterStack.forEach((s, si) => {
            tw
              .typeString(s + (si === typeWriterStack.length - 1 ? "" : "\n"))
              .callFunction((e) => {
                twUpdateScroll(e.elements.container);
              })
              .pauseFor(TYPE_STRING_DELAY);
          });

          tw
            .callFunction((e) => {
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
      const print = text.split('\n');

      if (typeWriterRef?.current && typeWriterInstance?.state) {
        if (typeWriterIsBusy) {
          console.log('typeWriterIsBusy', typeWriterIsBusy);
          setTypeWriterStack(typeWriterStack.concat(print));
        } else {
          print.forEach(s => {
            typeWriterInstance
              .pauseFor(TYPE_STRING_DELAY)
              .typeString(s)
              .callFunction((e) => {
                twUpdateScroll(e.elements.container);
              });
          });

          typeWriterInstance
            .callFunction((e) => {
              setTypeWriterIsBusy(false);
              setTypeWriterStack([]);
            })
            .start();
        }
      } else {
        console.log('repeat');
        setTypeWriterStack(typeWriterStack.concat(print));
      }
    }
  }, [typeWriterRef, typeWriterInstance, mode, typeWriterStack, typeWriterIsBusy]);

  if (termRoute) {
    const [socketUrl, setSocketUrl] = useState(WS_URL);

    const onWsMessage = useCallback((msg) => {
      let chatResult = JSON.parse(msg.data);
      const htmlText = ansiHTML(chatResult.textResponse);

      const ansiFormattedText = ansiHTML('\x1b[31mThis is \x1b[1mbold\x1b[0m and \x1b[34mblue\x1b[0m text.');

      setTermOutput([...termOutput, ansiFormattedText, htmlText]);

      console.log('onWsMessage', ansiFormattedText, htmlText, chatResult);
    }, [setLoadingResponse, setChatHistory, chatHistory]);

    const {sendMessage, lastMessage, readyState} = useWebSocket(socketUrl, {
      shouldReconnect: (closeEvent) => true,
      share: true,
      reconnectAttempts: WS_RECONNECT_ATTEMPTS,
      onMessage: (msg) => {
        onWsMessage(msg);
      },
      //attemptNumber will be 0 the first time it attempts to reconnect, so this equation results in a reconnect pattern of 1 second, 2 seconds, 4 seconds, 8 seconds, and then caps at 10 seconds until the maximum number of attempts is reached
      reconnectInterval: (attemptNumber) => {
        console.warn("reconnectInterval", attemptNumber);

        if ((attemptNumber + 1) < WS_RECONNECT_ATTEMPTS) {
          setConnAttempt(attemptNumber + 1);
        } else {
          setConnAttempt(WS_RECONNECT_ATTEMPTS);
        }

        Math.min(Math.pow(2, attemptNumber) * 1000, 10000)
      }
    });

    const connectionStatus = {
      [ReadyState.CONNECTING]: "Connecting... attempt: " + connAttempt,
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

  } else if (mode === "analyst" && isCoder) {
    //Public API that will echo messages sent to it back to the client
    const [socketUrl, setSocketUrl] = useState(WS_URL);

    const onWsMessage = useCallback((msg) => {
      let chatResult = JSON.parse(msg.data);
      const typeString = ansiConverter.toHtml(chatResult.textResponse);

      console.log('onWsMessage', typeString, msg, chatHistory, chatResult);

      if (chatResult.error) {
        chatResult.type = "abort";

        const remHistory = resetTypewriter([...chatHistory]);

        let _chatHistory = [...remHistory];

        handleChat(
          chatResult,
          setLoadingResponse,
          setChatHistory,
          remHistory,
          _chatHistory
        );
      } else {
        chatResult.typeWriter = true;
        chatResult.textResponse = [...typeWriterStack, typeString.trim()].join("\n");

        const remHistory = resetTypewriter(chatHistory.slice(0, -1));

        let _chatHistory = [...remHistory];

        console.log("chatResult", chatResult, _chatHistory, typeWriterStack);

        // const prevChatHistory = [
        //   ...resetTypewriter(chatHistory),
        //   {
        //     ...chatResult
        // content: safeTagsReplace(chatResult.textResponse),
        // role: "assistant",
        // typeWriter: false,
        // pending: false,
        // userMessage: message,
        // animate: false
        //   }
        // ];

        // setChatHistory(prevChatHistory);

        // handleChat(
        //   chatResult,
        //   setLoadingResponse,
        //   setChatHistory,
        //   remHistory,
        //   _chatHistory
        // );

        console.log('lastChatMessage', chatHistory, _chatHistory);

        // if (_chatHistory.length) {
        //   let lastChatMessage = _chatHistory[_chatHistory.length - 1];
        //
        //   if (lastChatMessage.role === "assistant") {
        //     _chatHistory[_chatHistory.length - 1].content += ("\n" + chatResult.textResponse);
        //
        //     console.log('lastChatMessage', lastChatMessage, _chatHistory);
        //   } else {
        // handleChat(
        //   chatResult,
        //   setLoadingResponse,
        //   setChatHistory,
        //   remHistory,
        //   _chatHistory
        // );
        // }
        // } else if (chatHistory.length === 1) {
        //   chatResult.textResponse = chatHistory[0].content + "\n" + chatResult.textResponse;
        // }


        handleChat(
          chatResult,
          setLoadingResponse,
          setChatHistory,
          remHistory,
          _chatHistory
        );

        typeMessage(typeString);

        setChatHistory(_chatHistory);
        setLoadingResponse(false);
      }
    }, [setLoadingResponse, setChatHistory, chatHistory]);

    const {sendMessage, lastMessage, readyState} = useWebSocket(socketUrl, {
      shouldReconnect: (closeEvent) => true,
      share: true,
      reconnectAttempts: WS_RECONNECT_ATTEMPTS,
      onMessage: (msg) => {
        onWsMessage(msg);
      },
      //attemptNumber will be 0 the first time it attempts to reconnect, so this equation results in a reconnect pattern of 1 second, 2 seconds, 4 seconds, 8 seconds, and then caps at 10 seconds until the maximum number of attempts is reached
      reconnectInterval: (attemptNumber) => {
        console.log("reconnectInterval", attemptNumber);

        if ((attemptNumber + 1) < WS_RECONNECT_ATTEMPTS) {
          setConnAttempt(attemptNumber + 1);
        } else {
          setConnAttempt(WS_RECONNECT_ATTEMPTS);
        }

        Math.min(Math.pow(2, attemptNumber) * 1000, 10000)
      }
    });

    const connectionStatus = {
      [ReadyState.CONNECTING]: "Connecting... attempt: " + connAttempt,
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

  const sendEnterSSH = useCallback(() => {
    if (mode === "analyst") {
      let chatResult = {
        type: "textResponse",
        textResponse: "> ",
        sources: [],
        error: null,
        close: false,
        typeWriter: true
      };

      const remHistory = resetTypewriter([...chatHistory]);

      let _chatHistory = [...remHistory];

      handleChat(
        chatResult,
        setLoadingResponse,
        setChatHistory,
        remHistory,
        _chatHistory
      );

      setCommand("\n");
    }
  }, [chatHistory]);

  const sendCtrlCSSH = useCallback(() => {
    if (mode === "analyst") {
      let chatResult = {
        type: "textResponse",
        textResponse: "Ctrl+C",
        sources: [],
        error: null,
        close: false,
        typeWriter: true
      };

      const remHistory = resetTypewriter([...chatHistory]);

      let _chatHistory = [...remHistory];

      handleChat(
        chatResult,
        setLoadingResponse,
        setChatHistory,
        remHistory,
        _chatHistory
      );

      setCommand("\x03");
    }
  }, [chatHistory]);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message || message === "") return false;

    console.log('handleSubmit', message, chatHistory);

    if (termRoute) {
      setCommand(message);

      return;
    }

    const prevChatHistory = [
      ...resetTypewriter(chatHistory),
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

  const defaultCommandHandler = useCallback((cmd, print) => {
    // console.log('defaultCommandHandler', cmd);
    setCommand(cmd.join(" "));

    // print(`-PassedThrough:${cmd}: command not found`);
  }, [handleSubmit]);

  return (
    <div
      className={"main-content flex-1 lg:max-w-[var(--max-content)] relative bg-white dark:bg-black-900 lg:h-full" + (termRoute ? " pb-[120px]" : "")}
    >
      {termRoute ?
        <Terminal
          key={"terminal_" + terminalKey}
          ref={terminalRef}
          output={termOutput}
          watchConsoleLogging={true} // todo need a normal function to set text in terminal
          // promptSymbol=">"
          promptSymbol="👉"
          color="green"
          backgroundColor="black"
          barColor="black"
          style={{fontWeight: "bold", fontSize: "1em", minWidth: "400px"}}
          commandPassThrough={defaultCommandHandler}
          commands={{
            popup: () => alert("Terminal in React")
          }}
          descriptions={{
            popup: "alert"
          }}
          msg="You can write anything here. Example - Hello! My name is Foo and I like Bar."
        />
        :
        <div className="main-box relative flex flex-col w-full h-full overflow-y-auto p-[16px] lg:p-[32px] !pb-0">
          <div className="flex flex-col flex-1 w-full bg-white shadow-md relative">
            {
              // mode === "analyst" ?
              // <div ref={analystChat}
              //      className={`flex flex-col w-full flex-grow-1 p-1 md:p-8 lg:p-[50px] relative !pb-[350px]`}/>
              // :

              (ID_DEV && mode === "analyst" && connStatus !== "Open") ?
                <div className="flex flex-col w-full flex-grow-1 p-1 md:p-8 lg:p-[50px]">
                  WS Status: {connStatus}
                </div> :
                <ChatHistory mode={mode} history={chatHistory} workspace={workspace} analyst={mode === "analyst"}
                             lastMessageRef={lastMessageRef}/>
            }
          </div>
        </div>}
      <PromptInput
        analyst={mode === "analyst"}
        resetChatSSH={resetChatSSH}
        sendEnterSSH={sendEnterSSH}
        sendCtrlCSSH={sendCtrlCSSH}
        submit={handleSubmit}
        termRoute={termRoute}
        mode={mode}
        isCoder={isCoder}
        workspace={workspace}
        message={message}
        onChange={handleMessageChange}
        inputDisabled={loadingResponse}
        buttonDisabled={loadingResponse}
      />
    </div>
  );
}
