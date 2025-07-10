import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import api from "../api/axios";
import { ok, ask } from "../utils/notify";
import { useAuth } from "../auth/AuthContext";

const allowed = [
    "client_name",
    "client_id",
    "amount",
    "rate",
    "term",
    "commercial",
];

export default function CreditForm({ onClose, onSaved, initial }) {
    const { user } = useAuth();

    const [form, setForm] = useState({
        client_name: "",
        client_id: "",
        amount: "",
        rate: "",
        term: "",
        commercial: user.email,
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (initial) {
            setForm(initial);
        }
    }, [initial]);

    /* manejadores */
    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (initial) {
            const sure = await ask("¿Guardar cambios?");
            if (!sure) return;
        }

        const payload = Object.fromEntries(
            Object.entries(form).filter(([k]) => allowed.includes(k))
        );

        try {
            if (initial) {
                await api.put(`/credits/${initial.id}`, payload);
                ok("Crédito actualizado");
            } else {
                await api.post("/credits/", payload);
                ok("Crédito creado");
            }
            onSaved();
        } catch (err) {
            console.error(err.response?.data);
            setError(
                err.response?.data?.msg ||
                JSON.stringify(err.response?.data) ||
                "Error"
            );
        }
    };

    /* animaciones */
    const backdrop = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.25 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
    };

    const modal = {
        hidden: { opacity: 0, scale: 0.8, y: 40 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", stiffness: 240, damping: 20 },
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            y: 40,
            transition: { duration: 0.2 },
        },
    };

    return (
        <motion.div
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
            <motion.form
                variants={modal}
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-xl w-96 space-y-3 shadow-lg relative"
            >
                {/* botón cerrar */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-2">
                    {initial ? "Editar crédito" : "Nuevo crédito"}
                </h2>

                {error && <p className="text-red-600">{error}</p>}

                {/* campos editables */}
                {[
                    ["client_name", "Nombre cliente", { type: "text" }],
                    [
                        "client_id",
                        "Cédula / ID",
                        {
                            type: "number",
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                        },
                    ],
                    [
                        "amount",
                        "Monto",
                        {
                            type: "number",
                            step: "0.01",
                            min: "0",
                            inputMode: "decimal",
                        },
                    ],
                    [
                        "rate",
                        "Tasa (%)",
                        {
                            type: "number",
                            step: "0.01",
                            min: "0",
                            inputMode: "decimal",
                        },
                    ],
                    [
                        "term",
                        "Plazo (meses)",
                        {
                            type: "number",
                            step: "1",
                            min: "1",
                            inputMode: "numeric",
                        },
                    ],
                ].map(([name, label, extra]) => (
                    <input
                        key={name}
                        name={name}
                        placeholder={label}
                        value={form[name]}
                        onChange={handleChange}
                        className="input w-full"
                        required
                        {...extra}
                    />
                ))}

                {/* comercial (solo lectura) */}
                <input
                    name="commercial"
                    value={form.commercial}
                    readOnly
                    className="input w-full bg-gray-100 cursor-not-allowed"
                />

                {/* botones */}
                <div className="flex gap-2 justify-end pt-3">
                    <button
                        type="button"
                        className="btn border"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button className="btn bg-blue-600 text-white">
                        {initial ? "Actualizar" : "Crear"}
                    </button>
                </div>
            </motion.form>
        </motion.div>
    );
}
