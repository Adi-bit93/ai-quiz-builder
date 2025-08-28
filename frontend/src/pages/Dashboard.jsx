import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiWithAutoRefresh, quizApi } from "../lib/api.js";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { getToken, setToken, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const navigate = useNavigate();

  // Fetch profile
  useEffect(() => {
    (async () => {
      try {
        const res = await apiWithAutoRefresh(
          "/auth/profile",
          { method: "GET" },
          getToken,
          setToken
        );
        if (res.ok) {
          const json = await res.json();
          setProfile(json.data);
        } else {
          logout();
          navigate("/login");
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
        logout();
        navigate("/login");
      }
    })();
  }, []);

  // Fetch quizzes
  useEffect(() => {
    (async () => {
      try {
        const res = await quizApi.list(getToken());
        if (res.ok) setQuizzes(res.data);
      } catch (err) {
        console.error("Quiz fetch failed:", err);
      } finally {
        setLoadingQuizzes(false);
      }
    })();
  }, []);

  // Delete quiz
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    const res = await quizApi.delete(id, getToken());
    if (res.ok) {
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
    } else {
      alert("Failed to delete quiz.");
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/*Header*/}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold mb-4 md:mb-0">Organizer Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/quizzes/new")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Create Quiz
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
        {/*profile card*/}
        {profile && (
          <div className="bg-white rounded-xl p-4 mb-6">
            <p>
              Logged in as{" "}
              <span className="font-bold">{profile.name}</span><br />
              <span className="text-gray-600">{profile.email}</span>
            </p>
          </div>
        )}
        {/* Quizzes section */}
        <h2 className="text-xl font-medium mb-3">Your Quizzes</h2>
        {loadingQuizzes ? (
          <p>Loading quizzes...</p>
        ) : quizzes.length === 0 ? (
          <p className="text-gray-600">No quizzes created yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white shadow-md rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{quiz.title}</h3>
                  <p className="text-sm text-gray-600">
                    {quiz.topic} • {quiz.difficulty}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {quiz.questionCount} questions | Timer: {quiz.timerSeconds}s
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => navigate(`/quizzes/${quiz._id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(quiz._id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}
