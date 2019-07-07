import React, { useEffect, useState, Fragment, useRef } from "react";
import ReactDOM from "react-dom";
import io from "socket.io-client";

import "./style.sass";
import { SERVER_ENDPOINT } from "./config";
import { CONNECTION_STATUS, SOCKET_EVENTS, EMOJIS } from "./constants";

const App = () => {
  const messagesEndRef = useRef(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [nickname, setNickname] = useState("");
  const [uuid, setUuid] = useState("");
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(
    CONNECTION_STATUS.OFFLINE
  );
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    // Initializing socket
    _connectSocket();
  }, []);

  useEffect(_scrollToBottom, [messages, typing]);

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
      setUuid(newUser.uuid);
    });

    // New user arrived, updating list
    socketClient.on(SOCKET_EVENTS.CHAT_USERS, users => {
      setUsers(users);
    });

    // Receiving a message
    socketClient.on(SOCKET_EVENTS.CHAT_MESSAGE, newMsg => {
      setMessages(messages => messages.concat(newMsg));
    });

    // Handeling typing
    socketClient.on(SOCKET_EVENTS.CHAT_TYPING, () => {
      setTyping(true);
    });
    socketClient.on(SOCKET_EVENTS.CHAT_IDLE, () => {
      setTyping(false);
    });

    socketClient.open();
    setSocket(socketClient);
  }

  function _renderConnectionStatus() {
    return (
      <Fragment>
        <p className="server-title">📡 Server status</p>
        <code className="server-url">{SERVER_ENDPOINT}</code>
        <p className="server-status">
          <span className={connectionStatus.toLowerCase()} />
          {connectionStatus}
        </p>
      </Fragment>
    );
  }

  function _renderUsersList() {
    const usersLength = users.length;
    return users.map((user, i) => {
      if (usersLength === i + 1) {
        return user.nickname;
      } else {
        return `${user.nickname}, `;
      }
    });
  }

  function _scrollToBottom() {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }

  function _isSendBtnDisabled() {
    return !currentMessage.length ? true : false;
  }

  function _handleOnChangeMessage(event) {
    if (event.target.value === "") {
      socket.emit(SOCKET_EVENTS.CHAT_STOP_TYPING);
    } else {
      socket.emit(SOCKET_EVENTS.CHAT_IS_TYPING);
    }
    setCurrentMessage(event.target.value);
  }

  function _handleOnChangeNickname(event) {
    setNickname(event.target.value);
  }

  function _handleSubmitMessage() {
    if (currentMessage.trim().length !== 0) {
      socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, {
        from: {
          uuid,
          nickname
        },
        content: currentMessage.trim()
      });
      socket.emit(SOCKET_EVENTS.CHAT_STOP_TYPING);
      setCurrentMessage("");
    }
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

  function _renderIsTyping() {
    return (
      <div className="msg-container">
        <div className="msg">
          <svg width="20px" height="6px" viewBox="0 0 128 32">
            <circle
              fill="#494e58"
              fillOpacity="1"
              cx="0"
              cy="0"
              r="11"
              transform="translate(16 16)"
            >
              <animateTransform
                attributeName="transform"
                type="scale"
                additive="sum"
                values="1;1.42;1;1;1;1;1;1;1;1"
                dur="1050ms"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              fill="#494e58"
              fillOpacity="1"
              cx="0"
              cy="0"
              r="11"
              transform="translate(64 16)"
            >
              <animateTransform
                attributeName="transform"
                type="scale"
                additive="sum"
                values="1;1;1;1;1.42;1;1;1;1;1"
                dur="1050ms"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              fill="#494e58"
              fillOpacity="1"
              cx="0"
              cy="0"
              r="11"
              transform="translate(112 16)"
            >
              <animateTransform
                attributeName="transform"
                type="scale"
                additive="sum"
                values="1;1;1;1;1;1;1;1.42;1;1"
                dur="1050ms"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
      </div>
    );
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
          {_renderConnectionStatus()}
        </div>
        <div className="credits">by David Samacoïts-Etchegoin</div>
      </aside>
      <main>
        <header>{_renderUsersList()}</header>
        <div className="msg-feed">
          {_rendermessages()}
          {typing && _renderIsTyping()}
          <div ref={messagesEndRef} />
        </div>
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
