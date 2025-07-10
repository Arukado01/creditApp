import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { ok } from "../utils/notify";

const validatePwd = (pwd) => {
    if (pwd.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    if (/^contraseña$/i.test(pwd) || /^password$/i.test(pwd))
        return "No uses la palabra “contraseña”";
    const seq = "0123456789";
    const rev = "9876543210";
    if (seq.includes(pwd) || rev.includes(pwd))
        return "No uses números consecutivos";
    if (!/[A-Z]/.test(pwd)) return "Debe incluir al menos una MAYÚSCULA";
    if (!/\d/.test(pwd)) return "Debe incluir al menos un número";
    if (!/[^\w\s]/.test(pwd)) return "Debe incluir al menos un carácter especial";
    return null;
};

export default function ResetPassword() {
    const { token } = useParams();
    const [form, setForm] = useState({ password: "", password2: "" });
    const [error, setError] = useState("");
    const nav = useNavigate();

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();

        if (form.password !== form.password2)
            return setError("Las contraseñas no coinciden");

        const pwdErr = validatePwd(form.password);
        if (pwdErr) return setError(pwdErr);

        try {
            await api.post(`/auth/reset/${token}`, { password: form.password });
            ok("Contraseña actualizada");
            nav("/login");
        } catch (err) {
            setError(err.response?.data?.msg || "Enlace expirado");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <form
                onSubmit={submit}
                className="bg-white p-8 rounded shadow w-80 space-y-3"
            >
                <h2 className="text-xl font-bold text-center">Nueva contraseña</h2>

                {error && <p className="text-red-600">{error}</p>}

                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={handle}
                    className="input"
                    required
                />
                <input
                    type="password"
                    name="password2"
                    placeholder="Repite la contraseña"
                    value={form.password2}
                    onChange={handle}
                    className="input"
                    required
                />

                <button className="btn bg-primary text-white w-full">Guardar</button>

                <p className="text-center text-sm">
                    <Link to="/login" className="underline text-primary">
                        Volver a iniciar sesión
                    </Link>
                </p>
            </form>
        </div>
    );
}
