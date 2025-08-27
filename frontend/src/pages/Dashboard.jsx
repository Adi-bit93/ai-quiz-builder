import { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext.jsx';
import { apiWithAutoRefresh } from '../lib/api.js';
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const { getToken, setToken, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {

            try {
                const res = await apiWithAutoRefresh("/auth/profile", { method: "GET" }, getToken, setToken);
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
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-[400px] text-center">
                <h1 className="text-2xl font-semibold mb-4">
                    Organizer Dashboard
                </h1>
                {profile ? (
                    <>
                        <p className="mb-4">
                            Logged in as <span className="font-bold">{profile.name}</span>
                            <br />
                            <span className="text-gray-600">{profile.email}</span>
                        </p>
                        <pre className="bg-gray-200 p-3 rounded text-sm text-left">
                            {JSON.stringify(profile, null, 2)}
                        </pre>
                    </>
                ) : (
                    <p className="text-gray-500">Loading profile...</p>
                )}
                <button onClick={() => {
                    logout();
                    navigate("/login");
                }} className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition">
                    Logout
                </button>
            </div>
        </div>
    );
}
