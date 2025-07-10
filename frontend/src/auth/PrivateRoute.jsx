import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PrivateRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <p className="p-6"></p>;
    return user ? children : <Navigate to="/login" replace />;
}
