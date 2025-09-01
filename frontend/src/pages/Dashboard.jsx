import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiWithAutoRefresh } from "../lib/api.js";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { getToken, setToken, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
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
        const quizRes = await apiWithAutoRefresh(
          "/quizzes",
          { method: "GET" },
          getToken,
          setToken
        );
        if (quizRes.ok) {
          const quizJson = await quizRes.json();
          setQuizzes(quizJson.data || []);
        }
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
        logout();
        navigate("/login");
      }
    })();
  }, []);

  // Delete quiz
  const confirmDelete = (quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!quizToDelete) return;

    try {
      const res = await apiWithAutoRefresh(
        `/quizzes/${quizToDelete._id}`,
        { method: "DELETE" },
        getToken,
        setToken
      );
      if (res.ok) {
        setQuizzes(quizzes.filter((q) => q._id !== quizToDelete._id));
        setShowDeleteModal(false);
        setQuizToDelete(null);
      } else {
        const error = await res.json();
        alert(error.message || "failed to delete quiz");
      }
    } catch (error) {
      console.error("Delete failed: ", error);
      alert("Something went wrong while deleting.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Organizer Dashboard
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/quizzes/create")}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
              + Create Quiz
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Card */}
        {profile && (
          <div className="bg-white rounded-xl p-5 mb-8 shadow-sm border text-center sm:text-left">
            <p className="text-gray-700">
              Logged in as{" "}
              <span className="font-bold text-gray-900">{profile.name}</span>
              <br />
              <span className="text-gray-500 text-sm">{profile.email}</span>
            </p>
          </div>
        )}

        {/* Quizzes List */}
        {quizzes?.length === 0 ? (
          <p className="text-gray-600 text-center py-10">
            No quizzes yet. Create one to get started 🚀
          </p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes?.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white p-5 rounded-xl shadow hover:shadow-md transition flex flex-col justify-between border"
              >
                <div>
                  <h2 className="text-lg font-semibold mb-1 text-gray-800 line-clamp-1">
                    {quiz.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {quiz.topic}
                  </p>
                </div>
                <div className="flex flex-wrap justify-between items-center text-sm mt-2 gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-white text-xs font-medium ${quiz.difficulty === "easy"
                        ? "bg-green-500"
                        : quiz.difficulty === "medium"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                  >
                    {quiz.difficulty}
                  </span>
                  <span className="text-gray-500">{quiz.questions.length} Qs</span>
                  <button
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs transition w-full sm:w-auto"
                    onClick={() => navigate(`/quizzes/${quiz._id}`)}
                  >
                    View
                  </button>
                  <button
                    className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-xs transition w-full sm:w-auto "
                    onClick={() => navigate(`/quizzes/${quiz._id}/update`)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs transition w-full sm:w-auto"
                    onClick={() => confirmDelete(quiz)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 px-4">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md border">
            <h3 className="text-lg font-bold mb-4 text-gray-800 text-center sm:text-left">
              Delete Quiz: {quizToDelete?.title}
            </h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed text-center sm:text-left">
              Are you sure you want to delete this quiz? <br />
              <span className="text-red-500 font-medium">
                This action cannot be undone.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition w-full sm:w-auto"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
