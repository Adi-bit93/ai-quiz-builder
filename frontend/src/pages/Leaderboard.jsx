import { useEffect, useState } from "react";
import io  from "socket.io-client";
import { motion , AnimatePresence } from "framer-motion";

const socket  = io("http://localhost:5000", {transports: ["websocket"]});

export default function Leaderboard({quizCode, playerName}){
    const [ players, setPlayers ] = useState([]);

    useEffect(() => {
        socket.emit("joinLeaderboard", {quizCode, name: playerName});

        socket.on("leaderboardUpdate", (updatedPlayers) => {
            setPlayers(updatedPlayers);
        });

        return () => {
            socket.off("leaderboardUpdate");
        }
    }, [quizCode, playerName]);

    return (
        <div>
            
        </div>
    )
}
 