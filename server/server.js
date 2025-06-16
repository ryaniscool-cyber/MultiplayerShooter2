const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("client"));

const players = {};

io.on("connection", socket => {
  console.log("New player: " + socket.id);
  players[socket.id] = { x: 0, y: 0, z: 0 };

  socket.on("update", data => {
    players[socket.id] = data;
    io.emit("players", players);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("players", players);
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

