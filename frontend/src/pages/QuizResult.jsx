import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function QuizResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDetailedResults, setShowDetailedResults] = useState(true);
  
  const { 
    quiz, 
    answers, 
    score, 
    totalQuestions, 
    participant, 
    completedAt, 
    timeTaken 
  } = location.state || { 
    quiz: null, 
    answers: [], 
    score: 0, 
    totalQuestions: 0,
    participant: null,
    completedAt: null,
    timeTaken: 0
  };

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Results Available</h2>
          <p className="text-gray-600 mb-4">Quiz results could not be found.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const percentage = Math.round((score / quiz.questions.length) * 100);
  const correctAnswers = score;
  const incorrectAnswers = answers.filter(a => a.wasAnswered && !a.isCorrect).length;
  const unansweredQuestions = answers.filter(a => !a.wasAnswered).length;
  const averageTimePerQuestion = timeTaken / quiz.questions.length;

  // Performance evaluation
  const getPerformanceData = (percentage) => {
    if (percentage >= 90) return { 
      message: "Outstanding! 🎉", 
      color: "text-green-600", 
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      grade: "A+"
    };
    if (percentage >= 80) return { 
      message: "Excellent! 🌟", 
      color: "text-green-600", 
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      grade: "A"
    };
    if (percentage >= 70) return { 
      message: "Good job! 👍", 
      color: "text-blue-600", 
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      grade: "B"
    };
    if (percentage >= 60) return { 
      message: "Not bad! 📖", 
      color: "text-yellow-600", 
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      grade: "C"
    };
    if (percentage >= 50) return { 
      message: "Keep trying! 💪", 
      color: "text-orange-600", 
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      grade: "D"
    };
    return { 
      message: "Need more practice! 📚", 
      color: "text-red-600", 
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      grade: "F"
    };
  };

  const performance = getPerformanceData(percentage);

  const handlePrint = () => {
    window.print();
  };

  const handleShareResults = async () => {
    const shareData = {
      title: `Quiz Results: ${quiz.title}`,
      text: `I scored ${score}/${quiz.questions.length} (${percentage}%) on "${quiz.title}"!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
            {participant && (
              <p className="text-lg text-gray-600 mb-2">
                Congratulations, <span className="font-semibold text-blue-600">{participant}</span>!
              </p>
            )}
            <h2 className="text-xl text-gray-700">{quiz.title}</h2>
            {completedAt && (
              <p className="text-sm text-gray-500 mt-2">
                Completed on {new Date(completedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Score Summary */}
        <div className={`rounded-2xl shadow-lg p-8 mb-6 border-2 ${performance.bgColor} ${performance.borderColor}`}>
          <div className="text-center">
            {/* Main Score Display */}
            <div className="flex justify-center items-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-1">{score}</div>
                <div className="text-sm text-gray-600 font-medium">Correct</div>
              </div>
              <div className="text-3xl text-gray-400">/</div>
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-700 mb-1">{quiz.questions.length}</div>
                <div className="text-sm text-gray-600 font-medium">Total</div>
              </div>
              <div className="text-center ml-4">
                <div className={`text-3xl font-bold mb-1 ${performance.color}`}>{performance.grade}</div>
                <div className="text-sm text-gray-600 font-medium">Grade</div>
              </div>
            </div>

            {/* Progress Circle */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="3"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500 transition-all duration-2000 ease-out"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={`${percentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-700">{percentage}%</span>
              </div>
            </div>

            <p className={`text-xl font-semibold mb-4 ${performance.color}`}>
              {performance.message}
            </p>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-xs text-gray-600">Correct</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
                <div className="text-xs text-gray-600">Incorrect</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-gray-600">{unansweredQuestions}</div>
                <div className="text-xs text-gray-600">Unanswered</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{averageTimePerQuestion.toFixed(1)}s</div>
                <div className="text-xs text-gray-600">Avg/Question</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setShowDetailedResults(!showDetailedResults)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {showDetailedResults ? 'Hide' : 'Show'} Detailed Results
            </button>
            
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 transition font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Results
            </button>

            <button
              onClick={handleShareResults}
              className="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share Results
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Detailed Results */}
        {showDetailedResults && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              📋 Detailed Results
            </h3>
            
            <div className="space-y-6">
              {quiz.questions.map((question, idx) => {
                const answer = answers[idx];
                const userAnswerIndex = answer?.selectedIndex;
                const correctIndex = question.correctIndex;
                const isCorrect = answer?.isCorrect;
                const wasAnswered = answer?.wasAnswered;

                return (
                  <div
                    key={idx}
                    className={`border-l-4 rounded-lg p-6 transition-all hover:shadow-md ${
                      !wasAnswered
                        ? 'border-gray-400 bg-gray-50'
                        : isCorrect 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-red-500 bg-red-50'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-gray-800 text-lg leading-relaxed flex-1">
                        <span className="text-blue-600 mr-2">{idx + 1}.</span>
                        {question.text}
                      </h4>
                      <div className="ml-4 flex-shrink-0">
                        {!wasAnswered ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            ⏱️ No Answer
                          </span>
                        ) : isCorrect ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            ✅ Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            ❌ Incorrect
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Options */}
                    <div className="grid gap-3">
                      {question.options.map((option, oIdx) => {
                        const isUserChoice = oIdx === userAnswerIndex;
                        const isCorrectAnswer = oIdx === correctIndex;

                        let optionClasses = "px-4 py-3 rounded-lg border-2 flex items-center justify-between transition-all ";

                        if (isCorrectAnswer) {
                          optionClasses += "border-green-400 bg-green-100 text-green-800";
                        } else if (isUserChoice && !isCorrectAnswer) {
                          optionClasses += "border-red-400 bg-red-100 text-red-700";
                        } else {
                          optionClasses += "border-gray-200 bg-white text-gray-700";
                        }

                        return (
                          <div key={oIdx} className={optionClasses}>
                            <span className="flex-1 font-medium">{option}</span>
                            <div className="flex gap-2">
                              {isUserChoice && (
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                  Your Answer
                                </span>
                              )}
                              {isCorrectAnswer && (
                                <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-full font-medium">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                      <div className="flex gap-4">
                        {answer?.timeUsed !== undefined && (
                          <span>⏱️ Time used: {answer.timeUsed}s</span>
                        )}
                        {quiz.timerSeconds && (
                          <span>⏰ Time allowed: {quiz.timerSeconds}s</span>
                        )}
                      </div>
                      {answer?.timeUsed !== undefined && quiz.timerSeconds && (
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          answer.timeUsed <= quiz.timerSeconds / 2 
                            ? 'bg-green-100 text-green-700' 
                            : answer.timeUsed <= quiz.timerSeconds * 0.8
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {answer.timeUsed <= quiz.timerSeconds / 2 ? '🚀 Fast' : 
                           answer.timeUsed <= quiz.timerSeconds * 0.8 ? '⚡ Average' : '🐌 Slow'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Statistics */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">📊 Performance Summary</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {((correctAnswers / quiz.questions.length) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {timeTaken ? Math.floor(timeTaken / 60) + 'm ' + (timeTaken % 60) + 's' : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Total Time</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {quiz.difficulty || 'Medium'}
                  </div>
                  <div className="text-sm text-gray-600">Quiz Difficulty</div>
                </div>
              </div>

              {/* Performance Insights */}
              <div className="mt-6 p-4 bg-white rounded-lg">
                <h5 className="font-semibold text-gray-700 mb-2">💡 Performance Insights</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {percentage >= 80 && (
                    <li>• Excellent understanding of the material!</li>
                  )}
                  {percentage >= 60 && percentage < 80 && (
                    <li>• Good grasp of concepts, with room for improvement in some areas.</li>
                  )}
                  {percentage < 60 && (
                    <li>• Consider reviewing the material and practicing more questions.</li>
                  )}
                  {averageTimePerQuestion < (quiz.timerSeconds || 10) / 2 && (
                    <li>• You answered questions quickly - great time management!</li>
                  )}
                  {unansweredQuestions > 0 && (
                    <li>• Try to manage time better to answer all questions.</li>
                  )}
                  {incorrectAnswers === 0 && correctAnswers > 0 && (
                    <li>• Perfect score on answered questions! 🎯</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Quiz completed • Results saved • Keep learning! 📚</p>
        </div>
      </div>
    </div>
  );
}