import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../lib/api";

export default function Signup(){
    const [form, setForm] = useState({name: "", email: "", password: ""});
    const nav = useNavigate();

    const handleChange = (e) =>  setForm({...form, [e.target.name]: e.target.value});

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await apiRequest("api/auth/register", {method: "POST", body: form});
        if(res.ok){
            alert("Signup successful. Please log in.");
            nav("/login");
        }else{
            const data = await res.json().catch(() => ({}));
            alert(data.message || "Signup failed.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-400">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6">Create organizer account</h1>
                <input className="border p-3 rounded w-full mb-3" name="name" placeholder="Name" onChange={handleChange}/>
                <input className="border p-3 rounded w-full mb-3" name="email" placeholder="Email" onChange={handleChange}/>
                <input className="border p-3 rounded w-full mb-6" name="password" placeholder="Password" type="password" onChange={handleChange}/>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg">Sign Up</button>
                <p className="text-sm mt-4">Already have an account? <Link to="/login" className="text-blue-600">Log in</Link></p>
            </form>
        </div>
    );
};