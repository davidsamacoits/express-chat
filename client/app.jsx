import React, { useEffect, useState, Fragment } from "react";
import ReactDOM from "react-dom";
import io from "socket.io-client";

import "./style.sass";
import { SERVER_ENDPOINT } from "./config";
import { CONNECTION_STATUS, SOCKET_EVENTS } from "./constants";

const App = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(
    CONNECTION_STATUS.OFFLINE
  );

  useEffect(() => {
    // Initializing socket
    _connectSocket();
  }, []);

  function _connectSocket() {
    const socketClient = io(SERVER_ENDPOINT);
    socketClient.on(SOCKET_EVENTS.CONNECT, () => {
      setConnectionStatus(CONNECTION_STATUS.ONLINE);
      console.log("Connected");
    });
    socketClient.on(SOCKET_EVENTS.DISCONNECT, () => {
      setConnectionStatus(CONNECTION_STATUS.OFFLINE);
      console.log("Disconnected");
    });
    socketClient.on(SOCKET_EVENTS.CONNECT_ERROR, () => {
      setConnectionStatus(CONNECTION_STATUS.OFFLINE);
      console.log("Connection error");
    });
    socketClient.on(SOCKET_EVENTS.CONNECT_FAILED, () => {
      setConnectionStatus(CONNECTION_STATUS.OFFLINE);
      console.log("Connection failed");
    });
    socketClient.open();
    setSocket(socketClient);
  }

  function _isSendBtnDisabled() {
    return !currentMessage.length ? true : false;
  }

  function _handleOnChangeMessage(event) {
    setCurrentMessage(event.target.value);
  }

  function _handleSubmit() {
    socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, currentMessage);
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
