// Purpose: Game logic for the server side of the game.
// import Socket to explicitly type the socket parameter. This ensure they are compatible with the actual socket instances.
import { Socket } from "socket.io";

type Player = string;
// type Board = string[][];
type Board = Array<Array<Player | " ">>;

// game.js
const constants = require("../constants/index");
const _BOARD_SIZE = constants.BOARD_SIZE;
let board: Board = [
  [" ", " ", " "],
  [" ", " ", " "],
  [" ", " ", " "],
];
let currentPlayer: string = "X";
let _player1Socket: Socket | null = null;
let _player2Socket: Socket | null = null;
// Socket is a type that is exported by socket.io. It is a class that represents a socket connection.
function handlePlayerMove(
  socket: Socket,
  move: number,
  p1Socket: Socket,
  p2Socket: Socket
): void {
  _player1Socket = p1Socket;
  _player2Socket = p2Socket;

  if (socket === _player1Socket && currentPlayer === "X") {
    if (isMoveValid(move)) {
      updateBoard(move);
      sendBoardToPlayers();
      checkGameStatus();
      currentPlayer = "O";
      _player2Socket.emit("message", `It's your turn. Make a move!`);
      _player1Socket.emit(
        "message",
        `Waiting for the second player to make a move...`
      );
    } else {
      socket.emit("message", "Invalid move. Try again!");
    }
  } else if (socket === _player2Socket && currentPlayer === "O") {
    if (isMoveValid(move)) {
      updateBoard(move);
      sendBoardToPlayers();
      checkGameStatus();
      currentPlayer = "X";
      _player1Socket.emit("message", `It's your turn. Make a move!`);
      _player2Socket.emit(
        "message",
        `Waiting for the first player to make a move...`
      );
    } else {
      socket.emit("message", "Invalid move. Try again!");
    }
  } else {
    socket.emit("message", "It's not your turn. Wait for your opponent!");
  }
}

function isMoveValid(move: number): boolean {
  if (move < 1 || move > _BOARD_SIZE * _BOARD_SIZE) {
    return false;
  }
  const row = Math.floor((move - 1) / _BOARD_SIZE);
  const col = (move - 1) % _BOARD_SIZE;
  return board[row][col] === " ";
}

function updateBoard(move: number) {
  const row = Math.floor((move - 1) / _BOARD_SIZE);
  const col = (move - 1) % _BOARD_SIZE;
  board[row][col] = currentPlayer;
}

function sendBoardToPlayers() {
  _player1Socket?.emit("board", board);
  _player2Socket?.emit("board", board);
}

function checkGameStatus(): void {
  if (isPlayerWinner(currentPlayer)) {
    const winningPlayer: "first" | "second" =
      currentPlayer === "X" ? "first" : "second";

    _player1Socket?.emit("gameover", { winner: winningPlayer, reason: "win" });
    _player2Socket?.emit("gameover", { winner: winningPlayer, reason: "win" });

    board = [
      [" ", " ", " "],
      [" ", " ", " "],
      [" ", " ", " "],
    ];
  } else if (isBoardFull()) {
    _player1Socket?.emit("gameover", { winner: null, reason: "tie" });
    _player2Socket?.emit("gameover", { winner: null, reason: "tie" });
    board = [
      [" ", " ", " "],
      [" ", " ", " "],
      [" ", " ", " "],
    ];
  }
}

function isPlayerWinner(player: Player): boolean {
  // Check rows
  for (let i = 0; i < _BOARD_SIZE; i++) {
    if (
      board[i][0] === player &&
      board[i][1] === player &&
      board[i][2] === player
    ) {
      return true;
    }
  }

  // Check columns
  for (let i = 0; i < _BOARD_SIZE; i++) {
    if (
      board[0][i] === player &&
      board[1][i] === player &&
      board[2][i] === player
    ) {
      return true;
    }
  }

  // Check diagonals
  if (
    (board[0][0] === player &&
      board[1][1] === player &&
      board[2][2] === player) ||
    (board[0][2] === player && board[1][1] === player && board[2][0] === player)
  ) {
    return true;
  }
  return false;
}

function isBoardFull(): boolean {
  for (let row = 0; row < _BOARD_SIZE; row++) {
    for (let col = 0; col < _BOARD_SIZE; col++) {
      if (board[row][col] === " ") {
        return false;
      }
    }
  }
  return true;
}

function handlePlayerResign(
  socket: Socket,
  p1Socket: Socket,
  p2Socket: Socket
): void {
  if (socket === p1Socket) {
    p2Socket.emit("gameover", { winner: "second", reason: "resign" });
    p1Socket.emit("gameover", { winner: "second", reason: "resign" });
    board = [
      [" ", " ", " "],
      [" ", " ", " "],
      [" ", " ", " "],
    ];
  } else if (socket === p2Socket) {
    p1Socket.emit("gameover", { winner: "first", reason: "resign" });
    p2Socket.emit("gameover", { winner: "first", reason: "resign" });
    board = [
      [" ", " ", " "],
      [" ", " ", " "],
      [" ", " ", " "],
    ];
  }
}

function handlePlayerDisconnect(
  socket: Socket,
  p1Socket: Socket,
  p2Socket: Socket
) {
  if (_player1Socket === null || _player2Socket === null) {
    return;
  } else if (socket === p1Socket && p2Socket) {
    p2Socket.emit("gameover", { winner: "second", reason: "disconnect" });
    board = [
      [" ", " ", " "],
      [" ", " ", " "],
      [" ", " ", " "],
    ];
  } else if (socket === p2Socket) {
    p1Socket.emit("gameover", { winner: "first", reason: "disconnect" });
    board = [
      [" ", " ", " "],
      [" ", " ", " "],
      [" ", " ", " "],
    ];
  }
}

module.exports = {
  handlePlayerMove,
  handlePlayerDisconnect,
  handlePlayerResign,
};
