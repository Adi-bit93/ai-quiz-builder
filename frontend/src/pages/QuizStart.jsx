import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function QuizStart(){
    const { state } = useLocation();
    const navigate = useNavigate();


    const participant = state?.participant;
    const quiz = state?.quiz;

    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(quiz.timerSeconds);

    useEffect(() => {
        if (timeLeft <= 0) {
            handleNext();
            return;
        }

        const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft]);

    const handleNext = () => {
        setAnswers((prev) => [
            ...prev,
            { question: quiz.questions[currentQ].text, selected}
        ]);

        setSelected(null)

        if (currentQ < quiz.questions.length - 1) {
            setCurrentQ((prev) => prev + 1);
            setTimeLeft(quiz.timerSeconds);
        } else {
            navigate("/quiz-result", {
                state: {participant, quiz, answers}
            });
        }
    };

    if(!quiz) return <div>No quiz data found.</div>;
    const q = quiz.questions[currentQ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">
                <h1 className="text-xl font-bold mb-4">{quiz.title}</h1>
                <p className="text-gray-600 mb-6" > 
                    Question {currentQ + 1} of {quiz.questions.length}
                </p>
                {/* Timer */}
                <div className="text-right mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                        ⏳ {timeLeft}s
                    </span>
                </div>
                 {/* Question */}
                 <h2 className="text-lg font-semibold mb-4">{q.text}</h2>
                 {/* Options */}
                 <div className="space-y-3">
                    {q.options.map((opt, i) => (
                        <button 
                            key={i}
                            onClick={() => setSelected(opt)}
                            className={`w-full p-3 border rounded-lg text-left transition ${
                                selected === opt ? "bg-blue-500 text-white" : "hover: bg-gray-100"
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                 </div>
                 {/* Next Button */}
                <div className="mt-6 text-right">
                    <button 
                        onClick={handleNext}
                        className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                        {currentQ === quiz.questions.length - 1 ? "Finish" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    )
}