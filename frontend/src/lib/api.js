const API_BASE = "http://localhost:5000/api/v1";

export const apiRequest = async (path, { method="GET", body, token } = {})=>{
    try {
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
    } catch (error) {
        console.log("API request error: ",error);
    }
};

export const apiWithAutoRefresh = async(path, options, getToken, setToken) => {
    let token = getToken();
    let res = await apiRequest(path, { ...options, token});
    
    if(res.status === 401) {
        const refreshRes = await apiRequest("/auth/refresh-token", { method: "POST"});
        if (refreshRes.ok){
            const {data} = await refreshRes.json();
            setToken(data.accessToken);
            token = data.accessToken;
            res = await apiRequest(path, {...options, token});
        }
    }

    return res;
};