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



}