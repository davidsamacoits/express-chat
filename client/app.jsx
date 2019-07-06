import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import socketIOClient from "socket.io-client";

import { SERVER_ENDPOINT } from "./config";

const App = props => {
  useEffect(() => {
    // Initializing socket
    const socket = socketIOClient(SERVER_ENDPOINT);
    // socket.on("change color", col => {
    //   document.body.style.backgroundColor = col;
    // });
  });

  return <div> Hello </div>;
};

const root = document.getElementById("root");
ReactDOM.render(<App />, root);
