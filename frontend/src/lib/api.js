const API_BASE = "http://localhost:5000";

export const apiRequest = async (path, { method="GET", body, token } = {})=>{
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
    })

    return res
};

export const apiWithAutoRefresh = async(path, options, getToken, setToken) => {
    let token = getToken();
    let res = await apiRequest(path, { ...options, token});
    
    if(res.status === 401) {
        const refreshRes = await apiRequest("/api/auth/refresh-token", { method: "POST"});
        if (refreshRes.ok){
            const {data} = await refreshRes.json();
            setToken(data.accessToken);
            token = data.accessToken;
            res = await apiRequest(path, {...options, token});
        }
    }

    return res;
};