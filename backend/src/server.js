import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
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

// Socket.IO events

io.on("connection", (socket) => {
    console.log(" A user connected: ",socket.id);

    socket.on("joinLobby", ({quizCode, name}) => {
        socket.join(quizCode);
        console.log(`${name} joined lobby ${quizCode}`);
        
        io.to(quizCode).emit("participantJoined", {
            id : socket.id,
            name,
        });

    });

    // --- LEADERBOARD EVENTS ---
    if (!global.activeLeaderboards) {
        global.activeLeaderboards = {}; //persist across sockets
    }

    socket.on("joinLeaderboard", ({ quizId, name}) => {
        socket.join(quizId);

        if(!global.activeLeaderboards[quizId]) {
            global.activeLeaderboards[quizId] = [];
        }

        global.activeLeaderboards[quizId].push({name, score: 0});
        io.to(quizId).emit(
            "leaderboardUpdate",
            global.activeLeaderboards[quizId]
        );
    });

    socket.on("updateScore", ({quizId, name, score }) => {
        const leaderboard = global.activeLeaderboards[quizId];
        if(leaderboard) {
            const player = leaderboard.find((p) => p.name === name);
            if (player) player.score = score;

            leaderboard.sort((a, b) => b.score - a.score);
            io.to(quizId).emit("leaderboardUpdate", leaderboard);
        }
    });


    socket.on("startQuiz", ({ quizCode }) => {
        io.to(quizCode).emit("quizStarted");
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        
    })
});

server.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
})


