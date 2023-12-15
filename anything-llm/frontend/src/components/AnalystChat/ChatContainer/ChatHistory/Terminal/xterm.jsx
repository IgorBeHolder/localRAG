import React, {useEffect, useRef, useCallback, useState} from "react";
import {ReactTerminal} from "react-terminal";
import {getTimeAgo} from "../../../../../utils/functions.js";
import useWebSocket, {ReadyState} from "react-use-websocket";
import {WS_URL} from "../../../../../utils/constants.js";
import {XTerm} from "xterm-for-react";
import {Terminal} from "xterm";
import {SerializeAddon} from "@xterm/addon-serialize";

import "xterm/css/xterm.css";

const TerminalComponent = ({handleSubmit}) => {
  const serializeAddon = new SerializeAddon();

  const [message, setMessage] = useState(null);
  const [from, setFrom] = useState(null);
  const [email, setEmail] = useState(null);
  const [sent, setSent] = useState(false);
  const [theme, setTheme] = useState("portfolio");

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
    console.log("defaultCommandHandler", cmd);

    if (typeof handleSubmit === "function") {
      handleSubmit(cmd);
    }
  }, [handleSubmit]);

  const terminalRef = useRef(null);
  const terminal = useRef(null);
  const xtermRef = useRef(null);

  //const onKey = (e) => {
  //  const printable = !e.domEvent.altKey && !e.domEvent.ctrlKey && !e.domEvent.metaKey;
  //
  //  console.log("onKey", printable, e);
  //
  //  if (e.domEvent.code === "Enter" && e.domEvent.shiftKey) { // Shift + Enter
  //    // Добавляем новую строку
  //    //terminal.current.write("\r\n");
  //  } else if (e.domEvent.code === "Enter") { // Enter
  //    // Выполнение команды
  //    //const command = terminal.current.buffer.getLines(terminal.current.buffer.baseY).translateToString();
  //    console.log("Выполняется команда:");
  //
  //    // Очищаем введённые данные после Enter
  //    //terminal.current.reset();
  //  } else if (e.domEvent.code === "Backspace") { // Backspace
  //    // Удаляем последний символ
  //    //terminal.current.write("\b \b");
  //  } else if (printable) {
  //    // Печать видимых символов
  //    //terminal.current.write(e.key);
  //  }
  //}
  //
  //const onData = (e) => {
  //  console.log("onData", e);
  //}

  useEffect(() => {
    terminal.current = new Terminal({rows: 10});
    terminal.current.loadAddon(serializeAddon);

    // Устанавливаем размеры терминала
    terminal.current.open(terminalRef.current);

    // Добавляем событие на ввод данных (нажатие клавиш)
    terminal.current.onKey((e) => {
      const printable = !e.domEvent.altKey && !e.domEvent.ctrlKey && !e.domEvent.metaKey;
      //e.domEvent.preventDefault();

      console.log("onKey", e);

      if (e.domEvent.code === "Enter" && e.domEvent.shiftKey) { // Shift + Enter
        // Добавляем новую строку
        terminal.current.write("\r\n");
      } else if (e.domEvent.code === "Enter") { // Enter
        // Выполнение команды
        //const command = terminal.current.buffer.getLines(terminal.current.buffer.baseY).translateToString();
        const command = serializeAddon.serialize();
        console.log("Выполняется команда:", command);

        defaultCommandHandler(command);

        // Очищаем введённые данные после Enter
        terminal.current.reset();
      } else if (e.domEvent.code === "Delete") {
        const cursor = terminal.current.buffer.active.cursorX;

        console.log("cursor", terminal.current);

        //const line = terminal.current._core.buffer.lines.get(terminal.current.buffer.active.cursorY);
        //
        //if (cursor < line.length) {
        //  line.splice(cursor, 1);
        //  terminal.current.refresh(0, terminal.current.rows - 1);
        //}
      } else if (e.domEvent.code === "Backspace") { // Backspace
        // Удаляем последний символ
        terminal.current.write("\b \b");
      } else if (printable) {
        // Печать видимых символов
        terminal.current.write(e.key);
      }
    });

    //terminal.current.onData((e) => {
    //  console.log("onData", e);
    //});

    return () => {
      // Очистка ресурсов при размонтировании компонента
      terminal.current.dispose();
    };
  }, []);

  //return <XTerm ref={xtermRef}
  //              onKey={onKey}
  //              onData={onData}
  ///>;

  return <div ref={terminalRef}/>;
};

export default TerminalComponent;
