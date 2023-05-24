"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.js
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const { handlePlayerMove, handlePlayerDisconnect, handlePlayerResign, } = require("./game/game");
const _constants = require("./constants");
const _GAME_PORT = _constants.GAME_PORT;
const server = http_1.default.createServer();
const io = new socket_io_1.Server(server);
let player1Socket = null;
let player2Socket = null;
io.on("connection", (socket) => {
    console.log(`A player connected: ${socket.id}`);
    if (!player1Socket) {
        player1Socket = socket;
    }
    else if (!player2Socket) {
        player2Socket = socket;
        player1Socket.emit("message", "Game started. You are the first player.");
        player2Socket.emit("message", "Game started. You are the second player.");
        socket.broadcast.emit("board", [
            [" ", " ", " "],
            [" ", " ", " "],
            [" ", " ", " "],
        ]);
        player1Socket.emit("message", `It's your turn. Make a move!`);
        player2Socket.emit("message", `Waiting for the first player to make a move...`);
    }
    else {
        socket.emit("message", "Sorry, the game is already full. Please try again later.");
        socket.disconnect();
        return;
    }
    socket.on("move", (data) => {
        handlePlayerMove(socket, data, player1Socket, player2Socket);
    });
    socket.on("resign", () => {
        handlePlayerResign(socket, player1Socket, player2Socket);
    });
    socket.on("disconnect", () => {
        console.log(`A player disconnected: ${socket.id}`);
        handlePlayerDisconnect(socket, player1Socket, player2Socket);
        player1Socket = null;
        player2Socket = null;
    });
});
server.listen(_GAME_PORT, () => {
    console.log(`Server listening on port ${_GAME_PORT}`);
});
