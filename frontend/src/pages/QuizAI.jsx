import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiWithAutoRefresh } from "../lib/api.js";
import { Bot, User } from "lucide-react";


export default function QuizAI(){
    const { getToken, setToken } = useAuth();
    const [messages, setMessages] = useState([
        {sender: "bot", text:"Hi! I can generate quizzes for you. Tell me a topic, difficulty, and number of questions"}
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if(input.trim()) return;

        const newMessages = [...messages, {sender: "user", text: input}]; 
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const parts = input.split(" ");
            const topic = parts[0] || "General";
            const questionCount = parseInt(parts.find(p => !isNaN(p))) || 5;
            const difficulty = ["easy", "medium", "hard"].includes(parts[1]) ? parts[1] : "medium";

            const res = await apiWithAutoRefresh(
                "/quizzes/generate",
                {
                    method: "POST",
                    body: { topic, difficulty, questionCount }
                },
                getToken,
                setToken
            );

            if (res.ok) {
                const qs = res.data.questions;
                const questions = qs.map((q, i) => 
                    `${i + 1}. ${q.text}\nOptions: ${q.options.join(", ")}`
                ).join("\n\n");

                setMessages([
                    ...newMessages,
                    {sender: "bot", text: `Here's a quiz on **${topic}**:\n\n${questions}`}
                ]);
            } else {
                setMessages([
                    ...newMessages,
                    { sender: "bot", text: "⚠️ Sorry, I couldn't generate a quiz. Try again."}
                ]);
            }
        } catch (err) {
            console.error("AI error:", err);
            setMessages([
                ...newMessages,
                { sender: "bot", text: "⚠️ Something went wrong. Try again later."}
            ]);
        } finally{
            setLoading(false);
        }
    };
}