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
    const [debugInfo, setDebugInfo] = useState([]);
    const socketRef = useRef(null);

    // Debug function to log events
    const addDebugInfo = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        setDebugInfo(prev => [...prev.slice(-4), `${timestamp}: ${message}`]);
        console.log(`[Leaderboard Debug] ${timestamp}: ${message}`);
    };

    useEffect(() => {
        // Validate required props
        if (!quizCode) {
            setError("Quiz code is required");
            return;
        }

        // Initialize socket connection
        socketRef.current = io("http://localhost:5000", {
            transports: ["websocket", "polling"],
            timeout: 20000,
            forceNew: true
        });

        const socket = socketRef.current;

        // Connection event listeners
        socket.on("connect", () => {
            setConnectionStatus("connected");
            setError(null);
            addDebugInfo(`Socket connected with ID: ${socket.id}`);
            
            // Join the leaderboard - MATCHES YOUR BACKEND
            const joinData = {
                quizCode: quizCode,
                name: organizerName || "Organizer",
                role: "organizer" // This matches your backend logic
            };
            
            addDebugInfo(`Joining leaderboard with data: ${JSON.stringify(joinData)}`);
            socket.emit("joinLobby", joinData);
        });

        socket.on("connect_error", (err) => {
            setConnectionStatus("error");
            setError(`Connection failed: ${err.message}`);
            addDebugInfo(`Connection error: ${err.message}`);
        });

        socket.on("disconnect", (reason) => {
            setConnectionStatus("disconnected");
            addDebugInfo(`Socket disconnected: ${reason}`);
        });

        // Leaderboard event listener - MATCHES YOUR BACKEND
        socket.on("updateParticipants", (data) => {
            addDebugInfo(`Leaderboard update received: ${data?.length || 0} participants`);
            console.log("Raw leaderboard data:", data);
            
            if (Array.isArray(data)) {
                setLeaderboard(data);
                setError(null);
            } else {
                addDebugInfo("Invalid leaderboard data format - expected array");
                console.error("Invalid leaderboard data:", data);
            }
        });

        // Participant joined event
        socket.on("participantJoined", (data) => {
            addDebugInfo(`Participant joined: ${data.name}`);
        });

        // Quiz started event
        socket.on("quizStarted", () => {
            addDebugInfo("Quiz has started!");
        });

        // Error handling
        socket.on("error", (errorData) => {
            setError(errorData.message || "Socket error occurred");
            addDebugInfo(`Socket error: ${errorData}`);
        });

        // Cleanup function
        return () => {
            if (socket) {
                socket.off("connect");
                socket.off("connect_error");
                socket.off("disconnect");
                socket.off("leaderboardUpdate");
                socket.off("participantJoined");
                socket.off("quizStarted");
                socket.off("error");
                socket.disconnect();
            }
        };
    }, [quizCode, organizerName]);

    // Manual functions for testing
    const addTestPlayer = () => {
        if (socketRef.current?.connected) {
            const testPlayerName = `Player${Math.floor(Math.random() * 100)}`;
            addDebugInfo(`Adding test player: ${testPlayerName}`);
            
            socketRef.current.emit("joinLeaderboard", {
                quizCode: quizCode,
                name: testPlayerName,
                role: "player"
            });
        }
    };

    const addTestScore = () => {
        if (socketRef.current?.connected && leaderboard.length > 0) {
            const randomPlayer = leaderboard[Math.floor(Math.random() * leaderboard.length)];
            const randomScore = Math.floor(Math.random() * 50) + 10;
            
            addDebugInfo(`Adding ${randomScore} points to ${randomPlayer.name}`);
            
            socketRef.current.emit("updateScore", {
                quizCode: quizCode,
                name: randomPlayer.name,
                score: randomScore
            });
        }
    };

    const startQuiz = () => {
        if (socketRef.current?.connected) {
            addDebugInfo("Starting quiz...");
            socketRef.current.emit("startQuiz", { quizCode });
        }
    };

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
                    <div className={`w-3 h-3 rounded-full ${
                        connectionStatus === "connected" ? "bg-green-500" : 
                        connectionStatus === "connecting" ? "bg-yellow-500" : 
                        "bg-red-500"
                    }`}></div>
                    <span className="text-sm text-gray-400">
                        Status: {connectionStatus}
                    </span>
                </div>
                
                {/* Test Controls - Remove in production */}
                {connectionStatus === "connected" && (
                    <div className="flex gap-2">
                        <button 
                            onClick={addTestPlayer}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                        >
                            Add Test Player
                        </button>
                        <button 
                            onClick={addTestScore}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                            disabled={leaderboard.length === 0}
                        >
                            Add Test Score
                        </button>
                        <button 
                            onClick={startQuiz}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                        >
                            Start Quiz
                        </button>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-600 rounded-lg text-white max-w-2xl">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Debug Info (Remove in production) */}
            <div className="mb-4 w-full max-w-2xl">
                <details className="text-xs text-gray-400">
                    <summary className="cursor-pointer hover:text-white">
                        Debug Info ({debugInfo.length})
                    </summary>
                    <div className="mt-2 p-2 bg-gray-800 rounded max-h-32 overflow-y-auto">
                        {debugInfo.map((info, index) => (
                            <div key={index} className="mb-1">{info}</div>
                        ))}
                    </div>
                </details>
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
                                    key={`${player.name}-${index}`} // Use name + index as key
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