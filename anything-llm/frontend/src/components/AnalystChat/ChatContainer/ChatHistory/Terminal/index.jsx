import React, {useEffect, useRef, useCallback, useState} from "react";
import useWebSocket, {ReadyState} from "react-use-websocket";
import {WS_URL} from "../../../../../utils/constants.js";
import Terminal from "terminal-in-react/lib/bundle/terminal-react";
import {showModal} from "../../../../../store/popupSlice.js";
import {useDispatch} from "react-redux";
import {Menu} from "react-feather";

const TerminalComponent = ({handleSubmit, toggleMenu, setTextCommand, children}) => {
  const dispatch = useDispatch();
  const [terminalKey, setTerminalKey] = useState(0);
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("");
  const terminalRef = useRef();

  const printText = (text) => {
    console.warn(text);
    //terminalRef.current.pushToStdout(text);
  };

  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState(WS_URL);
  const [messageHistory, setMessageHistory] = useState([]);

  const {sendMessage, lastMessage, readyState} = useWebSocket(socketUrl, {
    shouldReconnect: (closeEvent) => true,
    reconnectAttempts: 10,
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

  useEffect(() => {
    if (lastMessage !== null) {
      setOutput(lastMessage.data);
      setMessageHistory((prev) => prev.concat(lastMessage.data));
    }
  }, [lastMessage, setMessageHistory]);

  const sendCommand = useCallback(() => {
    if (connectionStatus === "Open") {
      sendMessage(command);
    }
  }, [command, connectionStatus, sendMessage]);

  const defaultCommandHandler = useCallback((cmd) => {
    setCommand(cmd.join(" "));
  }, [handleSubmit]);

  useEffect(() => {
    if (output) {
      const response = JSON.parse(output);

      // console.log("terminalRef", terminalRef, output);

      if (response.error) {
        if (response.error.code === 127) {
          console.log(response.error.text);
        } else {
          console.warn("SSH SENT NON ZERO RESPONSE", response);
        }
      } else {
        const lines = response.textResponse.split("\n").filter((l, li) => {
          return l.length && !(li && l.trim() === ">");
        });

        console.log(lines.join("\n"));

        //lines.forEach(l => {
        //  printText(l);
        //});
      }
    }
  }, [output]);

  const uploadFile = () => {
    dispatch(showModal("modalCoderWorkspace"));
  };
  const resetChat = () => {
    if (!window.confirm(`Сбросить историю диалога?`)) {
      return false;
    }
    setTerminalKey(terminalKey + 1);
  };
  const openFile = () => {
    console.log("openFile");
  };
  const closeChat = () => {
    setTextCommand("/query");
  };

  useEffect(() => {
    sendCommand();
  }, [command]);

  useEffect(() => {
    if (terminalKey) {
      setCommand("%reset");
    }
  }, [terminalKey]);

  return <div className={"flex flex-col align-center w-full min-h-[300px]"}
              style={{height: "calc(100vh - 170px)"}}>
    <div className={"grow overflow-y-auto"}>

      {connectionStatus === 'Open' ? <Terminal
        key={"terminal_" + terminalKey}
        ref={terminalRef}
        watchConsoleLogging={true} // todo need a normal function to set text in terminal
        promptSymbol=">"
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
      /> : <span>WS Status: {connectionStatus}</span>}
    </div>

    <div className="ssh-controls relative flex flex-wrap justify-center p-2 lg:py-4 gap-2 lg:gap-4 whitespace-nowrap">
      {children}
      <button
        onClick={() => {
          toggleMenu();
        }}
        type="button"
        className="p-2 text-slate-500 bg-transparent rounded-md hover:bg-gray-200 dark:hover:bg-stone-500 dark:hover:text-slate-200"
      >
        <Menu className="w-4 h-4 md:h-6 md:w-6"/>
      </button>

      <button
        onClick={() => {
          uploadFile();
        }}
        type="button"
        className="p-2 text-slate-500 bg-transparent rounded-md hover:bg-gray-200 dark:hover:bg-stone-500 dark:hover:text-slate-200"
      >
        <span>Загрузить файл</span>
      </button>
      <button
        onClick={() => {
          resetChat();
        }}
        type="button"
        className="p-2 text-slate-500 bg-transparent rounded-md hover:bg-gray-200 dark:hover:bg-stone-500 dark:hover:text-slate-200"
      >
        <span>Сброс чата</span>
      </button>
      <button
        onClick={() => {
          openFile();
        }}
        type="button"
        className="p-2 text-slate-500 bg-transparent rounded-md hover:bg-gray-200 dark:hover:bg-stone-500 dark:hover:text-slate-200"
      >
        <span>Открыть файл</span>
      </button>
      <button
        onClick={() => {
          closeChat();
        }}
        type="button"
        className="p-2 text-slate-500 bg-transparent rounded-md hover:bg-gray-200 dark:hover:bg-stone-500 dark:hover:text-slate-200"
      >
        <span>Закрыть</span>
      </button>
    </div>
  </div>
};

export default TerminalComponent;
