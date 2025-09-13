import { useEffect, useState } from "react";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

const socket = io("http://localhost:5000", { transports: ["websocket"] });

export default function Leaderboard({ quizCode, organizerName }) {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        socket.emit("joinLeaderboard", {
            quizCode, 
            name: organizerName,
            role: "organizer"
        })

        socket.on("leaderboardUpdate", (data) => {
            setLeaderboard([...data])
        })

        return () => {
            socket.off("leaderboardUpdate");
        }
    }, [quizCode, organizerName]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center p-6">
            <h1 className="text-4xl font-extrabold mb-6 text-center bg-gradient-to-r from-yellow-400 to-pink-500 text-transparent bg-clip-text">Live Leaderboard</h1>

            <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6">
                <AnimatePresence>{leaderboard.map((player, index) => (
                    <motion.dev
                        key={index}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4 }}
                        className={`flex justify-between itemms-center p-4 mb-3 rounded-xl shadow-lg text-lg font-semibold
                            ${index === 0 ? "bg-yellow-500 text-black" : ""}
                            ${index === 1 ? "bg-gray-400 text-black" : ""}
                            ${index === 2 ? "bg-orange-400 text-black" : ""}
                            ${index > 2 ? "bg-gray-700 text-white" : ""}
                        `}>
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold">#{index + 1}</span>
                            <span>{player.name}</span>
                        </div>
                        <span className="text-xl">{player.score}</span>
                    </motion.dev>
                ))}</AnimatePresence>
            </div>
        </div>
    );
}
