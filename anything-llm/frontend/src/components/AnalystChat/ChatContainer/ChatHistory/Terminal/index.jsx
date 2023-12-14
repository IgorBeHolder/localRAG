import React, {useEffect, useRef} from "react";
import {Terminal} from "xterm";
import "xterm/css/xterm.css";

const TerminalComponent = () => {
  const terminalRef = useRef(null);

  useEffect(() => {
    const terminal = new Terminal();

    terminal.open(terminalRef.current);

    terminal.onData((data) => {
      console.log("User input:", data);
    });

    return () => {
      terminal.dispose();
    };
  }, []);

  return <div ref={terminalRef}/>;
};

export default TerminalComponent;
