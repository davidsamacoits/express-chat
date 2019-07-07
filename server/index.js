const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const uuidv4 = require('uuid/v4');

const port = 3000;

const users = [];
const messages = [];
let isTyping = false;

io.on('connection', (socket) => {
  console.log('🔥 New connection');
  // Send current users and messages
  socket.emit('connection success', {
    users,
    messages
  });

  // Handeling a new user entering the chatroom
  socket.on('chat enter', nickname => {
    // Building user entry
    const uuid = uuidv4();
    const newUser = {
      uuid,
      nickname,
    };
    users.push(newUser);
    socket.emit('chat welcome', newUser);
    io.emit('chat users', users);
  });

  // Handeling typing
  socket.on('chat istyping', () => {
    if (isTyping === false) {
      isTyping = true;
      socket.broadcast.emit('chat typing');
    }
  })

  socket.on('chat stoptyping', () => {
    if (isTyping === true) {
      isTyping = false;
      socket.broadcast.emit('chat idle');
    }
  })

  // Handeling messaging
  socket.on('chat message', (newMsg) => {
    const uuid = uuidv4();
    newMsg.uuid = uuid;
    messages.push(newMsg);
    // Broadcast new message
    io.emit('chat message', newMsg);
  });

  // Handeling disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
});

http.listen(port, () => {
  console.log(`📣 Listening on port ${port}`);
});