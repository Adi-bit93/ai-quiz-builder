// ✅ server.js (final version: handles correct/wrong answers properly)
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';
import http from "http";
import { Server } from "socket.io";

dotenv.config({ path: './env' });

// --- Database Connection ---
connectDB()
  .then(() => console.log(`✅ MongoDB connected successfully`))
  .catch((err) => console.error("❌ MongoDB connection failed!", err));

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// --- Global Leaderboards ---
if (!global.activeLeaderboards) {
  global.activeLeaderboards = {};
}

const CORRECT_POINTS = 10;
const WRONG_POINTS = -5; 

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // --- Join Lobby ---
  socket.on("joinLobby", ({ quizCode, name, role }) => {
    try {
      if (!quizCode) return console.warn("joinLobby without quizCode");

      socket.join(quizCode);

      if (!global.activeLeaderboards[quizCode]) {
        global.activeLeaderboards[quizCode] = [];
      }

      const leaderboard = global.activeLeaderboards[quizCode];
      const alreadyExists = leaderboard.some((p) => p.id === socket.id);

      if (!alreadyExists) {
        leaderboard.push({
          id: socket.id,
          name: name || `Player-${socket.id.slice(0, 4)}`,
          role: role || "participant",
          score: 0,
        });
        console.log(`${name || socket.id} joined ${quizCode}`);
      }

      leaderboard.sort((a, b) => b.score - a.score);
      io.to(quizCode).emit("updateParticipants", leaderboard);
    } catch (err) {
      console.error("joinLobby error:", err);
    }
  });

  //Start Quiz
  socket.on("startQuiz", ({ quizCode }) => {
    try {
      console.log(`🚀 Quiz ${quizCode} started`);
      io.to(quizCode).emit("quizStarted", { quizCode });

      const snapshot = global.activeLeaderboards[quizCode] || [];
      io.to(quizCode).emit("leaderboardUpdate", snapshot);
    } catch (err) {
      console.error("startQuiz error:", err);
    }
  });

  // Update Score 
  socket.on("updateScore", ({ quizCode, name, wasAnswered, isCorrect }) => {
    try {
      console.log("🎯 updateScore:", { quizCode, name, wasAnswered, isCorrect });

      if (!quizCode) return console.warn("updateScore missing quizCode");
      const leaderboard = global.activeLeaderboards[quizCode];
      if (!leaderboard) return console.warn(`No leaderboard for ${quizCode}`);

      let player = leaderboard.find((p) => p.id === socket.id) ||
                   leaderboard.find((p) => p.name === name);
      if (!player) {
        console.warn(`Player not found: ${name}`);
        return;
      }

      // Ignore skipped questions
      if (!wasAnswered) {
        console.log(`⏭️ ${player.name} skipped the question`);
        return;
      }

      // Update score based on correctness
      const delta = isCorrect ? CORRECT_POINTS : WRONG_POINTS;
      player.score = Math.max(0, (player.score || 0) + delta); // prevent negative score

      leaderboard.sort((a, b) => b.score - a.score);

      console.log(
        `✅ ${player.name} ${isCorrect ? "correct" : "wrong"} (+${delta}) => ${player.score}`
      );

      io.to(quizCode).emit("leaderboardUpdate", leaderboard);
    } catch (err) {
      console.error("updateScore error:", err);
    }
  });

  // --- Disconnect Cleanup ---
  socket.on("disconnect", () => {
    try {
      for (const quizCode of Object.keys(global.activeLeaderboards)) {
        const before = global.activeLeaderboards[quizCode].length;
        global.activeLeaderboards[quizCode] =
          global.activeLeaderboards[quizCode].filter((p) => p.id !== socket.id);

        if (global.activeLeaderboards[quizCode].length !== before) {
          io.to(quizCode).emit("updateParticipants", global.activeLeaderboards[quizCode]);
          io.to(quizCode).emit("leaderboardUpdate", global.activeLeaderboards[quizCode]);
        }
      }
    } catch (err) {
      console.error("disconnect error:", err);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
