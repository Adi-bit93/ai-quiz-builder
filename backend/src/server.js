// server.js (drop-in replacement)
// (keeps your express app import and DB connect logic intact)
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';
import http from "http";
import { Server } from "socket.io";

dotenv.config({
  path: './env'
});

connectDB().then(() => {
  console.log(`✅ MongoDB connected successfully`);
}).catch((err) => {
  console.log("MongoDB connection failed!", err);
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Setup Socket.IO with your CORS origin
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// In-memory leaderboards for active quizzes
if (!global.activeLeaderboards) {
  global.activeLeaderboards = {};
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // --- Join Lobby ---
  socket.on("joinLobby", ({ quizCode, name, role }) => {
    try {
      if (!quizCode) {
        console.warn("joinLobby called without quizCode from socket:", socket.id);
        return;
      }

      // ensure server-side room membership
      socket.join(quizCode);

      if (!global.activeLeaderboards[quizCode]) {
        global.activeLeaderboards[quizCode] = [];
      }

      const leaderboard = global.activeLeaderboards[quizCode];

      // check if socket already present (prevents duplicates)
      const alreadyExists = leaderboard.some((p) => p.id === socket.id);

      if (!alreadyExists) {
        leaderboard.push({
          id: socket.id,   // runtime id used to track updates
          name: name || `Player-${socket.id.slice(0, 4)}`,
          role: role || "participant",
          score: 0
        });

        console.log(`${name || socket.id} (${role}) joined lobby ${quizCode}`);
      } else {
        // if the socket id already exists, update name/role if needed
        const p = leaderboard.find((p) => p.id === socket.id);
        if (p) {
          p.name = name || p.name;
          p.role = role || p.role;
        }
      }

      // ensure sorted (initial)
      leaderboard.sort((a, b) => b.score - a.score);

      console.log(`Broadcasting to room ${quizCode}. Participants: ${leaderboard.length}`);

      // broadcast updated list (join/disconnect updates)
      io.to(quizCode).emit("updateParticipants", leaderboard);
    } catch (err) {
      console.error("joinLobby handler error:", err);
    }
  });

  // --- Start Quiz ---
  socket.on("startQuiz", ({ quizCode }) => {
    try {
      console.log(`Quiz ${quizCode} started by ${socket.id}`);
      io.to(quizCode).emit("quizStarted", { quizCode });

      // Send current leaderboard snapshot to starter (and everyone)
      const snapshot = global.activeLeaderboards[quizCode] || [];
      io.to(quizCode).emit("leaderboardUpdate", snapshot);
    } catch (err) {
      console.error("startQuiz handler error:", err);
    }
  });

  // --- Update Score (core fix) ---
  socket.on("updateScore", ({ quizCode, name, score }) => {
    try {
      console.log("Server received updateScore:", { quizCode, name, score, fromSocket: socket.id });

      if (!quizCode) {
        console.warn("updateScore called without quizCode");
        return;
      }

      const leaderboard = global.activeLeaderboards[quizCode];
      if (!leaderboard) {
        console.warn(`updateScore: no active leaderboard for quizCode=${quizCode}`);
        return;
      }

      // Prefer matching by socket.id (the sender)
      let player = leaderboard.find((p) => p.id === socket.id);

      // For backward compatibility, fall back to match by name
      if (!player && name) {
        player = leaderboard.find((p) => p.name === name);
      }

      if (!player) {
        console.warn(`updateScore: player not found for quizCode=${quizCode}. name=${name}, socketId=${socket.id}`);
        // Optionally: push a new player entry for debugging (commented out)
        // leaderboard.push({ id: socket.id, name: name || `Player-${socket.id.slice(0,4)}`, role: "participant", score: Number(score) || 0 });
        return;
      }

      // Ensure numeric delta
      const delta = Number(score) || 0;
      player.score = (Number(player.score) || 0) + delta;

      // sort descending
      leaderboard.sort((a, b) => b.score - a.score);

      console.log(`Score update: quiz=${quizCode} player=${player.name} id=${player.id} +${delta} => ${player.score}`);

      // Broadcast authoritative leaderboard to the room
      io.to(quizCode).emit("leaderboardUpdate", leaderboard);
    } catch (err) {
      console.error("updateScore handler error:", err);
    }
  });

  // --- Disconnect (cleanup) ---
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    try {
      for (const quizCode of Object.keys(global.activeLeaderboards)) {
        const before = global.activeLeaderboards[quizCode].length;
        global.activeLeaderboards[quizCode] =
          global.activeLeaderboards[quizCode].filter((p) => p.id !== socket.id);

        if (global.activeLeaderboards[quizCode].length !== before) {
          console.log(`Removed ${socket.id} from leaderboard ${quizCode}`);
          io.to(quizCode).emit("updateParticipants", global.activeLeaderboards[quizCode]);
          io.to(quizCode).emit("leaderboardUpdate", global.activeLeaderboards[quizCode]);
        }
      }
    } catch (err) {
      console.error("disconnect handler error:", err);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
