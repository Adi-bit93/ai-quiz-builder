import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiWithAutoRefresh } from "../lib/api.js";
import { Bot, User, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuizAI() {
  const { getToken, setToken } = useAuth();
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I can generate quizzes for you. Tell me a topic, difficulty, and number of questions" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);

  // 👇 Auto scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // --- Parse input (unchanged logic) ---
  function parseInput(input) {
    const lower = input.toLowerCase().trim();
    const qtyMatch = lower.match(/\b(\d+)\s*(?:questions?|qs?)\b/i);
    let questionCount = qtyMatch ? parseInt(qtyMatch[1], 10) : null;
    if (!questionCount) {
      const loneNum = lower.match(/\b(\d{1,2})\b/);
      questionCount = loneNum ? parseInt(loneNum[1], 10) : 5;
    }
    questionCount = Math.max(1, Math.min(questionCount, 50));

    let difficulty = "medium";
    if (/\beasy\b/i.test(lower)) difficulty = "easy";
    else if (/\bhard\b/i.test(lower)) difficulty = "hard";

    let topic = null;
    const prepositionMatch = lower.match(/\b(?:on|about|regarding)\s+(.+)$/i);
    if (prepositionMatch) {
      topic = prepositionMatch[1];
      topic = topic.replace(/\bwith\s+\d+\s*(?:questions?|qs?)\b/gi, "");
    }
    if (!topic) {
      topic = lower
        .replace(/\b\d+\s*(?:questions?|qs?)\b/gi, "")
        .replace(/\b(give me|generate|create|make|build)\b/gi, "")
        .replace(/\b(quiz|questions?)\b/gi, "")
        .replace(/\b(easy|medium|hard)\b/gi, "")
        .replace(/\b(on|about|regarding|with|for|of)\b/gi, "")
        .replace(/[^\w\s\+#\.]/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
    }
    return { topic: topic || "General", difficulty, questionCount };
  }

  // --- Send message (unchanged logic) ---
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { topic, difficulty, questionCount } = parseInput(input);
      const res = await apiWithAutoRefresh(
        "/quizzes/ai/generate",
        { method: "POST", body: { topic, difficulty, questionCount } },
        getToken,
        setToken
      );

      if (res.ok) {
        const json = await res.json();
        const questions = json.data.questions
          .map((q, i) => `${i + 1}. ${q.text}\nOptions: ${q.options.join(", ")}`)
          .join("\n\n");

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
    } catch {
      setMessages([
        ...newMessages,
        { sender: "bot", text: "⚠️ Something went wrong. Try again later." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col">
  {/* Header */}
  <div className="bg-white shadow-md p-4 px-6 flex items-center justify-between">
    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">AI Quiz Generator</h1>
    <button
      onClick={() => navigate("/dashboard")}
      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
    >
      Back to Dashboard
    </button>
  </div>

  {/* Messages Area */}
  <div className="flex-1 px-4 sm:px-8 py-4">
    <div className="h-full bg-white rounded-xl shadow-lg p-4 overflow-y-auto">
      {messages.map((msg, idx) => (
        <div key={idx} className={`flex mb-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
          {msg.sender === "bot" ? (
            <div className="flex items-start space-x-2 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-100 rounded-xl px-4 py-2 text-gray-800 text-sm whitespace-pre-line">
                {msg.text}
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-2 max-w-[80%]">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl px-4 py-2 text-sm whitespace-pre-line">
                {msg.text}
              </div>
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* typing indicator */}
      {loading && (
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="bg-gray-100 rounded-xl px-4 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        </div>
      )}

      {/* scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  </div>

  {/* Input Area */}
  <div className="px-4 sm:px-8 pb-4">
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask me to generate a quiz..."
          className="flex-1 px-4 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className={`p-2 rounded-lg transition-all duration-200 ${
            loading || !input.trim()
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg transform hover:scale-105"
          }`}
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
      
    </div>
  </div>
</div>
  );
}