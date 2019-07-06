const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = 3000;

io.on('connection', (socket) => {
  console.log('a user connected');
  // Handeling messaging
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
  });
  // Handeling disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
});

http.listen(port, () => {
  console.log(`📣 Listening on port ${port}`);
});