import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiWithAutoRefresh, quizApi } from "../lib/api.js";
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
        setQuizToDelete(null)
      } else {
        const error = await res.json();
        alert(error.message || "failed to delete quiz");
      }
    } catch (error) {
      console.error("Delete failed: ",error);
      alert("Something went wrong while deleting.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    )
  }



  return (
    <div className="min-h-screen p-4 bg-gray-100 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/*Header*/}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold mb-4 md:mb-0">Organizer Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/quizzes/create")}
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
        {/* Quizzes List */}
        {quizzes?.length === 0 ? (
          <p className="text-gray-600">No quizzes yet. Create one!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes?.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white p-4 shadow rounded-xl hover:shadow-lg transition"
              >
                <h2 className="text-lg font-semibold mb-1">{quiz.title}</h2>
                <p className="text-gray-600 text-sm mb-2">{quiz.topic}</p>
                <div className="flex justify-between items-center text-sm gap-1">
                  <span
                    className={`px-2 py-1 rounded text-white ${quiz.difficulty === "easy"
                        ? "bg-green-500"
                        : quiz.difficulty === "medium"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                  >
                    {quiz.difficulty}
                  </span>
                  <span className="text-gray-500">
                    {quiz.questions.length} Qs
                  </span>
                   <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
      {/*Delete Model */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-6 shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              Delete Quiz: {quizToDelete?.title}
            </h3>
            <p className="text-gray-600 mb-6"> Are you sure you want to delete this quiz? This action cannot be
              undone.
            </p>
            <div className="flex jsutify-end gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              >Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
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
