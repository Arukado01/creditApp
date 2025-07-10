import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { ok } from "../utils/notify";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/auth/forgot", { email });
            ok("Revisa tu correo para restablecer la contraseña");
        } catch (err) {
            setError(err.response?.data?.msg || "Error");
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50">
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

            {/* formulario */}
            <div className="relative z-10 w-full max-w-xs">
                <form
                    onSubmit={submit}
                    className="bg-white p-8 rounded shadow w-full space-y-4"
                >
                    <h2 className="text-xl font-bold text-center">
                        ¿Olvidaste tu contraseña?
                    </h2>
                    {error && <p className="text-red-600">{error}</p>}

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input w-full"
                        required
                    />

                    <button className="btn-primary w-full">
                        Enviar enlace
                    </button>

                    <p className="text-center text-sm">
                        <Link to="/login" className="underline text-primary">
                            Volver a iniciar sesión
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
