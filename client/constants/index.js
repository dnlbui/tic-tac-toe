"use strict";
const SERVER_IP = process.argv[2] || "localhost";
const SERVER_PORT = process.argv[3] || 5050;
module.exports = { SERVER_IP, SERVER_PORT };
