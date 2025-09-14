import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

export default function QuizStart() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const participant = state?.participant;
  const quiz = state?.quiz;

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(quiz?.timerSeconds || 20);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [score, setScore] = useState(0);

  // Timer effect
  useEffect(() => {
    if (!quiz || isSubmitting) return;
    
    if (timeLeft <= 0) {
      handleNext();
      return;
    }

    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, quiz, isSubmitting]);

  const handleNext = async () => {
    if (!quiz || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const currentQuestion = quiz.questions[currentQ];

      const isCorrect = selected !== null && selected === currentQuestion.correctIndex;
      const timeUsed = (quiz.timerSeconds || 20) - timeLeft

      let updatedScore = score;
      let deltaScore = 0;
      if(isCorrect){
        const baseScore = 10;
        const speedBonus = Math.max(0, timeLeft);
        deltaScore = baseScore + speedBonus;
        updatedScore += deltaScore;
      } else {
        const penalty = 5;
        deltaScore = -penalty;
        updatedScore -= penalty;
      }
      setScore(updatedScore);

      socket.emit("updateScore", {
        quizCode: quiz.code,
        name: participant,
        score: deltaScore,
      })
      
      // Build answer object with comprehensive data
      const answerData = {
        questionIndex: currentQ,
        question: currentQuestion.text,
        selectedIndex: selected !== null ? Number(selected) : null,
        selectedAnswer: selected !== null ? currentQuestion.options[selected] : null,
        correctIndex: currentQuestion.correctIndex,
        correctAnswer: currentQuestion.correctIndex !== undefined 
          ? currentQuestion.options[currentQuestion.correctIndex] 
          : null,
        isCorrect,
        timeUsed,
        wasAnswered: selected !== null
      };

      const updatedAnswers = [...answers, answerData];

      if (currentQ < quiz.questions.length - 1) {
        // Move to next question
        setAnswers(updatedAnswers);
        setCurrentQ((prev) => prev + 1);
        setSelected(null);
        setTimeLeft(quiz.timerSeconds || 20);
        setIsSubmitting(false);
      } else {
        navigate("/quiz-result", {
          state: {
            participant,
            quiz,
            answers: updatedAnswers,
            totalQuestions: quiz.questions.length,
            completedAt: new Date().toISOString(),
            timeTaken: updatedAnswers.reduce((total, a) => total + a.timeUsed, 0),
            finalScore: updatedScore,
          },
        })
      }
    } catch (error) {
      console.error("Error processing answer:", error);
      setIsSubmitting(false);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isSubmitting) return;
      
      // Number keys 1-4 to select options
      if (e.key >= '1' && e.key <= '4') {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < quiz?.questions[currentQ]?.options?.length) {
          setSelected(optionIndex);
        }
      }
      
      // Enter or Space to proceed
      if ((e.key === 'Enter' || e.key === ' ') && selected !== null) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selected, isSubmitting, currentQ, quiz]);

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quiz Not Found</h2>
          <p className="text-gray-600 mb-4">No quiz data available.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQ];
  const progress = ((currentQ + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
          {participant && (
            <p className="text-gray-600">Good luck, {participant.name}!</p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQ + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
            timeLeft <= 5 
              ? 'bg-red-100 text-red-700 animate-pulse' 
              : timeLeft <= 10
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-blue-100 text-blue-700'
          }`}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {timeLeft}s remaining
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
            {currentQuestion.text}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !isSubmitting && setSelected(index)}
                disabled={isSubmitting}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 group ${
                  selected === index 
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md" 
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${
                    selected === index 
                      ? "border-blue-500 bg-blue-500" 
                      : "border-gray-300 group-hover:border-gray-400"
                  }`}>
                    {selected === index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="flex-1 font-medium">{option}</span>
                  <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Press {index + 1}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selected === null ? (
              <span>Select an answer or wait for time to expire</span>
            ) : (
              <span>Press Enter or click Next to continue</span>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={isSubmitting || (selected === null && timeLeft > 0)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              isSubmitting
                ? 'bg-gray-400 text-white cursor-wait'
                : selected !== null || timeLeft === 0
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Processing...
              </>
            ) : currentQ === quiz.questions.length - 1 ? (
              <>
                Finish Quiz
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </>
            ) : (
              <>
                Next Question
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          💡 Tip: Use number keys (1-4) to select options, Enter to continue
        </div>
      </div>
    </div>
  );
}