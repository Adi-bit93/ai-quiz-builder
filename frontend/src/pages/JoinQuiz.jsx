import { useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useNavigate } from "react-router-dom";
import { socket } from "../lib/socket.js";

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
      // 1️⃣ validate joining
      const res = await apiRequest(`/quizzes/join/${code}`);
      if (!res.ok) {
        alert("Invalid code or quiz not available.");
        return;
      }

      // 2️⃣ fetch full quiz details
      const fullQuizRes = await apiRequest(`/quizzes/code/${code}`);
      if (!fullQuizRes.ok) {
        alert("Could not fetch quiz details.");
        return;
      }

      const quiz = await fullQuizRes.json(); // ✅ full quiz from DB

      // 3️⃣ notify server
      socket.emit("joinLeaderboard", {
        quizCode: code,
        name,
        role,
      });

      // 4️⃣ go to lobby with original quiz
      navigate("/lobby", {
        state: {
          participant: name,
          quiz, // ✅ send full quiz object (with title & questions)
          quizCode: code,
          role,
        },
      });
    } catch (err) {
      console.error("Join failed: ", err);
      alert("Error joining quiz.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Join Quiz
        </h1>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          placeholder="Enter quiz code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Role selection */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            type="button"
            onClick={() => setRole("participant")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              role === "participant"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Participant
          </button>
          <button
            type="button"
            onClick={() => setRole("organizer")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              role === "organizer"
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Organizer
          </button>
        </div>

        <button
          onClick={handleJoin}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-bold hover:from-blue-600 hover:to-indigo-700 transition-transform transform hover:scale-105"
        >
          Join Quiz
        </button>
      </div>
    </div>
  );
}