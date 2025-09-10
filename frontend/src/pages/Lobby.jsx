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
         <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center">{quiz.title} Lobby</h1>
                <p className="mb-4 text-gray-600 text-center">Waiting for organizer to start...</p>

                <h2 className="font-semibold mb-2">Participants:</h2>
                <ul className="mb-6">
                    {participants.map((p) => (
                        <li key={p.id} className="border-b py-2">{p.name}</li>
                    ))}
                </ul>

                {/* Show start button only if this user is organizer */}
                {participant === "Organizer" && (
                    <button
                        onClick={handleStartQuiz}
                        className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
                    >
                        Start Quiz
                    </button>
                )}
            </div>
        </div>
    )
}