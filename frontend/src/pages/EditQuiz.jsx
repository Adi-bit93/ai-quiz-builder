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




}