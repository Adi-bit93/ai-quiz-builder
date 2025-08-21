import { createContext, useState, useContext } from "react";
import api from "../lib/api.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Save / remove token in localStorage
    const setToken = (t) =>{
        setAccessToken(t);
        if(t)
            localStorage.setItem("accessToken", t)
        else
            localStorage.removeItem("accessToken");
    };
 
    // Login (save token + user);
    const login = (token, userObj) => {
        setToken(token);
        setUser(userObj || null);
    };

    // Logout (clear everything)
    const logout = () => {
        setToken(null);
        setUser(null);
    };
    // Try to restore user session when app starts
    useEffect(() => {
        const initAuth = async () => {
            if (!accessToken) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get("/auth/profile", {
                    headers: { Authorization: `Bearer ${accessToken}`},
                });
                setUser(res.data.user)
                
            } catch (err) {
                console.error("Session restore failed: ",err);
                logout(); // token invalid → clear it
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, [accessToken]);
    const value = {
        accessToken, 
        user, 
        login, 
        logout,
        getToken: () => accessToken,
        setToken,
        setUser
    };

    return <AuthContext.Provider value={value}>{!loading &&children}</AuthContext.Provider>;
}