import dotenv from 'dotenv';
import connectDB from './db/index.js';
import {app} from './app.js'
import http from "http";
import { Server } from "socket.io";
import { log } from 'console';
  
dotenv.config({
    path: './env'
})
connectDB().then(() =>{
    console.log(`✅ MongoDB connected successfully`);
}).catch((err) =>{
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

 // --- LEADERBOARD EVENTS ---
    if (!global.activeLeaderboards) {
        global.activeLeaderboards = {}; //persist across sockets
    }

// Socket.IO events

io.on("connection", (socket) => {
    console.log(" A user connected: ",socket.id);

    socket.on("joinLobby", ({quizCode, name, role}) => {
        socket.join(quizCode);
        if (role === "player") {
            // just store player in lobby, no score yet
            global.activeLeaderboards[quizCode].push({ name, score: 0 });
            console.log(`${name} joined lobby ${quizCode}`);
        }

        if (role === "organizer") {
            console.log(`${name} (organizer) joined lobby ${quizCode}`);
        }

    });
    // when organizer starts quiz
    socket.on("startQuiz", ({ quizCode }) => {
        console.log(`Quiz ${quizCode} started`);

        // participants to move quiz screen
        io.to(quizCode).emit("quizStarted", { quizCode});

        // organizer move to leaderboard
        socket.emit("leadderboardUpdate", global.activeLeaderboards[quizCode]);
    });

    // socket.on("joinLeaderboard", ({ quizCode, name, role}) => {
    //     socket.join(quizCode);

    //     if(!global.activeLeaderboards[quizCode]) {
    //         global.activeLeaderboards[quizCode] = [];
    //     }

    //     if (role === "player") {
    //         global.activeLeaderboards[quizCode].push({name, score: 0});
    //     }

    //     if (role === "organizer") {
    //         socket.emit("leaderboardUpdate", global.activeLeaderboards[quizCode])
    //     }
    // });

    socket.on("updateScore", ({quizCode, name, score }) => {
        const leaderboard = global.activeLeaderboards[quizCode];
        if(leaderboard) {
           const player = leaderboard.find((p) => p.name === name);
           if(player) {
            player.score += score;
           }

            leaderboard.sort((a, b) => b.score - a.score);
            io.to(quizCode).emit("leaderboardUpdate", leaderboard);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        
    })
});

server.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
})


