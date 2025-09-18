import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js'
import http from "http";
import { Server } from "socket.io";
import { log } from 'console';

dotenv.config({
    path: './env'
})
connectDB().then(() => {
    console.log(`✅ MongoDB connected successfully`);
}).catch((err) => {
    console.log("MongoDB connection failed!", err);

})

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

//setup Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

if (!global.activeLeaderboards) {
    global.activeLeaderboards = {};
}

io.on("connection", (socket) => {
    console.log("A user connected: ", socket.id);

    socket.on("joinLobby", ({ quizCode, name, role }) => {
        socket.join(quizCode);

        if (!global.activeLeaderboards[quizCode]) {
            global.activeLeaderboards[quizCode] = [];
        }

        const leaderboard = global.activeLeaderboards[quizCode];

        // check if already exists
        const alreadyExists = leaderboard.some((p) => p.id === socket.id);

        if (!alreadyExists) {
            leaderboard.push({
                id: socket.id,
                name,
                role,
                score: 0
            });

            console.log(`${name} (${role}) joined lobby ${quizCode}`);
        }

        console.log(
            `Broadcasting to room ${quizCode}. Participants: ${leaderboard.length}`
        );

        // broadcast updated list
        io.to(quizCode).emit("updateParticipants", leaderboard);
    });

    socket.on("startQuiz", ({ quizCode }) => {
        console.log(`Quiz ${quizCode} started`);

        // participants → quiz screen
        io.to(quizCode).emit("quizStarted", { quizCode });

        // organizer → leaderboard
        socket.emit(
            "leaderboardUpdate",
            global.activeLeaderboards[quizCode] || []
        );
    });

    socket.on("updateScore", ({ quizCode, name, score }) => {
        const leaderboard = global.activeLeaderboards[quizCode];
        if (leaderboard) {
            const player = leaderboard.find((p) => p.name === name);
            if (player) {
                player.score += score;
            }

            leaderboard.sort((a, b) => b.score - a.score);

            io.to(quizCode).emit("leaderboardUpdate", leaderboard);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        // remove from all leaderboards
        for (const quizCode of Object.keys(global.activeLeaderboards)) {
            const before = global.activeLeaderboards[quizCode].length;
            global.activeLeaderboards[quizCode] =
                global.activeLeaderboards[quizCode].filter(
                    (p) => p.id !== socket.id
                );

            if (
                global.activeLeaderboards[quizCode].length !== before
            ) {
                io.to(quizCode).emit(
                    "updateParticipants",
                    global.activeLeaderboards[quizCode]
                );
            }
        }
    });
});


server.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
})


