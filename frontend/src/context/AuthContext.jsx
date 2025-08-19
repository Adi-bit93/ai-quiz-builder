import { createContext, useState, useContext } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
    const [user, setUser] = useState(null);

    const setToken = (t) =>{
        setAccessToken(t);
        if(t)
            localStorage.setItem("accessToken", t)
        else
            localStorage.removeItem("accessToken");
    };

    const login = (token, userObj) => {
        setToken(token);
        setUser(userObj || null);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const value = {
        accessToken, 
        user, 
        login, 
        logout,
        getToken: () => accessToken,
        setToken,
        setUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}