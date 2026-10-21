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
        gameHistory: [],
        draftState: null,
        draftTimerInterval: null
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

  // Authoritative Draft Arena Helpers
  function executeDraftSold(room, roomCode) {
    if (!room || !room.draftState || !room.draftState.nominatedItemId || !room.draftState.currentBid) return;
    const state = room.draftState;
    const item = state.pool.find((i) => i.id === state.nominatedItemId);
    const team = state.teams.find((t) => t.id === state.currentBid.teamId);
    if (!item || !team) return;

    // Find eligible slot
    let slot = team.roster.find(
      (s) => !s.item && s.slotCategory.toLowerCase() === item.category.toLowerCase()
    );
    if (!slot) {
      slot = team.roster.find((s) => !s.item && s.isWildcard);
    }
    if (!slot) {
      slot = team.roster.find((s) => !s.item);
    }
    if (!slot) return;

    // Assign item to team slot and deduct budget
    slot.item = item;
    slot.pricePaid = state.currentBid.amount;
    slot.acquiredAt = Date.now();
    team.budget -= state.currentBid.amount;

    state.soldItems.push({
      itemId: item.id,
      teamId: team.id,
      price: state.currentBid.amount,
      slotId: slot.id,
      timestamp: Date.now()
    });

    state.availableItemIds = state.availableItemIds.filter((id) => id !== item.id);
    state.actionLog.push({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      type: "sold",
      description: `SOLD! ${item.name} acquired by ${team.name} for ${state.preset.currencySymbol || "$"}${state.currentBid.amount}!`,
      teamId: team.id,
      itemId: item.id,
      amount: state.currentBid.amount
    });

    // Check completion: all team rosters full OR pool empty
    const allFull = state.teams.every((t) => t.roster.every((s) => !!s.item));
    const poolEmpty = state.availableItemIds.length === 0;
    if (allFull || poolEmpty) {
      state.phase = "completed";
    } else {
      state.phase = "sold";
    }

    if (room.draftTimerInterval) {
      clearInterval(room.draftTimerInterval);
      room.draftTimerInterval = null;
    }
    state.timerActive = false;
    const soldBid = state.currentBid;
    state.currentBid = null;
    state.nominatingTeamIndex = (state.nominatingTeamIndex + 1) % state.teams.length;

    io.to(roomCode).emit("draft-state-sync", state);
    io.to(roomCode).emit("draft-item-sold", { item, team, price: soldBid.amount });
  }

  function executeDraftPass(room, roomCode) {
    if (!room || !room.draftState || !room.draftState.nominatedItemId) return;
    const state = room.draftState;
    const item = state.pool.find((i) => i.id === state.nominatedItemId);

    if (room.draftTimerInterval) {
      clearInterval(room.draftTimerInterval);
      room.draftTimerInterval = null;
    }
    state.timerActive = false;
    state.currentBid = null;
    state.phase = "nominating";
    state.actionLog.push({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      type: "pass",
      description: `PASSED: ${item ? item.name : "Item"} was passed without any winning bids.`,
      itemId: item ? item.id : undefined
    });
    state.nominatedItemId = null;
    state.nominatingTeamIndex = (state.nominatingTeamIndex + 1) % state.teams.length;

    io.to(roomCode).emit("draft-state-sync", state);
    io.to(roomCode).emit("draft-item-passed", { item });
  }

  function startDraftTimer(room, roomCode) {
    if (room.draftTimerInterval) {
      clearInterval(room.draftTimerInterval);
      room.draftTimerInterval = null;
    }
    if (!room.draftState) return;

    room.draftState.timerActive = true;
    room.draftTimerInterval = setInterval(() => {
      if (!room.draftState || !room.draftState.timerActive) {
        clearInterval(room.draftTimerInterval);
        room.draftTimerInterval = null;
        return;
      }

      if (room.draftState.timeLeft > 1) {
        room.draftState.timeLeft -= 1;
        io.to(roomCode).emit("draft-timer-tick", { timeLeft: room.draftState.timeLeft });
      } else {
        room.draftState.timeLeft = 0;
        room.draftState.timerActive = false;
        clearInterval(room.draftTimerInterval);
        room.draftTimerInterval = null;

        // Auto hammer or pass when countdown reaches 0
        if (room.draftState.currentBid) {
          executeDraftSold(room, roomCode);
        } else {
          executeDraftPass(room, roomCode);
        }
      }
    }, 1000);
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
        gameHistory: room.gameHistory,
        draftState: room.draftState
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

        // If all players disconnected, pause/clear draft timer
        if (room.players.every((p) => !p.connected)) {
          if (room.draftTimerInterval) {
            clearInterval(room.draftTimerInterval);
            room.draftTimerInterval = null;
          }
        }
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
          gameHistory: room.gameHistory,
          draftState: room.draftState
        });
      }
    });

    socket.on("draft-action", (rawCode, action) => {
      const roomCode = (rawCode || "").toUpperCase().trim();
      const room = rooms[roomCode];
      if (!room || !action) return;

      const { type, payload } = action;

      if (type === "init-draft") {
        const { preset, teams } = payload;
        if (room.draftTimerInterval) {
          clearInterval(room.draftTimerInterval);
          room.draftTimerInterval = null;
        }
        room.draftState = {
          id: `draft-${Date.now()}`,
          preset,
          phase: "nominating",
          teams: teams.map((t, idx) => ({
            ...t,
            id: t.id || `team-${idx + 1}`,
            budget: t.budget !== undefined ? t.budget : preset.startingBudget,
            startingBudget: preset.startingBudget,
            roster: preset.rosterSlots.map((slot) => ({
              slotId: slot.id,
              slotName: slot.name,
              slotCategory: slot.category,
              isWildcard: !!slot.isWildcard,
              item: null
            }))
          })),
          pool: preset.items || [],
          availableItemIds: (preset.items || []).map((i) => i.id),
          soldItems: [],
          nominatedItemId: null,
          currentBid: null,
          timerActive: false,
          timeLeft: preset.nominationTimerSeconds || 20,
          nominatingTeamIndex: 0,
          hostId: socket.id,
          actionLog: [
            {
              id: `log-${Date.now()}`,
              timestamp: Date.now(),
              type: "state_change",
              description: `Draft initialized with preset "${preset.name}". Starting budget: ${preset.currencySymbol || "$"}${preset.startingBudget}`
            }
          ],
          audienceVotes: {}
        };
        io.to(roomCode).emit("draft-state-sync", room.draftState);
      } else if (type === "nominate-item") {
        if (!room.draftState) return;
        const { itemId, startingBid, teamId } = payload;
        const item = room.draftState.pool.find((i) => i.id === itemId);
        if (!item || !room.draftState.availableItemIds.includes(itemId)) {
          socket.emit("draft-bid-error", { message: "Item is not available for nomination." });
          return;
        }

        room.draftState.nominatedItemId = itemId;
        room.draftState.phase = "bidding";
        room.draftState.timeLeft = room.draftState.preset.nominationTimerSeconds || 20;

        if (startingBid && teamId) {
          const team = room.draftState.teams.find((t) => t.id === teamId);
          room.draftState.currentBid = {
            teamId,
            bidderName: team ? team.name : "Starting Bid",
            amount: startingBid,
            timestamp: Date.now()
          };
        } else {
          room.draftState.currentBid = null;
        }

        room.draftState.actionLog.push({
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: Date.now(),
          type: "nomination",
          description: `${item.name} (${item.category}) is now on the auction block!`,
          itemId: item.id
        });

        startDraftTimer(room, roomCode);
        io.to(roomCode).emit("draft-state-sync", room.draftState);
      } else if (type === "place-bid") {
        if (!room.draftState || (room.draftState.phase !== "bidding" && room.draftState.phase !== "nominating")) {
          socket.emit("draft-bid-error", { message: "Auction is not open for bidding right now." });
          return;
        }
        const { teamId, amount, bidderName } = payload;
        const state = room.draftState;
        const team = state.teams.find((t) => t.id === teamId);
        if (!team) {
          socket.emit("draft-bid-error", { message: "Team not found." });
          return;
        }
        const item = state.pool.find((i) => i.id === state.nominatedItemId);
        if (!item) {
          socket.emit("draft-bid-error", { message: "No item currently nominated." });
          return;
        }

        // Roster eligibility check
        const hasSlot = team.roster.some(
          (s) => !s.item && (s.isWildcard || s.slotCategory.toLowerCase() === item.category.toLowerCase())
        );
        if (!hasSlot) {
          socket.emit("draft-bid-error", {
            message: `Roster full for category '${item.category}'. No open slots available!`
          });
          return;
        }

        // Minimum increment check
        const minIncrement = state.preset.minBidIncrement || 1;
        const currentAmount = state.currentBid ? state.currentBid.amount : 0;
        const minRequired = currentAmount > 0 ? currentAmount + minIncrement : (state.preset.minStartingBid || 1);
        if (amount < minRequired) {
          socket.emit("draft-bid-error", {
            message: `Minimum required bid is ${state.preset.currencySymbol || "$"}${minRequired}.`
          });
          return;
        }

        // Total budget check
        if (team.budget < amount) {
          socket.emit("draft-bid-error", {
            message: `Insufficient budget. Team only has ${state.preset.currencySymbol || "$"}${team.budget} remaining.`
          });
          return;
        }

        // Budget reservation rule: must reserve minBidIncrement for each remaining unfilled slot
        const unfilledSlots = team.roster.filter((s) => !s.item).length;
        const reserveNeeded = (unfilledSlots - 1) * minIncrement;
        if (team.budget - amount < reserveNeeded) {
          socket.emit("draft-bid-error", {
            message: `Budget reservation: Must keep at least ${state.preset.currencySymbol || "$"}${reserveNeeded} to fill your other ${unfilledSlots - 1} slot(s).`
          });
          return;
        }

        // Outbidding oneself check
        if (state.currentBid && state.currentBid.teamId === teamId) {
          socket.emit("draft-bid-error", { message: "You already hold the highest bid!" });
          return;
        }

        // Atomic bid acceptance
        state.previousBid = state.currentBid ? { ...state.currentBid } : null;
        state.currentBid = {
          teamId,
          bidderName: bidderName || team.name,
          amount,
          timestamp: Date.now()
        };
        state.phase = "bidding";

        // Anti-sniping: extend timer if near zero
        const antiSniping = state.preset.antiSnipingSeconds || 5;
        if (state.timeLeft < antiSniping) {
          state.timeLeft = antiSniping;
        }

        state.actionLog.push({
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: Date.now(),
          type: "bid",
          description: `${bidderName || team.name} placed bid: ${state.preset.currencySymbol || "$"}${amount}!`,
          teamId,
          itemId: item.id,
          amount
        });

        io.to(roomCode).emit("draft-state-sync", state);
        io.to(roomCode).emit("draft-bid-placed", { currentBid: state.currentBid, timeLeft: state.timeLeft });
      } else if (type === "sold-item") {
        executeDraftSold(room, roomCode);
      } else if (type === "pass-item") {
        executeDraftPass(room, roomCode);
      } else if (type === "next-item") {
        if (!room.draftState) return;
        if (room.draftTimerInterval) {
          clearInterval(room.draftTimerInterval);
          room.draftTimerInterval = null;
        }
        room.draftState.phase = "nominating";
        room.draftState.nominatedItemId = null;
        room.draftState.currentBid = null;
        room.draftState.timerActive = false;
        io.to(roomCode).emit("draft-state-sync", room.draftState);
      } else if (type === "undo-bid") {
        if (!room.draftState || !room.draftState.currentBid) return;
        room.draftState.currentBid = room.draftState.previousBid || null;
        room.draftState.previousBid = null;
        io.to(roomCode).emit("draft-state-sync", room.draftState);
      } else if (type === "vote-roster") {
        if (!room.draftState) return;
        const { teamId, category } = payload;
        if (!room.draftState.audienceVotes) room.draftState.audienceVotes = {};
        const catKey = category || "overall";
        if (!room.draftState.audienceVotes[catKey]) room.draftState.audienceVotes[catKey] = {};
        room.draftState.audienceVotes[catKey][teamId] = (room.draftState.audienceVotes[catKey][teamId] || 0) + 1;
        io.to(roomCode).emit("draft-state-sync", room.draftState);
      } else if (type === "reset-draft") {
        if (room.draftTimerInterval) {
          clearInterval(room.draftTimerInterval);
          room.draftTimerInterval = null;
        }
        room.draftState = null;
        io.to(roomCode).emit("draft-state-sync", null);
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
