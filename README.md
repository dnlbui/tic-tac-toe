# tic-tac-toe

Internship test

# Tic-Tac-Toe Game

This is a multiplayer Tic-Tac-Toe game implemented using Node.js and Socket.IO. It allows two players to connect to a server and play the game against each other in real-time.

## Prerequisites

- Node.js (v10 or above)
- NPM (Node Package Manager)

## Installation

1. Clone the repository:

   git clone https://github.com/your-username/tic-tac-toe.git

2. Navigate to the project directory:

3. Install the dependencies in both directories:

   npm install

## Usage

1. Start the server:

   node server.js {gameport}

2. Connect two players to the server using separate terminals:

   node client.js {SERVER_IP} {SERVER_PORT}

3. Play the game by entering moves in the console. The board will be displayed after each move, and the game status will be shown at the end.

4. To resign from the game, enter 'r' in the console.

## Files

- `server.js`: The server-side implementation of the Tic-Tac-Toe game using Socket.IO. It handles player connections, moves, resignations, and game over conditions.
- `game.js`: Contains the game logic, including checking for a winner, updating the game board, and handling resignations and disconnections.
- `client.js`: The client-side implementation of the Tic-Tac-Toe game using Socket.IO. It connects to the server and handles console input/output for the game.
