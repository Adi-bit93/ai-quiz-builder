import { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext.jsx';
import { apiWithAutoRefresh } from '../lib/api.js';

export default function Dashboard(){
    const { getToken, setToken } = useAuth();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        (async () => {
            const res = await apiWithAutoRefresh("/auth/profile", {method: "GET"}, getToken, setToken);
            if(res.ok){
                const json = await res.json();
                setProfile(json.data);
            }
        })();
    }, []);
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-2">Organizer Dashboard</h1>
            <pre className="bg-gray-200 p-3 rounded">{JSON.stringify(profile, null, 2)}</pre>
        </div>
    )
}
