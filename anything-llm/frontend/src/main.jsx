import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter as Router} from "react-router-dom";
import App from "./App.jsx";
import store from "./store/store.js";
import {Provider} from "react-redux";
import "./index.css";

const isDev = process.env.NODE_ENV !== "production";
const REACTWRAP = isDev ? React.Fragment : React.StrictMode;

ReactDOM.createRoot(document.getElementById("root")).render(
  <REACTWRAP>
    <Router>
      <Provider store={store}>
        <App/>
      </Provider>
    </Router>
  </REACTWRAP>
);
