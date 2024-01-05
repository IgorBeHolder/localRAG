import React, {useEffect, useRef} from 'react';
import {Terminal} from 'xterm';
import {AttachAddon} from 'xterm-addon-attach';
import {FitAddon} from 'xterm-addon-fit';
// import * as ssh2 from 'ssh2';

import 'xterm/css/xterm.css';
import useWebSocket, {ReadyState} from "react-use-websocket";
import {WS_RECONNECT_ATTEMPTS, WS_URL} from "../../../../../utils/constants.js";

const SSH_HOST = process.env.SSH_HOST || "coder";
const SSH_PORT = process.env.SSH_PORT || 22;

const SSHTerminal = () => {
  const terminalRef = useRef(null);
  const term = new Terminal({
    cols: 100,
    cursorBlink: true,
    rows: 120
  });
  const fitAddonRef = useRef(new FitAddon());

  const socket = new WebSocket(WS_URL);

  socket.addEventListener('open', (event) => {
    console.warn('WebSocket connection opened');

    const attachAddon = new AttachAddon(socket);
    term.loadAddon(attachAddon);

    // Отправка сообщения на сервер
    // socket.send('Hello, server!');
  });

  socket.addEventListener('message', (event) => {
    console.warn(`Message from server: ${event.data}`);
    // Обработка полученных данных от сервера
  });

  socket.addEventListener('close', (event) => {
    console.warn('WebSocket connection closed');
  });

  // const {sendMessage, lastMessage, readyState, getWebSocket} = useWebSocket(WS_URL, {
  //   shouldReconnect: (closeEvent) => true,
  //   share: true,
  //   reconnectAttempts: WS_RECONNECT_ATTEMPTS,
  //   onMessage: (msg) => {
  //     console.warn('onMessage', msg);
  //   },
  //   //attemptNumber will be 0 the first time it attempts to reconnect, so this equation results in a reconnect pattern of 1 second, 2 seconds, 4 seconds, 8 seconds, and then caps at 10 seconds until the maximum number of attempts is reached
  //   reconnectInterval: (attemptNumber) => {
  //     console.warn("reconnectInterval", attemptNumber);
  //
  //     Math.min(Math.pow(2, attemptNumber) * 1000, 10000)
  //   }
  // });
  //
  // const connectionStatus = {
  //   [ReadyState.CONNECTING]: "Connecting...",
  //   [ReadyState.OPEN]: "Open",
  //   [ReadyState.CLOSING]: "Closing",
  //   [ReadyState.CLOSED]: "Closed",
  //   [ReadyState.UNINSTANTIATED]: "Uninstantiated"
  // }[readyState];

  // console.warn('connectionStatus', connectionStatus);

  useEffect(() => {
    term.loadAddon(fitAddonRef.current);

    // const connectSSH = () => {
    //   const conn = new ssh2.Client();
    //
    //   conn.on('ready', () => {
    //     conn.shell({term: 'xterm-256color'}, (err, stream) => {
    //       if (err) throw err;
    //       term.attach(stream);
    //       term.focus();
    //
    //       fitAddonRef.current.fit();
    //     });
    //   });
    //
    //   conn.connect({
    //     host: SSH_HOST,
    //     port: SSH_PORT,
    //     username: "coder",
    //     password: "coder"
    //   });
    // };

    term.open(terminalRef.current);

    term.onKey(({key, domEvent}) => {
      console.log('onKey', key, domEvent);
      console.log(key.charCodeAt(0));
      if (key.charCodeAt(0) == 13) {
        term.write('\n');


      } else {
        term.write(key);
      }
    });

    // Если вы хотите подключаться к SSH сразу после загрузки компонента, раскомментируйте следующую строку:
    // connectSSH();

    return () => {
      term.dispose();
    };
  }, []);

  // useEffect(() => {
  //   console.warn('lastMessage', lastMessage);
  //   if (typeof getWebSocket === 'function' && term && connectionStatus === "Open") {
  //     const ws = getWebSocket();
  //     console.warn('getWebSocket', ws, term);
  //
  //     const attachAddon = new AttachAddon(ws);
  //     term.loadAddon(attachAddon);
  //   }
  // }, [getWebSocket, lastMessage, connectionStatus, term]);

  return <div ref={terminalRef}/>;
};

export default SSHTerminal;
