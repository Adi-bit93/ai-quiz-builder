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
        });

        // const data = await res.json().catch(() => null);
    
        return res
    } catch (error) {
        console.error("API request error: ",error);
        throw new Error(error.message || "API request failed");
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

export const api = {
  get: (path, options) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, options) => apiRequest(path, { ...options, method: "POST" }),
  put: (path, options) => apiRequest(path, { ...options, method: "PUT" }),
  delete: (path, options) => apiRequest(path, { ...options, method: "DELETE" }),
};

export const quizApi = {
    create: (body, token) => api.post("/quizzes", { body, token }),
    list: (token) => api.get("/quizzes", { token }),
    getById: (id, token) => api.get(`/quizzes/${id}`, { token }),
    update: (id, body, token ) => api.put(`/quizzes/${id}`, { body, token }),
    delete: (id, token) => api.delete(`/quizzes/${id}`, {token})
}
export default api;
