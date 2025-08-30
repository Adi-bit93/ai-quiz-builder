import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiWithAutoRefresh } from "../lib/api.js";

export default function ViewQuiz() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getToken, setToken, logout } = useAuth();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiWithAutoRefresh(`/quizzes/${id}`,
                    { method: "GET" },
                    getToken,
                    setToken
                );
                if (res.ok) {
                    const data = await res.json();
                    setQuiz(data.data)
                } else {
                    navigate("/dashboard")
                }
            } catch (error) {
                console.error("Quiz fetch failed:", error);
                logout();
                navigate("/login")
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen  flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Loading quiz details...</p>
            </div>
        )
    }

    if (!quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Quiz not found</p>
            </div>
        );
    }
}

return (
    <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg ">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                    Back
                </button>
            </div>
            {/* Quiz Info */}
            <div className="mb-6">
                <p className="text-gray-600">
                    <span className="font-semibold">Topic:</span>{quiz.topic}
                </p>
                <p className="text-gray-600">
                    <span className="font-semibold">Difficulty:</span>{quiz.difficulty}
                </p>
                <p className="text-gray-600">
                    <span className="font-semibold">Questions:</span>{" "}{quiz.questionCount}
                </p>
                <p className="text-grya-700"><span className="font-semibold">Status:</span>{" "}
                    {quiz.isPublished ? (
                        <span className="text-green-600 font-medium">Published</span>
                    ) : (
                        <span className="text-yellow-600 font-medium">Draft</span>
                    )}
                </p>
            </div>
            {/* Questions */}
            <h2 className="text-xl font-semibold mb-4">Questions</h2>
            <div className="space-y-4">
                {quiz.questions && quiz.questions.length > 0 ? (
                    quiz.questions.map((q, index) => (
                        <div
                        key={index} 
                        className="p-4 bg-gray-50 border rounded-xl shadow-sm">
                            <h3 className="font-semibold mb-2">
                                Q{index + 1} : {q.question}
                            </h3>
                            <ul className="space-y-1">
                                {q.options.map((opt, i) => (
                                    <li
                                    key={i}
                                    className={`px-3 py-1 rounded ${i === q.correctAnswer ? "bg-green-100 text-green-700 font-medium" : "bg-gray-100 text-gray-700"}`}>
                                        {opt}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No questions found.</p>
                )}
            </div>
        </div>
    </div>
)