const app = require('../../Client/src/node_modules/express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
    console.log('a user connected');
  });

http.listen(4000, () => {
  console.log('listening on *:4000');
});