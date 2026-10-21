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

  // Authoritative In-Memory Room Store
  // roomCode -> {
  //   code, players, gameId, gameStarted, gameContent, personRounds,
  //   contentIndex, currentContent, currentPlayer, playerScores, sips,
  //   votes, kmkVotes, votingReveal, timerActive, timeLeft, timerDuration,
  //   settings, gameHistory
  // }
  const rooms = {};

  function getOrCreateRoom(rawCode) {
    const code = (rawCode || "").toUpperCase().trim();
    if (!rooms[code]) {
      rooms[code] = {
        code,
        players: [],
        gameId: "never-have-i-ever",
        gameStarted: false,
        gameContent: [],
        personRounds: [],
        contentIndex: 0,
        currentContent: "",
        currentPlayer: 0,
        playerScores: {},
        sips: {},
        votes: {},
        kmkVotes: {},
        votingReveal: false,
        timerActive: false,
        timeLeft: 15,
        timerDuration: 15,
        settings: {},
        gameHistory: []
      };
    }
    return rooms[code];
  }

  function broadcastRoomPlayers(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;
    io.to(roomCode).emit(
      "room-players",
      room.players.map((p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        connected: p.connected
      }))
    );
  }

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-room", (rawCode, rawName, deviceId) => {
      const roomCode = (rawCode || "").toUpperCase().trim();
      const playerName = (rawName || "").trim();
      if (!roomCode || !playerName) return;

      socket.join(roomCode);
      const room = getOrCreateRoom(roomCode);

      // Check if player exists by name (case-insensitive) or by stable deviceId
      let existingPlayer = room.players.find(
        (p) =>
          (p.name && p.name.toLowerCase() === playerName.toLowerCase()) ||
          (deviceId && p.deviceId && p.deviceId === deviceId)
      );

      if (existingPlayer) {
        // Player rejoining with same name or device: preserve their state, scores, and answers
        console.log(`[Room ${roomCode}] Player '${playerName}' REJOINED. Preserved score: ${room.playerScores[existingPlayer.name] || 0}`);
        existingPlayer.id = socket.id;
        existingPlayer.name = playerName; // keep updated in case casing changed
        if (deviceId) existingPlayer.deviceId = deviceId;
        existingPlayer.connected = true;
        existingPlayer.lastSeen = Date.now();
      } else {
        // Brand new player
        const isFirst = room.players.filter((p) => p.connected).length === 0;
        const newPlayer = {
          id: socket.id,
          name: playerName,
          deviceId: deviceId || socket.id,
          isHost: isFirst,
          connected: true,
          lastSeen: Date.now()
        };
        room.players.push(newPlayer);
        if (room.playerScores[playerName] === undefined) {
          room.playerScores[playerName] = 0;
        }
        if (room.sips[playerName] === undefined) {
          room.sips[playerName] = 0;
        }
        console.log(`[Room ${roomCode}] Player '${playerName}' joined. Total players: ${room.players.length}`);
      }

      // Broadcast updated player list with connection status
      broadcastRoomPlayers(roomCode);

      // Send the authoritative current room state directly to the joining/rejoining client
      socket.emit("room-state-sync", {
        gameId: room.gameId,
        gameStarted: room.gameStarted,
        gameContent: room.gameContent,
        personRounds: room.personRounds,
        contentIndex: room.contentIndex,
        currentContent: room.currentContent,
        currentPlayer: room.currentPlayer,
        playerScores: room.playerScores,
        sips: room.sips,
        votes: room.votes,
        kmkVotes: room.kmkVotes,
        votingReveal: room.votingReveal,
        timerActive: room.timerActive,
        timeLeft: room.timeLeft,
        timerDuration: room.timerDuration,
        settings: room.settings,
        gameHistory: room.gameHistory
      });
    });

    const handleLeave = (rawCode) => {
      const roomCode = (rawCode || "").toUpperCase().trim();
      const room = rooms[roomCode];
      if (!room) return;

      const player = room.players.find((p) => p.id === socket.id);
      if (player) {
        player.connected = false;
        player.lastSeen = Date.now();
        console.log(`[Room ${roomCode}] Player '${player.name}' disconnected (scores preserved for reconnect)`);

        // If the host disconnected, designate an active connected player as temporary host
        if (player.isHost) {
          const nextActive = room.players.find((p) => p.connected);
          if (nextActive) {
            nextActive.isHost = true;
          }
        }

        broadcastRoomPlayers(roomCode);
      }
    };

    socket.on("leave-room", (roomCode) => {
      socket.leave(roomCode);
      handleLeave(roomCode);
    });

    socket.on("select-game", (rawCode, gameId) => {
      const roomCode = (rawCode || "").toUpperCase().trim();
      const room = rooms[roomCode];
      if (room) {
        room.gameId = gameId;
        room.gameStarted = false;
        room.gameContent = [];
        room.personRounds = [];
        room.contentIndex = 0;
        room.currentContent = "";
        room.votes = {};
        room.kmkVotes = {};
        room.votingReveal = false;
      }
      io.to(roomCode).emit("select-game", gameId);
    });

    socket.on("update-room-settings", (rawCode, settings) => {
      const roomCode = (rawCode || "").toUpperCase().trim();
      const room = rooms[roomCode];
      if (room && settings) {
        room.settings = { ...room.settings, ...settings };
        io.to(roomCode).emit("room-settings-updated", room.settings);
      }
    });

    socket.on("start-game", (rawCode, gameId, settings) => {
      const roomCode = (rawCode || "").toUpperCase().trim();
      const room = rooms[roomCode];
      if (room) {
        room.gameStarted = true;
        if (gameId) room.gameId = gameId;
        if (settings) room.settings = { ...room.settings, ...settings };
        room.contentIndex = 0;
        room.votes = {};
        room.kmkVotes = {};
        room.votingReveal = false;
      }
      io.to(roomCode).emit("game-started", gameId, room ? room.settings : settings);
    });

    socket.on("game-action", (rawCode, action) => {
      const roomCode = (rawCode || "").toUpperCase().trim();
      const room = rooms[roomCode];

      if (room && action) {
        if (action.type === "start-game") {
          room.gameStarted = true;
          room.settings = action.payload || {};
          room.votes = {};
          room.kmkVotes = {};
          room.votingReveal = false;
        } else if (action.type === "sync-questions") {
          room.gameContent = action.payload.gameContent || [];
          room.personRounds = action.payload.personRounds || [];
          room.contentIndex = action.payload.contentIndex ?? 0;
          room.currentContent = action.payload.currentContent || (room.gameContent[0] || "");
          if (action.payload.currentPlayer !== undefined) {
            room.currentPlayer = action.payload.currentPlayer;
          }
        } else if (action.type === "next-turn") {
          room.currentPlayer = action.payload.currentPlayer;
          room.contentIndex = action.payload.contentIndex;
          room.currentContent = action.payload.currentContent;
          room.votes = {};
          room.kmkVotes = {};
          room.votingReveal = false;
        } else if (action.type === "skip-content") {
          room.contentIndex = action.payload.contentIndex;
          room.currentContent = action.payload.currentContent;
          room.votes = {};
          room.kmkVotes = {};
          room.votingReveal = false;
        } else if (action.type === "shuffle-content") {
          room.gameContent = action.payload.gameContent;
          if (action.payload.personRounds) {
            room.personRounds = action.payload.personRounds;
          }
          room.currentContent = action.payload.currentContent;
          room.contentIndex = 0;
          room.votes = {};
          room.kmkVotes = {};
          room.votingReveal = false;
        } else if (action.type === "kmk-submit") {
          if (action.payload?.player && action.payload?.selections) {
            room.kmkVotes[action.payload.player] = action.payload.selections;
          }
        } else if (action.type === "award-point") {
          if (action.payload?.playerScores) {
            room.playerScores = { ...room.playerScores, ...action.payload.playerScores };
          }
        } else if (action.type === "reveal-votes") {
          room.votingReveal = true;
        } else if (action.type === "toggle-timer") {
          room.timerActive = action.payload.timerActive;
          if (action.payload.timeLeft !== undefined) {
            room.timeLeft = action.payload.timeLeft;
          }
        } else if (action.type === "reset-timer") {
          room.timerActive = false;
        } else if (action.type === "custom-persons-added") {
          // Dynamic bulk spice-up personalities added to active room
          if (action.payload?.personRounds && Array.isArray(action.payload.personRounds)) {
            room.personRounds = [...action.payload.personRounds, ...(room.personRounds || [])];
          }
          if (action.payload?.questions && Array.isArray(action.payload.questions)) {
            room.gameContent = [...action.payload.questions, ...(room.gameContent || [])];
          }
        }
      }

      // Forward action to all other sockets in room
      socket.to(roomCode).emit("game-action", action);
    });

    socket.on("cast-vote", (rawCode, voteData) => {
      const roomCode = (rawCode || "").toUpperCase().trim();
      const room = rooms[roomCode];
      if (room && voteData) {
        const voter = voteData.voterName || voteData.voter;
        if (voter && voteData.candidate) {
          room.votes[voter] = voteData.candidate;
        }
      }
      io.to(roomCode).emit("cast-vote", voteData);
    });

    socket.on("send-reaction", (rawCode, reaction) => {
      const roomCode = (rawCode || "").toUpperCase().trim();
      io.to(roomCode).emit("send-reaction", reaction);
    });

    socket.on("anonymous-prompt", (rawCode, promptText) => {
      const roomCode = (rawCode || "").toUpperCase().trim();
      const room = rooms[roomCode];
      if (room && promptText) {
        const insertIndex = (room.contentIndex + 1) % (room.gameContent.length || 1);
        room.gameContent.splice(insertIndex, 0, `Anonymous Prompt: ${promptText}`);
      }
      io.to(roomCode).emit("anonymous-prompt", promptText);
    });

    socket.on("sync-sips", (rawCode, sipsData) => {
      const roomCode = (rawCode || "").toUpperCase().trim();
      const room = rooms[roomCode];
      if (room && sipsData?.playerName) {
        room.sips[sipsData.playerName] = sipsData.sipsCount;
      }
      io.to(roomCode).emit("sync-sips", sipsData);
    });

    socket.on("request-game-state", (rawCode) => {
      const roomCode = (rawCode || "").toUpperCase().trim();
      const room = rooms[roomCode];
      if (room) {
        socket.emit("room-state-sync", {
          gameId: room.gameId,
          gameStarted: room.gameStarted,
          gameContent: room.gameContent,
          personRounds: room.personRounds,
          contentIndex: room.contentIndex,
          currentContent: room.currentContent,
          currentPlayer: room.currentPlayer,
          playerScores: room.playerScores,
          sips: room.sips,
          votes: room.votes,
          kmkVotes: room.kmkVotes,
          votingReveal: room.votingReveal,
          timerActive: room.timerActive,
          timeLeft: room.timeLeft,
          timerDuration: room.timerDuration,
          settings: room.settings,
          gameHistory: room.gameHistory
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
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
