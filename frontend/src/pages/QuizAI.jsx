import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiWithAutoRefresh } from "../lib/api.js";
import { Bot, User } from "lucide-react";


export default function QuizAI() {
    const { getToken, setToken } = useAuth();
    const [messages, setMessages] = useState([
        { sender: "bot", text: "Hi! I can generate quizzes for you. Tell me a topic, difficulty, and number of questions" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // Drop this next to your component (outside) so it's not recreated on each render
    function parseInput(input) {
        const lower = input.toLowerCase().trim();

        // 1) QUESTIONS COUNT — look for "number + question(s)/q/qs"
        // Examples matched: "20 question", "20 questions", "20 q", "20 qs"
        const qtyMatch = lower.match(/\b(\d+)\s*(?:questions?|qs?)\b/i);
        let questionCount = qtyMatch ? parseInt(qtyMatch[1], 10) : null;

        // Fallback: if user wrote a lone number (e.g., "make 10 on js"), but keep ES6/CSS3 safe
        if (!questionCount) {
            const loneNum = lower.match(/\b(\d{1,2})\b/); // 1–2 digit number as a standalone word
            questionCount = loneNum ? parseInt(loneNum[1], 10) : 5;
        }

        // Clamp to sensible bounds (backend will also validate)
        questionCount = Math.max(1, Math.min(questionCount, 50));

        // 2) DIFFICULTY — present anywhere in the text
        let difficulty = "medium";
        if (/\beasy\b/i.test(lower)) difficulty = "easy";
        else if (/\bhard\b/i.test(lower)) difficulty = "hard";
        // (medium stays default; you can also explicitly detect \bmedium\b if you like)

        // 3) TOPIC — try to capture after "on/about/regarding ...", else clean the sentence
        let topic = null;

        // Prefer explicit prepositions: "quiz on javascript", "quiz about data structures"
        const prepositionMatch = lower.match(/\b(?:on|about|regarding)\s+(.+)$/i);
        if (prepositionMatch) {
            topic = prepositionMatch[1];
            // remove tails like "with 20 questions"
            topic = topic.replace(/\bwith\s+\d+\s*(?:questions?|qs?)\b/gi, "");
        }

        // If still no topic, remove boilerplate words/phrases to reveal what's left
        if (!topic) {
            topic = lower
                // remove “20 questions” phrases
                .replace(/\b\d+\s*(?:questions?|qs?)\b/gi, "")
                // remove common filler verbs and quiz words
                .replace(/\b(give me|generate|create|make|build)\b/gi, "")
                .replace(/\b(quiz|questions?)\b/gi, "")
                // remove difficulty words
                .replace(/\b(easy|medium|hard)\b/gi, "")
                // remove prepositions that don’t add meaning once others are stripped
                .replace(/\b(on|about|regarding|with|for|of)\b/gi, "")
                // keep tech punctuation like +, #, . for C++, C#, Node.js
                .replace(/[^\w\s\+#\.]/g, "")
                // collapse whitespace
                .replace(/\s{2,}/g, " ")
                .trim();
        }

        if (!topic) topic = "General";

        return { topic, difficulty, questionCount };
    }




    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            
            const { topic, difficulty, questionCount} = parseInput(input);

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
                    { sender: "bot", text: `Here's a quiz on **${topic}**:\n\n${questions}` }
                ]);
            } else {
                setMessages([
                    ...newMessages,
                    { sender: "bot", text: "⚠️ Sorry, I couldn't generate a quiz. Try again." }
                ]);
            }
        } catch (err) {
            console.error("AI error:", err);
            setMessages([
                ...newMessages,
                { sender: "bot", text: "⚠️ Something went wrong. Try again later." }
            ]);
        } finally {
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
                            className={`flex items-start space-x-2 ${msg.sender === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            {msg.sender === "bot" && (
                                <Bot className="w-6 h-6 text-blue-500" />
                            )}
                            <div className={`p-3 rounded-xl max-w-[75%] whitespace-pre-line ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-900"
                                }`}>
                                {msg.text}
                            </div>
                            {msg.sender === "user" && (
                                <User className="w-6 h-6 text-gray-700" />
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
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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


