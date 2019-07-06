import React, { useEffect, useState, Fragment } from "react";
import ReactDOM from "react-dom";
import socketIOClient from "socket.io-client";

import "./style.sass";
import { SERVER_ENDPOINT } from "./config";

const App = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  let socket;
  useEffect(() => {
    // Initializing socket
    socket = socketIOClient(SERVER_ENDPOINT);
    // socket.on("change color", col => {
    //   document.body.style.backgroundColor = col;
    // });
  });

  function _isSendBtnDisabled() {
    return !currentMessage.length ? true : false;
  }

  function _handleOnChangeMessage(event) {
    setCurrentMessage(event.target.value);
  }

  function _handleSubmit() {
    console.log("Message: " + currentMessage);
    socket.emit("chat message", currentMessage);
    setCurrentMessage("");
    event.preventDefault();
  }

  function _rendermessages() {
    return (
      <Fragment>
        <div className="msg">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
          ultrices, leo vitae auctor malesuada, leo leo elementum nisl, sit amet
          tincidunt metus nibh quis nisl.
        </div>
        <div className="msg me">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
          ultrices, leo vitae auctor malesuada, leo leo elementum nisl, sit amet
          tincidunt metus nibh quis nisl.
        </div>
        <div className="msg me">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. 🏈
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <aside>
        <div className="brand">
          <h1>
            Chat
            <span className="accent">Express</span>
          </h1>
        </div>
        <div className="credits">by David Samacoïts-Etchegoin</div>
      </aside>
      <main>
        <header>David 🐨</header>
        <div className="msg-container">{_rendermessages()}</div>
        <div className="input-container">
          <form onSubmit={_handleSubmit}>
            <input
              type="text"
              placeholder="Type a message..."
              value={currentMessage}
              onChange={_handleOnChangeMessage}
            />
            <button
              type="submit"
              className="btn-send"
              disabled={_isSendBtnDisabled()}
            >
              <i className="material-icons">send</i>
            </button>
          </form>
        </div>
      </main>
    </Fragment>
  );
};

const root = document.getElementById("root");
ReactDOM.render(<App />, root);
