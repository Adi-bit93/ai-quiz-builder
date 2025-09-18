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
  const [showModal, setShowModal] = useState();
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [copiedQuizId, setCopiedQuizId] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  // Fetch profile
  useEffect(() => {
     if (!getToken()) return;
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
        alert(error.message || "Failed to delete quiz");
      }
    } catch (error) {
      console.error("Delete failed: ", error);
      alert("Something went wrong while deleting.");
    }
  };

  // Copy quiz code
  const handleCopy = (quiz) => {
    if (!quiz?.code) return;
    navigator.clipboard.writeText(quiz.code);
    setCopiedQuizId(quiz._id);

    // Reset after 2 second
    setTimeout(() => setCopiedQuizId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <p className="text-gray-600 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Quiz Dashboard
            </h1>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg shadow hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Create Quiz</span>
                <span className="sm:hidden">+</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {profile?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-semibold text-gray-800">{profile?.username}</p>
                      <p className="text-xs text-gray-500">{profile?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        navigate("/login");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-500">Total Quizzes</p>
            <p className="text-2xl font-bold text-gray-800">{quizzes?.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-500">Published</p>
            <p className="text-2xl font-bold text-gray-800">
              {quizzes?.filter(q => q.status === "published").length || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-500">Draft</p>
            <p className="text-2xl font-bold text-gray-800">
              {quizzes?.filter(q => q.status !== "published").length || 0}
            </p>
          </div>
        </div>

        {/* Quizzes Grid */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">My Quizzes</h2>
          
          {quizzes?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No quizzes yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {quizzes?.map((quiz) => (
                <div key={quiz._id} className="bg-gray-50 p-5 rounded-xl border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{quiz.topic}</p>
                  
                  <div className="flex gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs text-white ${
                      quiz.difficulty === "easy" ? "bg-green-500" :
                      quiz.difficulty === "medium" ? "bg-yellow-500" : "bg-red-500"
                    }`}>{quiz.difficulty}</span>
                    <span className="text-sm text-gray-500">{quiz.questions.length} Qs</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/quizzes/${quiz._id}`)}
                      className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >View</button>
                    <button
                      onClick={() => navigate(`/quizzes/${quiz._id}/update`)}
                      className="px-3 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                    >Edit</button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await apiWithAutoRefresh(
                            `/quizzes/${quiz._id}/publish`,
                            { method: "PATCH" },
                            getToken,
                            setToken
                          );
                          if (res.ok) {
                            setQuizzes((prev) =>
                              prev.map((q) =>
                                q._id === quiz._id
                                  ? { ...q, status: "published" }
                                  : q
                              )
                            );
                          } else {
                            alert("Failed to publish quiz.");
                          }
                        } catch (error) {
                          console.error("Publish quiz failed: ", error);
                        }
                      }}
                      disabled={quiz.status === "published"}
                      className={`px-3 py-2 rounded text-sm ${
                        quiz.status === "published"
                          ? "bg-gray-400 text-white"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      {quiz.status === "published" ? "Published" : "Publish"}
                    </button>
                    <button
                      onClick={() => handleCopy(quiz)}
                      className="px-3 py-2 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600"
                    >
                      {copiedQuizId === quiz._id ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => confirmDelete(quiz)}
                      className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 col-span-2"
                    >Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Quiz Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 px-4">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Choose Quiz Creation Method</h3>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate("/quizzes/create");
                }}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
              >
                Create Manually
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate("/ai");
                }}
                className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition"
              >
                Generate with AI
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 px-4">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md border">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              Delete Quiz: {quizToDelete?.title}
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
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