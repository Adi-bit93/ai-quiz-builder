import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

export default function QuizStart() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const participant = state?.participant;
  const quiz = state?.quiz;
  const role = state?.role;


  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(quiz?.timerSeconds || 20);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  
  // Socket connection state
  const [socketConnected, setSocketConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [debugInfo, setDebugInfo] = useState([]);
  const socketRef = useRef(null);

  // Debug function
  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const debugMessage = `${timestamp}: ${message}`;
    setDebugInfo(prev => [...prev.slice(-4), debugMessage]);
    console.log(`[QuizStart Debug] ${debugMessage}`);
  };
    
  // Initialize socket connection
  useEffect(() => {
    if (!quiz || !participant) {
      addDebugInfo("❌ Missing quiz or participant data");
      return;
    }

    const quizCode = quiz.code || quiz.quizCode || "TEST123";
    addDebugInfo(`🚀 Initializing socket connection for ${participant} in quiz ${quizCode}`);

    // Create new socket instance
    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: false // Allow connection reuse
    });

    const socket = socketRef.current;

    // Connection handlers
    socket.on("connect", () => {
      setSocketConnected(true);
      setConnectionAttempts(0);
      addDebugInfo(`✅ Socket connected! ID: ${socket.id}`);
      
      // Register as participant immediately after connection
      const registrationData = {
        quizCode: quizCode,
        name: participant,
        role: "player"
      };
      
      addDebugInfo(`📝 Registering participant: ${JSON.stringify(registrationData)}`);
      socket.emit("joinLeaderboard", registrationData);
    });

    socket.on("connect_error", (error) => {
      setSocketConnected(false);
      setConnectionAttempts(prev => prev + 1);
      addDebugInfo(`❌ Connection error (attempt ${connectionAttempts + 1}): ${error.message}`);
      
      // Log more details about the error
      if (error.message.includes("xhr poll error")) {
        addDebugInfo("💡 Hint: Make sure backend server is running on port 5000");
      }
    });

    socket.on("disconnect", (reason) => {
      setSocketConnected(false);
      addDebugInfo(`🔌 Socket disconnected: ${reason}`);
      
      if (reason === "io server disconnect") {
        // Server initiated disconnect, reconnect manually
        addDebugInfo("🔄 Server disconnected, attempting reconnection...");
        socket.connect();
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      addDebugInfo(`🔄 Reconnected after ${attemptNumber} attempts`);
    });

    socket.on("reconnect_error", (error) => {
      addDebugInfo(`❌ Reconnection failed: ${error.message}`);
    });

    // Quiz-specific event listeners
    socket.on("leaderboardUpdate", (leaderboard) => {
      addDebugInfo(`📊 Leaderboard update: ${leaderboard?.length || 0} participants`);
      
      // Find our participant to confirm score update
      const ourParticipant = leaderboard?.find(p => p.name === participant);
      if (ourParticipant) {
        addDebugInfo(`🎯 Our leaderboard score: ${ourParticipant.score}`);
      } else {
        addDebugInfo(`⚠️ We're not in the leaderboard yet`);
      }
    });

    socket.on("participantJoined", (data) => {
      if (data.name === participant) {
        addDebugInfo(`✅ Confirmed: We joined the quiz as ${data.name}`);
      } else {
        addDebugInfo(`👋 Another participant joined: ${data.name}`);
      }
    });

    socket.on("quizStarted", () => {
      addDebugInfo("🚀 Quiz started event received");
    });

    // Error handler
    socket.on("error", (error) => {
      addDebugInfo(`⚠️ Socket error: ${error}`);
    });

    // Cleanup
    return () => {
      if (socket) {
        addDebugInfo("🧹 Cleaning up socket connection");
        socket.removeAllListeners();
        socket.disconnect();
      }
    };
  }, [quiz, participant]);

  // Force reconnection function
  const forceReconnect = () => {
    addDebugInfo("🔄 Forcing socket reconnection...");
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
  };
  
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
      const timeUsed = (quiz.timerSeconds || 20) - timeLeft;

      let updatedScore = score;
      let deltaScore = 0;
      
      if (isCorrect) {
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

      const quizCode = quiz.code || quiz.quizCode || "TEST123";
      
      addDebugInfo(`📝 Q${currentQ + 1}: Selected=${selected}, Correct=${isCorrect}, Score=+${deltaScore}`);

      // Send score update - with better error handling
      if (socketConnected && socketRef.current?.connected) {
        const scoreUpdate = {
          quizCode: quizCode,
          name: participant,
          score: deltaScore
        };
        
        addDebugInfo(`📤 Sending score update: ${JSON.stringify(scoreUpdate)}`);
        socketRef.current.emit("updateScore", scoreUpdate);
        
        // Wait a moment to see if we get a leaderboard update
        setTimeout(() => {
          addDebugInfo(`✅ Score update sent successfully`);
        }, 100);
      } else {
        addDebugInfo(`❌ Cannot send score: Socket connected=${socketConnected}, Socket exists=${!!socketRef.current}`);
        
        // Try to reconnect if disconnected
        if (!socketConnected && socketRef.current) {
          addDebugInfo("🔄 Attempting to reconnect before sending score...");
          socketRef.current.connect();
        }
      }
      
      // Build answer object
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
        wasAnswered: selected !== null,
        scoreEarned: deltaScore
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
        // Quiz completed
        addDebugInfo(`🏁 Quiz completed! Final score: ${updatedScore}`);
        
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
        });
      }
    } catch (error) {
      console.error("Error processing answer:", error);
      addDebugInfo(`💥 Error processing answer: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isSubmitting) return;
      
      if (e.key >= '1' && e.key <= '4') {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < quiz?.questions[currentQ]?.options?.length) {
          setSelected(optionIndex);
        }
      }
      
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header with Connection Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
            <div className="flex items-center gap-4">
              {/* Enhanced Socket Status */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50">
                <div className={`w-3 h-3 rounded-full ${
                  socketConnected ? "bg-green-500" : "bg-red-500"
                }`}></div>
                <span className={`text-sm font-medium ${
                  socketConnected ? "text-green-700" : "text-red-700"
                }`}>
                  {socketConnected ? "Connected" : "Disconnected"}
                </span>
                {!socketConnected && (
                  <button
                    onClick={forceReconnect}
                    className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Reconnect
                  </button>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                Score: <span className="font-semibold text-blue-600">{score}</span>
              </div>
              
              <div className="text-sm text-gray-600">
                Player: <span className="font-medium">{participant}</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Question {currentQ + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Connection Warning */}
        {!socketConnected && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="text-red-500 text-xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-red-800">Connection Issue</h3>
                <p className="text-red-600 text-sm">
                  Unable to connect to server. Scores won't be sent to leaderboard.
                  <br />
                  Make sure your backend is running on port 5000.
                </p>
                <button
                  onClick={forceReconnect}
                  className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Try Reconnecting
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Debug Info */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2">
              🐛 Debug Info ({debugInfo.length})
              {connectionAttempts > 0 && (
                <span className="text-red-500 text-xs">
                  {connectionAttempts} failed attempts
                </span>
              )}
            </summary>
            <div className="mt-3 space-y-1">
              {debugInfo.length === 0 ? (
                <p className="text-gray-500 italic">No debug info yet...</p>
              ) : (
                debugInfo.map((info, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded ${
                      info.includes('❌') ? 'bg-red-50 text-red-700' :
                      info.includes('✅') ? 'bg-green-50 text-green-700' :
                      info.includes('⚠️') ? 'bg-yellow-50 text-yellow-700' :
                      'bg-gray-50 text-gray-600'
                    }`}
                  >
                    {info}
                  </div>
                ))
              )}
            </div>
          </details>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Timer */}
          <div className="flex justify-center mb-6">
            <div className={`text-4xl font-bold px-6 py-3 rounded-full ${
              timeLeft <= 5 ? 'bg-red-100 text-red-600' : 
              timeLeft <= 10 ? 'bg-yellow-100 text-yellow-600' : 
              'bg-green-100 text-green-600'
            }`}>
              {timeLeft}s
            </div>
          </div>

          {/* Question */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
            {currentQuestion.text}
          </h2>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelected(index)}
                disabled={isSubmitting}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  selected === index
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-25'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}`}
              >
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Next Button */}
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              disabled={selected === null || isSubmitting}
              className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
                selected !== null && !isSubmitting
                  ? 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                currentQ === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'
              )}
            </button>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>💡 Tip: Use keys 1-4 to select options, Enter to proceed</p>
          </div>
        </div>
      </div>
    </div>
  );
}