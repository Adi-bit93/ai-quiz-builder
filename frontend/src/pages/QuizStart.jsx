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
  const isTimeRunningOut = timeLeft <= 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {quiz?.title}
                </h1>
                <p className="text-sm text-gray-300 mt-2">
                  Welcome, <span className="font-semibold text-blue-400">{participant}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400 font-mono">
                  Score: {score}
                </div>
                <p className="text-xs text-gray-400">Quiz Code: {quizCode}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress and Timer */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-gray-200">
              Question {currentQ + 1} of {quiz.questions.length}
            </span>
            <motion.span
              animate={{
                scale: isTimeRunningOut ? [1, 1.1, 1] : 1,
                color: isTimeRunningOut ? ["#fbbf24", "#ef4444", "#fbbf24"] : "#60a5fa"
              }}
              transition={{ duration: 0.5, repeat: isTimeRunningOut ? Infinity : 0 }}
              className={`text-2xl font-bold font-mono ${
                isTimeRunningOut ? "text-red-400" : "text-blue-400"
              }`}
            >
              {timeLeft}s
            </motion.span>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/50"
            ></motion.div>
          </div>
        </div>

        {/* Question Card */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 mb-8"
            >
              {/* Question Text */}
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl md:text-3xl font-bold mb-8 text-white leading-relaxed"
              >
                {currentQuestion?.text}
              </motion.h2>

              {/* Options Grid */}
              <div className="space-y-4">
                {currentQuestion?.options?.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelected(index)}
                    className={`w-full p-4 rounded-2xl text-left font-semibold text-lg transition-all duration-200 border-2 backdrop-blur-sm ${
                      selected === index
                        ? "bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-400 text-green-100 shadow-lg shadow-green-500/50"
                        : "bg-white/10 border-white/20 text-gray-100 hover:bg-white/15 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          selected === index
                            ? "bg-green-400 text-white"
                            : "bg-white/20 text-gray-300"
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                      </span>
                      {selected === index && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-400 text-2xl"
                        >
                          ✓
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Next/Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 justify-center"
          >
            <button
              onClick={handleNext}
              disabled={selected === null}
              className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg ${
                selected === null
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
              }`}
            >
              {currentQ === quiz.questions.length - 1 ? (
                <span className="flex items-center gap-2">
                  Submit Quiz
                  <span className="text-xl">→</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Next Question
                  <span className="text-xl">→</span>
                </span>
              )}
            </button>
          </motion.div>

          {/* Question Counter at bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8 text-gray-400 text-sm"
          >
            {selected === null ? (
              <p className="text-yellow-400">← Select an option to continue</p>
            ) : (
              <p className="text-gray-300">Press the button to proceed</p>
            )}
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}