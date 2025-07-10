import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ok } from "../utils/notify";

/* ───── helper de validación ───── */
const validatePwd = (pwd) => {
  if (pwd.length < 6) return "La contraseña debe tener al menos 6 caracteres";

  if (/^contraseña$/i.test(pwd) || /^password$/i.test(pwd))
    return "No uses la palabra “contraseña”";

  /* rechaza secuencias numéricas ascendentes o descendentes 123456 / 654321… */
  const seq = "0123456789";
  const rev = "9876543210";
  if (seq.includes(pwd) || rev.includes(pwd))
    return "No uses números consecutivos";

  if (!/[A-Z]/.test(pwd)) return "Debe incluir al menos una MAYÚSCULA";
  if (!/\d/.test(pwd)) return "Debe incluir al menos un número";
  if (!/[^\w\s]/.test(pwd)) return "Debe incluir al menos un carácter especial";

  return null; // ok
};

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", password2: "" });
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
      await api.post("/auth/register", {
        email: form.email,
        password: form.password,
      });
      ok("Registro exitoso");
      nav("/login");
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
          <h2 className="text-xl font-bold text-center">Registrarse</h2>
          {error && <p className="text-red-600">{error}</p>}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handle}
            className="input w-full"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handle}
            className="input w-full"
            required
          />
          <input
            name="password2"
            type="password"
            placeholder="Repite la contraseña"
            value={form.password2}
            onChange={handle}
            className="input w-full"
            required
          />

          <button className="btn-primary w-full">Crear cuenta</button>

          <p className="text-center text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="underline text-primary">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
