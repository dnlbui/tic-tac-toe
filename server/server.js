// server.js
const http = require('http');
const socketIO = require('socket.io');
const { handlePlayerMove, handlePlayerDisconnect, handlePlayerResign } = require('./game/game');
const { GAME_PORT } = require('./constants');

const server = http.createServer();
const io = socketIO(server);

let player1Socket;
let player2Socket;

io.on('connection', (socket) => {
  console.log(`A player connected: ${socket.id}`);

  if (!player1Socket) {
    player1Socket = socket;
  } else if (!player2Socket) {
    player2Socket = socket;
    player1Socket.emit('message', 'Game started. You are the first player.');
    player2Socket.emit('message', 'Game started. You are the second player.');
    socket.broadcast.emit('board', [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']]);
    player1Socket.emit('message', `It's your turn. Make a move!`);
    player2Socket.emit('message', `Waiting for the first player to make a move...`);  
  } else {
    socket.emit('message', 'Sorry, the game is already full. Please try again later.');
    socket.disconnect();
    return;
  }

  socket.on('move', (data) => {
    handlePlayerMove(socket, data, player1Socket, player2Socket);
  });

  socket.on('resign', () => {
    handlePlayerResign(socket, player1Socket, player2Socket);
  });

  socket.on('disconnect', () => {
    console.log(`A player disconnected: ${socket.id}`);
    handlePlayerDisconnect(socket, player1Socket, player2Socket);
    player1Socket = null;
    player2Socket = null;
  });
});

server.listen(GAME_PORT, () => {
  console.log(`Server listening on port ${GAME_PORT}`);
});
