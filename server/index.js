const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const uuidv4 = require('uuid/v4');

const port = 3000;

const users = [{
  uuid: "000000000",
  nickname: 'Chatbot 🤖',
}];

const messages = [{
  uuid: "1",
  from: {
    uuid: "000000000",
    nickname: 'Chatbot 🤖',
  },
  content: "Welcome! 🙌",
}];

io.on('connection', (socket) => {
  console.log('🔥 New connection');
  // Send current users and messages
  socket.emit('connection success', {
    users,
    messages
  });

  // Handeling a new user entering the chatroom
  socket.on('chat enter', nickname => {
    console.log('new user: ' + nickname);
    // Building user entry
    const uuid = uuidv4();
    const newUser = {
      uuid,
      nickname,
    };
    users.push(newUser);
    console.log(users);
    socket.emit('chat welcome', newUser);
  });

  // Handeling messaging
  socket.on('chat message', (newMsg) => {
    console.log('message: ' + newMsg);
    const uuid = uuidv4();
    newMsg.uuid = uuid;
    messages.push(newMsg);
    io.emit('chat message', messages);
  });

  // Handeling disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
});

http.listen(port, () => {
  console.log(`📣 Listening on port ${port}`);
});