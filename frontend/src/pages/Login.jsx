import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const nav = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            nav("/credits");
        } catch {
            setError("Credenciales inválidas");
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center ">
            {/* fondo decorativo */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: "url('/python.svg')",
                    backgroundRepeat: "repeat",
                    backgroundSize: "60px",
                    opacity: 0.05,
                    zIndex: 0,
                }}
            />

            {/* contenedor del formulario */}
            <div className="relative z-10 w-full max-w-sm">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded shadow-md w-full space-y-4"
                >
                    <h1 className="text-2xl font-bold mb-6 text-center">
                        Iniciar sesión
                    </h1>
                    {error && <p className="text-red-600 mb-4">{error}</p>}
                    <input
                        name="email"
                        className="input w-full"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        name="password"
                        className="input w-full"
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="btn-primary w-full">Entrar</button>
                    <p className="text-center text-sm">
                        ¿Sin cuenta?{" "}
                        <Link to="/register" className="underline text-primary">
                            Regístrate
                        </Link>
                        <br />
                        <Link to="/forgot" className="underline text-primary">
                            Recuperar contraseña
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
