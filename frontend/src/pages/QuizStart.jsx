import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ["websocket"],
});

export default function QuizStart() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { quiz, quizCode, participant } = state || {};

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(quiz?.timerSeconds || 20);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const timerRef = useRef(null);

  // Redirect if quiz data is missing
  useEffect(() => {
    if (!quiz) {
      navigate("/join");
    }
  }, [quiz, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleNext();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  // Handle next question or submit
  const handleNext = () => {
    const q = quiz.questions[currentQ];
    let updatedScore = score;
    const timeUsed = (quiz?.timerSeconds || 20) - timeLeft;

    const isAnswerCorrect = selected === q.correctIndex;

    // Calculate score
    if (isAnswerCorrect) {
      updatedScore += 10 + Math.max(0, timeLeft);
    } else if (selected !== null) {
      updatedScore -= 5;
    }

    const answerData = {
      questionText: q.text,
      selectedIndex: selected,
      correctIndex: q.correctIndex,
      isCorrect: isAnswerCorrect,
      wasAnswered: selected !== null,
      timeUsed,
    };

    const updatedAnswers = [...answers, answerData];
    setAnswers(updatedAnswers);
    setScore(updatedScore);

    // Send score to leaderboard
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
      navigate("/quiz-result", {
        state: {
          participant,
          quiz,
          finalScore: updatedScore,
          answers: updatedAnswers,
          totalQuestions: quiz.questions.length,
          completedAt: new Date().toISOString(),
        },
      });
    }
  };

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQ];
  const progressPercentage = ((currentQ + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-950 text-white p-4">
      {/* Header Section */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">{quiz?.title}</h1>
        <p className="text-sm text-gray-400 mt-1">Code: {quizCode}</p>
      </div>

      {/* Timer + Progress */}
      <div className="w-full max-w-2xl mb-4">
        <div className="flex justify-between mb-2">
          <span>
            Question {currentQ + 1} / {quiz.questions.length}
          </span>
          <span>⏱ {timeLeft}s</span>
        </div>
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-green-500 h-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQ}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-gray-800 p-6 rounded-2xl shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-4">
          {currentQuestion?.text}
        </h2>
        <div className="space-y-3">
          {currentQuestion?.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelected(index)}
              className={`w-full p-3 rounded-lg border text-left transition ${
                selected === index
                  ? "bg-green-600 border-green-400"
                  : "bg-gray-700 hover:bg-gray-600 border-gray-600"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition"
      >
        {currentQ === quiz.questions.length - 1 ? "Submit" : "Next"}
      </button>
    </div>
  );
}
