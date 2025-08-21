import { useState } from "react";
import { useNavigate ,Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import  { apiRequest } from "../lib/api.js";

export default function Login(){
    const [form, setform] = useState({email: "", password: ""});
    const { login } = useAuth();
    const nav = useNavigate();

    const handlechange = (e) => setform({...form, [e.target.name]: e.target.value});

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await apiRequest("/auth/login", {method: "POST", body: form});

        const json = await res.json().catch(() => ({}));
        if(res.ok){
            login(json.data.accessToken, json.data.user);
            nav("/dashboard");
        }else {
            alert(json?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-300">
            <form onSubmit={handleSubmit} className=" bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6">Organizer login</h1>
                <input className="border p-3 rounded w-full mb-3" name="email" placeholder="Email" type="email" onChange={handlechange} />
                <input className="border p-3 rounded w-full mb-6" name="password" placeholder="Password" type="password" onChange={handlechange} />
                <button className="w-full bg-green-600 text-white py-3 rounded-lg">Submit</button>
                <p className=" text-sm mt-4">New here? <Link to="/signup" className="text-blue-700 hover:underline">Crete account</Link></p>
            </form>
        </div>
    )
}