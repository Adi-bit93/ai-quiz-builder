import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function QuizStart() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const participant = state?.participant;
  const quiz = state?.quiz;

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz?.timerSeconds || 20);

  // Timer
  useEffect(() => {
    if (!quiz) return;
    if (timeLeft <= 0) {
      handleNext();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleNext = () => {
    const q = quiz.questions[currentQ];
    let updatedScore = score;

    if (selected === q.correctIndex) {
      updatedScore += 10 + Math.max(0, timeLeft);
    } else {
      updatedScore -= 5;
    }

    setScore(updatedScore);

    // Send score to server
    socket.emit("updateScore", {
      quizCode: quiz.code,
      name: participant,
      score: updatedScore,
    });

    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelected(null);
      setTimeLeft(quiz.timerSeconds || 20);
    } else {
      navigate("/quiz-result", { state: { participant, quiz, score: updatedScore } });
    }
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4 text-black">{quiz.title}</h2>
      <p className="mb-2 text-black">Question {currentQ + 1} of {quiz.questions.length}</p>
      <p className="mb-4 text-black">{quiz.questions[currentQ].text}</p>

      <div className="flex flex-col gap-2 mb-6">
        {quiz.questions[currentQ].options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`px-4 py-2 rounded-lg border ${selected === i ? "bg-blue-500" : "bg-gray-700"}`}
          >
            {opt}
          </button>
        ))}
      </div>

      <p className="mb-4">⏱ Time left: {timeLeft}s</p>

      <button
        onClick={handleNext}
        className="px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600"
      >
        {currentQ === quiz.questions.length - 1 ? "Finish" : "Next"}
      </button>
    </div>
  );
}
