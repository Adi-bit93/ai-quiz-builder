import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext.jsx";

const socket = io("http://localhost:5000", { withCredentials: true });

export default function Lobby() {
    const location = useLocation();
    const { participant, quiz } = location.state || {};
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        if (!quiz || !participant) return;

        // join socket room
        socket.emit("joinLobby", { quizCode: quiz.code, name: participant });

        socket.on("participantJoined", (data) => {
            setParticipants((prev) => {
                if (prev.find((p) => p.id === data.id)) return prev;
                return [...prev, data];
            });
        });

        // listen for quiz start
        socket.on("quizStarted", () => {
            navigate("/quiz-start", { state: { participant, quiz } });
        });

        return () => {
            socket.off("participantJoined");
            socket.off("quizStarted");
        };

    }, [quiz, participant]);

    const handleStartQuiz = () => {
        socket.emit("startQuiz", { quizCode: quiz.code });
    };

    return (
         <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-6 font-sans">
            <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl  max-w-md border border-gray-700">
                <h1 className="text-3xl font-extrabold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">
                    {quiz.title} Lobby
                </h1>
                <p className="mb-8 text-gray-400 text-center text-sm">Waiting for the organizer to start...</p>

                <div className="bg-gray-700 p-6 rounded-2xl mb-6">
                    <p className="text-5xl font-bold text-center text-white">{participants.length}</p>
                    <p className="text-gray-400 text-center mt-2">Participants Joined</p>
                </div>

                <h2 className="font-semibold text-white mb-3 text-lg">Participants:</h2>
                <ul className="mb-6 bg-gray-700 p-4 rounded-xl space-y-2 max-h-48 overflow-y-auto">
                    {participants.map((p) => (
                        <li key={p.id} className="text-gray-200 py-2 px-3 rounded-lg transition-colors duration-200">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            {p.name}
                        </li>
                    ))}
                </ul>

                {/* Show start button only if this user is organizer */}
                {participant === "Organizer" && (
                    <button
                        onClick={handleStartQuiz}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                        Start Quiz
                    </button>
                )}
            </div>
        </div>
    )
}