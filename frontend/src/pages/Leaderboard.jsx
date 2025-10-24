import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";


export default function Leaderboard({ quizCode, organizerName }) {
    const state = useLocation().state || {};
    quizCode = quizCode || state.quizCode;
    organizerName = organizerName || state.organizerName || "Organizer";
    const [leaderboard, setLeaderboard] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState("connecting");
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const socket = io(`${import.meta.env.BACKEND_URI}`, {
            withCredentials: true,
            transports: ["websocket"],
        });

        // Validate required props
        if (!quizCode) {
            setError("Quiz code is required");
            return;
        }

        // Connection event listeners
        socket.on("connect", () => {
            setConnectionStatus("connected");
            setError(null);

            // Join the leaderboard room
            const joinData = {
                quizCode: quizCode,
                name: organizerName || "Organizer",
                role: "organizer"
            };
            socket.emit("joinLobby", joinData);
        });

        socket.on("connect_error", (err) => {
            setConnectionStatus("error");
            setError(`Connection failed: ${err.message}`);
        });

        socket.on("disconnect", (reason) => {
            setConnectionStatus("disconnected");
        });

        socket.on("updateParticipants", (data) => {
            console.log("Raw leaderboard data (updateParticipants):", data);

            if (Array.isArray(data)) {
                // sort descending by score
                const sorted = data.slice().sort((a, b) => b.score - a.score);
                setLeaderboard(sorted);
                setError(null);
            } else {
                console.error("Invalid updateParticipants data:", data);
            }
        });

        // leaderboard updates (scores changed)
        socket.on("leaderboardUpdate", (data) => {
            if (Array.isArray(data)) {
                const sorted = data.slice().sort((a, b) => b.score - a.score);
                setLeaderboard(sorted);
                setError(null);
            } else {
                console.error("Invalid leaderboardUpdate payload:", data);
            }
        });

        // small helper events
        socket.on("participantJoined", (data) => {
            console.log("Participant joined:", data)
        });

        socket.on("quizStarted", () => {
            console.log("Quiz Started");
            
        });

        socket.on("error", (errorData) => {
            setError(errorData.message || "Socket error occurred");
            console.log(`Socket error: ${JSON.stringify(errorData)}`);
        });

        // Cleanup on unmount
        return () => {
            if (socket) {
                socket.off("connect");
                socket.off("connect_error");
                socket.off("disconnect");
                socket.off("updateParticipants");
                socket.off("leaderboardUpdate");
                socket.off("participantJoined");
                socket.off("quizStarted");
                socket.off("error");
                socket.disconnect();
            }
        };
    }, [quizCode, organizerName]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center p-6">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-transparent bg-clip-text">
                    Live Leaderboard
                </h1>
                <p className="text-gray-400">Quiz Code: {quizCode}</p>
                <p className="text-gray-500 text-sm">Organizer: {organizerName}</p>
            </div>

            {/* Connection Status & Controls */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${connectionStatus === "connected" ? "bg-green-500" :
                        connectionStatus === "connecting" ? "bg-yellow-500" :
                            "bg-red-500"
                        }`}></div>
                    <span className="text-sm text-gray-400">
                        Status: {connectionStatus}
                    </span>
                </div>
            </div>

            
           

            {/* Leaderboard Display */}
            <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6">
                {leaderboard.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <div className="text-6xl mb-4">🏆</div>
                        <h3 className="text-xl font-semibold mb-2">No participants yet</h3>
                        <p className="text-gray-500">
                            Waiting for players to join...
                        </p>
                        <div className="mt-4 p-3 bg-gray-700 rounded-lg text-sm">
                            <p><strong>Debug:</strong> Use "Add Test Player" button above to simulate participants</p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 text-center">
                            <p className="text-gray-400">
                                {leaderboard.length} participant{leaderboard.length !== 1 ? 's' : ''} competing
                            </p>
                        </div>

                        <AnimatePresence>
                            {leaderboard.map((player, index) => (
                                <motion.div
                                    key={`${player.id}-${index}`}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.4 }}
                                    className={`flex justify-between items-center p-4 mb-3 rounded-xl shadow-lg text-lg font-semibold
                                        ${index === 0 ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black" : ""}
                                        ${index === 1 ? "bg-gradient-to-r from-gray-300 to-gray-500 text-black" : ""}
                                        ${index === 2 ? "bg-gradient-to-r from-orange-400 to-orange-600 text-black" : ""}
                                        ${index > 2 ? "bg-gradient-to-r from-gray-700 to-gray-600 text-white" : ""}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Rank with Medal */}
                                        <span className="text-xl font-bold flex items-center">
                                            {index === 0 && "🥇"}
                                            {index === 1 && "🥈"}
                                            {index === 2 && "🥉"}
                                            {index > 2 && `#${index + 1}`}
                                        </span>
                                        <span className="truncate">{player.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl">{player.score}</span>
                                        <span className="text-sm opacity-75 ml-1">pts</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="mt-6 text-center text-gray-500 text-sm max-w-md">
                <p>Real-time leaderboard updates as participants answer questions.</p>
                <p className="mt-1">Rankings change instantly based on score and speed!</p>
            </div>
        </div>
    );
}
