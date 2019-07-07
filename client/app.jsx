import React, { useEffect, useState, Fragment } from "react";
import ReactDOM from "react-dom";
import io from "socket.io-client";

import "./style.sass";
import { SERVER_ENDPOINT } from "./config";
import { CONNECTION_STATUS, SOCKET_EVENTS, EMOJIS } from "./constants";

const App = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [nickname, setNickname] = useState("");
  const [uuid, setUuid] = useState("");
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(
    CONNECTION_STATUS.OFFLINE
  );
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Initializing socket
    _connectSocket();
  }, []);

  function _connectSocket() {
    const socketClient = io(SERVER_ENDPOINT);

    // Connection is established
    socketClient.on(SOCKET_EVENTS.CONNECTION_SUCCESS, ({ users, messages }) => {
      // Initializing messages and users
      setMessages(messages);
      setUsers(users);
    });

    // Handling errors
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

    // User is ready to chat and has a nickname
    socketClient.on(SOCKET_EVENTS.CHAT_WELCOME, newUser => {
      setConnectionStatus(CONNECTION_STATUS.ONLINE);
      console.log("Connection success", newUser);
      setUuid(newUser.uuid);
    });

    //
    socketClient.on(SOCKET_EVENTS.CHAT_MESSAGE, messages => {
      console.log("Messages received", messages);
      setMessages(messages);
    });

    socketClient.open();

    //
    setSocket(socketClient);
  }

  function _isSendBtnDisabled() {
    return !currentMessage.length ? true : false;
  }

  function _handleOnChangeMessage(event) {
    setCurrentMessage(event.target.value);
  }

  function _handleOnChangeNickname(event) {
    setNickname(event.target.value);
  }

  function _handleSubmitMessage() {
    socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, {
      from: {
        uuid,
        nickname
      },
      content: currentMessage.trim()
    });
    setCurrentMessage("");
    event.preventDefault();
  }

  function _handleSubmitNickname() {
    const augmentedNickname = `${nickname} ${
      EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
    }`;
    setNickname(augmentedNickname);
    socket.emit(SOCKET_EVENTS.CHAT_ENTER, augmentedNickname);
    event.preventDefault();
  }

  function _rendermessages() {
    let previousSender = "";
    return messages.map(msg => {
      const augmentedClasses =
        msg.from.uuid === uuid ? "msg-container me" : "msg-container";
      const senderIsDifferent = previousSender !== msg.from.uuid;
      previousSender = msg.from.uuid;
      return (
        <div className={augmentedClasses} key={msg.uuid}>
          {msg.from.uuid !== uuid && senderIsDifferent && (
            <div className="msg-sender">{msg.from.nickname}</div>
          )}
          <div className="msg">{msg.content}</div>
        </div>
      );
    });
  }

  function _isWelcomeSubmitDisabled() {
    return !nickname.length ? true : false;
  }

  function _renderWelcomeModal() {
    return (
      <div className="welcome-modal">
        <div className="welcome-container">
          <h2>Welcome stranger! 👋</h2>
          <p>Tell us who you are and start chatting with other people 🔥</p>
          <form onSubmit={_handleSubmitNickname} action="#">
            <input
              type="text"
              placeholder="What's your name?"
              value={nickname}
              onChange={_handleOnChangeNickname}
            />
            <button
              type="submit"
              className="welcome-submit"
              disabled={_isWelcomeSubmitDisabled()}
            >
              Enter chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      {!uuid && _renderWelcomeModal()}
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
        <div className="msg-feed">{_rendermessages()}</div>
        <div className="input-container">
          <form onSubmit={_handleSubmitMessage} action="#">
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
