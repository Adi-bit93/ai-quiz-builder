import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiWithAutoRefresh } from "../lib/api.js";
import { useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, PlusCircle, Folder, Settings, LogOut, Brain, User } from "lucide-react";

export default function Dashboard() {
  const { getToken, setToken, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [copiedQuizId, setCopiedQuizId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
    setTimeout(() => setCopiedQuizId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50 ${
          isSidebarOpen ? "w-64" : "w-0 lg:w-20"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              {isSidebarOpen && (
                <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap">
                  Quizify
                </h1>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 text-gray-900 font-medium transition-colors hover:bg-gray-200"
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span>Dashboard</span>}
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <PlusCircle className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span>Create Quiz</span>}
            </button>

            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Folder className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span>My Quizzes</span>}
            </button>

            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span>Settings</span>}
            </button>
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {profile?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                {isSidebarOpen && (
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {profile?.username || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                  </div>
                )}
              </button>

              {showProfileMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {isSidebarOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Create Quiz</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8">
          {quizzes?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Total Quizzes</p>
                <p className="text-3xl font-bold text-gray-800">{quizzes?.length || 0}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Published</p>
                <p className="text-3xl font-bold text-gray-800">
                  {quizzes?.filter((q) => q.status === "published").length || 0}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Draft</p>
                <p className="text-3xl font-bold text-gray-800">
                  {quizzes?.filter((q) => q.status !== "published").length || 0}
                </p>
              </div>
            </div>
          )}

          {/* Quizzes Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Quizzes</h2>
            </div>

            <div className="p-6">
              {quizzes?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-32 h-32 mb-6 text-gray-300">
                    <svg viewBox="0 0 200 200" fill="currentColor">
                      <rect x="40" y="60" width="120" height="100" rx="8" opacity="0.2" />
                      <circle cx="100" cy="40" r="15" opacity="0.3" />
                      <path d="M100 55 L90 80 L110 80 Z" opacity="0.3" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No quizzes yet.</h3>
                  <p className="text-gray-500 mb-6">Create your first quiz to get started!</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-colors font-medium"
                  >
                    Create your first quiz
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {quizzes?.map((quiz) => (
                    <div
                      key={quiz._id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                        {quiz.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{quiz.topic}</p>

                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            quiz.difficulty === "easy"
                              ? "bg-green-100 text-green-700"
                              : quiz.difficulty === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          Difficulty: {quiz.difficulty?.charAt(0).toUpperCase() + quiz.difficulty?.slice(1)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mb-4">
                        {quiz.questions?.length || 0} Qs
                      </p>

                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => navigate(`/quizzes/${quiz._id}`)}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/quizzes/${quiz._id}/update`)}
                            className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition-colors font-medium"
                          >
                            Edit
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
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
                                      q._id === quiz._id ? { ...q, status: "published" } : q
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
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              quiz.status === "published"
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                          >
                            {quiz.status === "published" ? "Published" : "Publish"}
                          </button>
                          <button
                            onClick={() => handleCopy(quiz)}
                            className="px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition-colors font-medium"
                          >
                            {copiedQuizId === quiz._id ? "Copied!" : "Copy Code"}
                          </button>
                        </div>

                        <button
                          onClick={() => confirmDelete(quiz)}
                          className="w-full px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors font-medium"
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
        </main>
      </div>

      {/* Create Quiz Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Choose Quiz Creation Method</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate("/quizzes/create");
                }}
                className="w-full px-6 py-4 bg-green-500 text-white rounded-xl shadow-sm hover:bg-green-600 transition-colors font-semibold flex items-center justify-center gap-3"
              >
                <PlusCircle className="w-5 h-5" />
                Create Manually
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate("/ai");
                }}
                className="w-full px-6 py-4 bg-purple-500 text-white rounded-xl shadow-sm hover:bg-purple-600 transition-colors font-semibold flex items-center justify-center gap-3"
              >
                <Brain className="w-5 h-5" />
                Generate with AI
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Delete Quiz: {quizToDelete?.title}
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this quiz? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
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