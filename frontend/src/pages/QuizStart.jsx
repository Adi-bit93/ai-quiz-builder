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
  const [timeLeft, setTimeLeft] = useState(quiz?.data?.timerSeconds || 20);
  const [answers, setAnswers] = useState([]);

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

  // In QuizStart.jsx

  const handleNext = () => {
    const q = quiz.data?.questions[currentQ];
    let updatedScore = score;
    const timeUsed = (quiz?.data?.timerSeconds || 20) - timeLeft;

    // Determine if the selected answer is correct
    const isAnswerCorrect = selected === q.correctIndex;

    // Calculate score
    if (isAnswerCorrect) {
      updatedScore += 10 + Math.max(0, timeLeft); // Add points for correct answer + time bonus
    } else if (selected !== null) {
      updatedScore -= 5; // Subtract points for incorrect answer
    }
    // No score change if unanswered (timeLeft <= 0)

    // 1. ✅ Create a detailed object for the current answer
    const answerData = {
      questionText: q.text,
      selectedIndex: selected,
      correctIndex: q.correctIndex,
      isCorrect: isAnswerCorrect,
      wasAnswered: selected !== null, // Check if an option was actually selected
      timeUsed: timeUsed,
    };

    // 2. ✅ Add the new answer to our state
    const updatedAnswers = [...answers, answerData];
    setAnswers(updatedAnswers);

    setScore(updatedScore);

    // Send latest score to server                                                                    
    socket.emit("updateScore", {
      quizCode: quiz.data.code,
      name: participant,
      score: updatedScore,
    });

    // Move to the next question or finish
    if (currentQ < quiz.data.questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelected(null); // Reset selection for the next question
      setTimeLeft(quiz.data.timerSeconds || 20); // Reset timer
    } else {
      // 3. ✅ On the final question, navigate with the COMPLETE list of answers
      navigate("/quiz-result", {
        state: {
          participant,
          quiz,
          finalScore: updatedScore, // Use a consistent name
          answers: updatedAnswers, // Pass the full, updated answers array
          totalQuestions: quiz.data.questions.length,
          completedAt: new Date().toISOString(),
        },
      });
    }
  };

  // Timer color based on time left
  const getTimerColor = () => {
    if (timeLeft > 10) return "text-green-500";
    if (timeLeft > 5) return "text-yellow-500";
    return "text-red-500 animate-pulse";
  };

  // Progress percentage
  const progressPercentage = ((currentQ + 1) / quiz?.data?.questions?.length) * 100;

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col overflow-hidden">
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col">
        {/* Header - Compact */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-gray-800 truncate flex-1">
              {quiz.data?.title}
            </h1>
            {/* Timer */}
            <div className={`flex items-center gap-1 text-lg font-semibold ${getTimerColor()} flex-shrink-0`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Question {currentQ + 1} of {quiz.data.questions?.length}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card - Flexible height */}
        <div className="bg-white rounded-xl shadow-lg p-4 flex-1 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {quiz.data.questions[currentQ].text}
          </h2>

          {/* Options - Scrollable if needed */}
          <div className="flex-1 space-y-2 overflow-y-auto">
            {quiz.data.questions[currentQ].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${selected === i
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200"
                  }`}
              >
                <div className="flex items-center">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold mr-3 ${selected === i ? "bg-white/20" : "bg-gray-200"
                    }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm">{opt}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Bottom section */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Score: <span className="font-semibold text-gray-700">{score}</span>
            </p>

            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg shadow hover:shadow-md transform hover:scale-105 transition-all duration-200 text-sm"
            >
              {currentQ === quiz.data.questions?.length - 1 ? (
                <span className="flex items-center gap-1">
                  Finish
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}