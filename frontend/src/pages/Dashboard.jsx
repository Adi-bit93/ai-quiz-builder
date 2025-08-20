import { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext.jsx';
import { apiWithAutoRefresh } from '../lib/api.js';

export default function Dashboard(){
    const { getToken, setToken } = useAuth();
    const [me, setMe] = useState(null);

    useEffect(() => {
        (async () => {
            const res = await apiWithAutoRefresh("/api/v1/auth/me", {method: "GET"}, getToken, setToken);
            if(res.ok){
                const json = await res.json();
                setMe(json.data);
            }
        })();
    }, []);
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-2">Organizer Dashboard</h1>
            <pre className="bg-gray-200 p-3 rounded">{JSON.stringify(me, null, 2)}</pre>
        </div>
    )
}
