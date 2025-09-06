import { useState } from "react";
import { apiWithAutoRefresh, apiRequest } from "../lib/api.js";
import { useNavigate } from "react-router-dom";

export default function JoinQuiz() {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const navigate = useNavigate();

    const handleJoin = async () => {
        try {
            const res = await apiRequest(`/quizzes/join/${code}`);
            if(res.ok) {
                const json = await res.json();
                navigate("/quiz-start", { state: { participant: name, quiz: json.data } });
            } else {
                alert("Invalid code or quiz not available.");
            }
        } catch (err) {
            console.error("Join failed: ",err);
            alert("Error joining quiz.");
            
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Join Quiz</h1>

                <input type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 mb-4 border rounded-lg"
                />

                <input type="text"
                    placeholder="Enter quiz code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-3 mb-4 border rounded-lg"
                />

                <button
                    onClick={handleJoin}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
                >
                    Join Quiz
                </button>
            </div>
        </div>
    )
}