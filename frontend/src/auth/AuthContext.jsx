import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { ok } from "../utils/notify";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }
        api
            .get("/auth/profile")
            .then(({ data }) => setUser(data))
            .catch(() => localStorage.removeItem("token"))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", data.access_token);
        setUser({ email });
        ok("¡Bienvenido!");
    };
    const register = async (email, password) => {
        const { data } = await api.post("/auth/register", { email, password });
        localStorage.setItem("token", data.access_token);
        setUser({ email });
        ok("Registro exitoso", "¡Bienvenido!");
    };
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        ok("Sesión cerrada");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
