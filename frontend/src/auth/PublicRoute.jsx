import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PublicRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <p className="p-6"></p>;
    return user ? <Navigate to="/credits" replace /> : children;
}
