import { useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket.js";
const Base_URL = `${import.meta.env.VITE_BACKEND_URI}/api/v1`;

export default function JoinQuiz() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("participant");
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!name || !code) {
      alert("Please enter both name and quiz code.");
      return;
    }

    try {
      const res = await fetch(`${Base_URL}/quizzes/join/${code}`);
      if (!res.ok) {
        alert("Invalid code or quiz not available.");
        return;
      }
      const fullQuizRes = await apiRequest(`/quizzes/code/${code}`);
      if (!fullQuizRes.ok) {
        alert("Could not fetch quiz details.");
        return;
      }

      const quizres = await fullQuizRes.json();
      const quiz = quizres.data || quizres;

      socket.emit("joinLobby", {
        quizCode: code,
        name,
        role,
      });

      navigate("/lobby", {
        state: {
          participant: name,
          quiz,
          quizCode: quiz.code,
          role,
        },
      });
    } catch (err) {
      console.error("Join failed: ", err);
      alert("Error joining quiz.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          🎯 Join a Quiz
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Enter your details below to join the quiz lobby.
        </p>

        {/* Name Input */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        {/* Quiz Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quiz Code
          </label>
          <input
            type="text"
            placeholder="Enter quiz code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3 text-center sm:text-left">
            Choose Your Role
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("participant")}
              className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${role === "participant"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              👤 Participant
            </button>
            <button
              type="button"
              onClick={() => setRole("organizer")}
              className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${role === "organizer"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              🛠 Organizer
            </button>
          </div>
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoin}
          className="w-full py-3 rounded-lg font-bold text-white text-lg shadow-md bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
        >
          🚀 Join Quiz
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-6 text-center">
          Make sure you have the correct quiz code before joining.
        </p>
      </div>
    </div>
  );
}