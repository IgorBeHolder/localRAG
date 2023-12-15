import React, {useEffect, useRef, useCallback, useState} from "react";
import {ReactTerminal} from "react-terminal";
import {getTimeAgo} from "../../../../../utils/functions.js";
import useWebSocket, {ReadyState} from "react-use-websocket";
import {WS_URL} from "../../../../../utils/constants.js";
import Terminal from "terminal-in-react/lib/bundle/terminal-react";
//import {Terminal} from "xterm";
//import "xterm/css/xterm.css";

const TerminalComponent = ({handleSubmit}) => {
  const [message, setMessage] = useState(null);
  const [from, setFrom] = useState(null);
  const [email, setEmail] = useState(null);
  const [sent, setSent] = useState(false);
  const [promptSymbol, setPromptSymbol] = useState("$");
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("");
  const [ws, setWs] = useState(null);
  const terminalRef = useRef();

  useEffect(() => {
    // Устанавливаем WebSocket-соединение
    const newWs = new WebSocket(WS_URL);
    setWs(newWs);

    newWs.onopen = () => {
      console.warn("WebSocket connection opened.");
    };

    newWs.onmessage = (event) => {
      console.warn("onmessage", event.data);
      if (event.data.trim() === ">") {
        setPromptSymbol(">");
      }

      setOutput(event.data);
    };

    newWs.onclose = () => {
      console.warn("WebSocket connection closed.");
    };

    // Очищаем ресурсы при размонтировании компонента
    return () => {
      newWs.close();
    };
  }, []);

  const printText = (text) => {
    console.warn(text);
    //terminalRef.current.pushToStdout(text);
  };

  const sendCommand = useCallback(() => {
    //console.log("sendCommand", command);
    // Отправляем команду на сервер через WebSocket
    if (ws && ws.readyState === WebSocket.OPEN && command) {
      ws.send(command);
    }
  }, [command]);

  //Public API that will echo messages sent to it back to the client
  //const [socketUrl, setSocketUrl] = useState(WS_URL);
  //const [messageHistory, setMessageHistory] = useState([]);
  //
  //const {sendMessage, lastMessage, readyState} = useWebSocket(socketUrl);
  //
  //useEffect(() => {
  //  if (lastMessage !== null) {
  //    setMessageHistory((prev) => prev.concat(lastMessage));
  //
  //    console.log("lastMessage", lastMessage);
  //
  //    handleSubmit(lastMessage);
  //  }
  //}, [lastMessage, setMessageHistory]);
  //
  //const handleClickSendMessage = useCallback((msg) => sendMessage(msg), []);
  //
  //const connectionStatus = {
  //  [ReadyState.CONNECTING]: "Connecting",
  //  [ReadyState.OPEN]: "Open",
  //  [ReadyState.CLOSING]: "Closing",
  //  [ReadyState.CLOSED]: "Closed",
  //  [ReadyState.UNINSTANTIATED]: "Uninstantiated"
  //}[readyState];

  const defaultCommandHandler = useCallback((cmd) => {
    //console.log("defaultCommandHandler", cmd.join(" "));

    setCommand(cmd.join(" "));
  }, [handleSubmit]);

  useEffect(() => {
    if (output) {
      const response = JSON.parse(output);

      //console.log("response", response);

      if (response.error) {
        if (response.error.code === 127) {
          console.log(response.error.text);
        } else {
          console.log("SSH SENT NON ZERO RESPONSE", response);
        }
      } else {
        const lines = response.textResponse.split("\n").filter((l, li) => {
          return !(li && l.trim() === ">");
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
      promptSymbol={promptSymbol}
      color="green"
      backgroundColor="black"
      barColor="black"
      style={{fontWeight: "bold", fontSize: "1em"}}
      commandPassThrough={defaultCommandHandler}
      commands={{
        "open-google": () => window.open("https://www.google.com/", "_blank"),
        showmsg: showMsg,
        popup: () => alert("Terminal in React")
      }}
      descriptions={{
        "open-google": "opens google.com",
        showmsg: "shows a message",
        alert: "alert", popup: "alert"
      }}
      msg="You can write anything here. Example - Hello! My name is Foo and I like Bar."
    />
  </div>
};

export default TerminalComponent;
