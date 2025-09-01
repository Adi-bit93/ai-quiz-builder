import { use, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiWithAutoRefresh } from "../lib/api.js";

export default function EditQuiz(){
    const { id } = useParams();
    const navigate = useNavigate();
    const { getToken, setToken, logout } = useAuth();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // fetch quiz details
    useEffect(() => {
        (async () => {
            try {
                const res = await apiWithAutoRefresh(`/quizzes/${id}`,

                    {
                        method: "GET"
                    },
                    getToken,
                    setToken
                );
                if(res.ok) {
                    const data = await res.json();
                    setQuiz(data.data)
                } else { 
                    navigate("/dashboard");
                }
            } catch (err) {
                console.error("Quiz fetch failed:", err);
                logout();
                navigate("/login");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleChange = (field, value) => {
        setQuiz((prev) => ({...prev, [field]: value}))
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...quiz.questions];
        updatedQuestions[index][field] = value;
        setQuiz((prev) => ({...prev, questions: updatedQuestions}));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await apiWithAutoRefresh(`/quizzes/${id}`,
                { method: "PUT", body: quiz},
                getToken,
                setToken
            );
            if (res.ok) {
                alert("Quiz updated successfully!");
                navigate("/dashboard");
            } else {
                alert("Failed to update quiz.");
            }
        } catch (err) {
            console.error("Quiz update failed:", err);
            alert("Something went wrong!");
        } finally {
            setSaving(false);
        }
    };

    if(!loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Loading quiz for editing... </p>
            </div>
        );
    }

    if(!quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Quiz not found</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6">
                <h1 className="text-2xl font-bold mb-4">Edit Quiz</h1>

                {/* Quiz fields */}
                <div className="space-y-4">
                    <input
                    type="text"
                    value = {quiz.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Quiz Title"
                    />

                    <input
                    type="text"
                    value = {quiz.topic}
                    onChange={(e) => handleChange("topic", e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Topic"
                    />

                    <select
                    value={quiz.difficulty}
                    onChange={(e) => handleChange("difficulty", e.target.value)}
                    className="w-full p-2 border rounded-lg">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>

                    <input type="number"
                    value={quiz.questionCount}
                    onChange={(e) => handleChange("questionCount", e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Number of Questions"
                    min="1"
                    max="50"
                    />
                </div>

                 {/* Questions */}
                 <h2 className="text-xl font-bold mt-6 mb-4">Questions</h2>
            </div>
        </div>
    )



}