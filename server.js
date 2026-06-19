import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // In-memory room store: roomCode -> array of { id, name, isHost }
  const rooms = {};

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-room", (roomCode, playerName) => {
      socket.join(roomCode);
      if (!rooms[roomCode]) {
        rooms[roomCode] = [];
      }
      
      const exists = rooms[roomCode].find(p => p.id === socket.id);
      if (!exists) {
        const hasHost = rooms[roomCode].some(p => p.isHost);
        rooms[roomCode].push({
          id: socket.id,
          name: playerName,
          isHost: !hasHost
        });
      }
      
      console.log(`Player ${playerName} joined room ${roomCode}. Total players:`, rooms[roomCode].length);
      io.to(roomCode).emit("room-players", rooms[roomCode]);
    });

    const handleLeave = (roomCode) => {
      if (rooms[roomCode]) {
        const playerIndex = rooms[roomCode].findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
          const [removedPlayer] = rooms[roomCode].splice(playerIndex, 1);
          console.log(`Player ${removedPlayer.name} left room ${roomCode}`);
          
          if (rooms[roomCode].length === 0) {
            delete rooms[roomCode];
          } else {
            if (removedPlayer.isHost) {
              rooms[roomCode][0].isHost = true;
            }
            io.to(roomCode).emit("room-players", rooms[roomCode]);
          }
        }
      }
    };

    socket.on("leave-room", (roomCode) => {
      socket.leave(roomCode);
      handleLeave(roomCode);
    });

    socket.on("start-game", (roomCode, gameId) => {
      io.to(roomCode).emit("game-started", gameId);
    });

    socket.on("game-action", (roomCode, action) => {
      socket.to(roomCode).emit("game-action", action);
    });

    socket.on("cast-vote", (roomCode, voteData) => {
      io.to(roomCode).emit("cast-vote", voteData);
    });

    socket.on("send-reaction", (roomCode, reaction) => {
      io.to(roomCode).emit("send-reaction", reaction);
    });

    socket.on("anonymous-prompt", (roomCode, promptText) => {
      io.to(roomCode).emit("anonymous-prompt", promptText);
    });

    socket.on("sync-sips", (roomCode, sipsData) => {
      io.to(roomCode).emit("sync-sips", sipsData);
    });

    socket.on("select-game", (roomCode, gameId) => {
      io.to(roomCode).emit("select-game", gameId);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      // Clean up player from all rooms they were in
      for (const roomCode of Object.keys(rooms)) {
        handleLeave(roomCode);
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
