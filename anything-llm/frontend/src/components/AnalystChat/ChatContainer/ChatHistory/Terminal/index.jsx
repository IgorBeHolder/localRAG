import React, {useEffect, useRef, useCallback, useState} from "react";
import {ReactTerminal} from "react-terminal";
import {getTimeAgo} from "../../../../../utils/functions.js";
import useWebSocket, {ReadyState} from "react-use-websocket";
import {WS_URL} from "../../../../../utils/constants.js";
import Terminal from "terminal-in-react/lib/bundle/terminal-react";
//import {Terminal} from "xterm";
//import "xterm/css/xterm.css";

const TerminalComponent = ({handleSubmit}) => {
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

  const {sendMessage, lastMessage, readyState} = useWebSocket(socketUrl);

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

      if (response.error) {
        if (response.error.code === 127) {
          console.log(response.error.text);
        } else {
          console.log("SSH SENT NON ZERO RESPONSE", response);
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

  useEffect(() => {
    sendCommand();
  }, [command]);

  const showMsg = () => "Hello World"

  return <div
    style={{
      display: "flex",
      alignItems: "center",
      height: "calc(100vh - 200px)",
      width: "100%"
    }}
  >
    <Terminal
      ref={terminalRef}
      watchConsoleLogging={true}
      promptSymbol=">"
      color="green"
      backgroundColor="black"
      barColor="black"
      style={{fontWeight: "bold", fontSize: "1em"}}
      commandPassThrough={defaultCommandHandler}
      commands={{
        popup: () => alert("Terminal in React")
      }}
      descriptions={{
        popup: "alert"
      }}
      msg="You can write anything here. Example - Hello! My name is Foo and I like Bar."
    />
  </div>
};

export default TerminalComponent;
