import { use, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { quizApi } from "../lib/api.js";

export default function CreateQuiz() {
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        topic: "",
        difficulty: "easy",
        timerSeconds: 60,
        questions: [],
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.topic) {
            alert("Please fill in all required fields.");
            return;
        }
        setLoading(true);
        try {
            const res = await quizApi.create(form, getToken())
            if (res.ok) {
                alert("Quiz created successfully!");
                navigate("/dashboard");
            } else {
                alert("Failed to create quiz.");
            }
        } catch (err) {
            console.error("Quiz creation error:", err);
            alert("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6">
                <h1 className="text-2xl font-semibold mb-6 text-center">
                    Create New Quiz
                </h1>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium mb-1">Quiz Title *</label>
                        <input type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500" required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Topic *</label>
                        <input type="text"
                            name="topic"
                            value={form.topic}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400" required />
                    </div>
                    <div>
                         <label className="block text-sm font-medium mb-1">Question Count *</label>
                         <input
                             type="number"
                             name="questionCount"
                             placeholder="Number of question"
                             value={form.questionCount}
                             onChange={handleChange}
                             className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                             min="5"
                             max="50"
                             defaultValue="5"
                             required
                         />
                    </div>
                    {/* Difficulty */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Difficulty</label>
                        <select
                            name="difficulty"
                            value={form.difficulty}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    {/* Timer */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Timer (seconds per question)
                        </label>
                        <input
                            type="number"
                            name="timerSeconds"
                            value={form.timerSeconds}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                            min="10"
                        />
                    </div>
                    {/* Future: Questions UI */}
                    <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-600">
                        <p className="mb-2">⚠️ Question builder coming soon!</p>
                        <p>
                            For now, the quiz will be created without adding individual
                            questions from the UI.
                        </p>
                    </div>
                    {/* Buttons */}
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Quiz"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}