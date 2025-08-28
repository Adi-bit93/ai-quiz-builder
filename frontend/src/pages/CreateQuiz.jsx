import { use, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { quizApi } from "../lib/api.js";

export default function CreateQuiz(){
    const {getToken} = useAuth();
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
        setForm({...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) =>{
        e.preventDefault();
        if(!form.title || !form.topic) {
            alert("Please fill in all required fields.");
            return;
        }
        setLoading(true);
        try {
            const res = await quizApi.create(form, getToken())
            if (res.ok) {
                alert("Quiz created successfully!");
                navigate("/dashboard");
            }else {
                alert("Failed to create quiz.");
            }
        } catch (err) {
            console.error("Quiz creation error:", err);
            alert("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

}