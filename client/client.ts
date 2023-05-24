const io = require("socket.io-client");
const readcommand = require("readcommand");
const constants = require("./constants");
const _SERVER_IP = constants.SERVER_IP;
const _SERVER_PORT = constants.SERVER_PORT;

interface GameOverData {
  reason: string;
  winner: string;
}

const socket = io(`http://${_SERVER_IP}:${_SERVER_PORT}`);

socket.on("disconnect", () => {
  console.log("Disconnected from server.");
});

socket.on("connect", () => {
  console.log(`\nconnected to ${_SERVER_IP} ${_SERVER_PORT}`);
  process.stdout.write("\n> "); // Add a new line and the prompt
});

socket.on("message", (message: string): void => {
  console.log("\n" + message);
  process.stdout.write("> "); // Add a new line and the prompt
});

/* socket.on("gamestart", (player) => {
  console.log(`Game started. You are the ${player} player.`);
  process.stdout.write("\n> "); // Add a new line and the prompt
}); */

socket.on("board", (board: string[][]): void => {
  const formattedBoard = board
    .map((row) => row.map((cell) => (cell === " " ? "." : cell)).join(""))
    .join("\n");
  console.log("\n" + formattedBoard + "\n");
});

socket.on("gameover", (data: GameOverData): void => {
  if (data.reason === "tie") {
    console.log("\nGame is tied.");
  } else if (data.reason === "win") {
    console.log(`\nGame won by ${data.winner} player.`);
  } else if (data.reason === "resign") {
    console.log(`\nGame won by ${data.winner} player due to resignation.`);
  } else if (data.reason === "disconnect") {
    console.log(
      `\nGame won by ${data.winner} player since ${
        data.winner === "first" ? "second" : "first"
      } player disconnected.`
    );
  }
  socket.disconnect();
  process.exit();
});

// Start the input loop
readcommand.loop(
  (err: Error | null, args: string[], str: string, next: () => void) => {
    if (err) {
      console.error("Error reading command:", err);
      return;
    }

    const input: string = args[0];

    if (input.toLowerCase() === "r") {
      socket.emit("resign");
    } else {
      const move: number = parseInt(input, 10);
      socket.emit("move", move);
    }

    next();
  }
);
