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
        if(!input.trim()) return;

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
                const json = await res.json();
                const questions = json.data.questions.map((q, i) => 
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
    
    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
            <div className="bg-white shadow-lg rounded-2xl w-full max-w-2xl flex flex-col flex-1">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, idx) => (
                        <div 
                            key={idx}
                            className={`flex items-start space-x-2 ${
                                msg.sender === "user" ? "justify-end" : "justify-start"
                            }`}
                        >
                            {msg.sender === "bot" && (
                                <Bot className="w-6 h-6 text-blue-500"/>
                            )}
                            <div className={`p-3 rounded-xl max-w-[75%] whitespace-pre-line ${
                                msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-900"
                            }`}>
                                {msg.text}
                            </div>
                            {msg.sender === "user" && (
                                <User className="w-6 h-6 text-gray-700"/>
                            )}
                        </div>
                    ))}
                </div>
                {/* Input Box */}
                <div className="border-t p-3 flex items-center space-x-2">
                    <input type="text"
                        placeholder="Type a topic, difficulty, and number of questions..."
                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-blue-400"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key ==="Enter" && sendMessage()}
                        disabled={loading}
                    />
                    <button 
                        onClick={sendMessage}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        {loading ? "..." : "Send"}
                    </button>

                </div>
            </div>

        </div>
    )


}