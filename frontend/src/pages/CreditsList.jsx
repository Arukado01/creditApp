import { useEffect, useState } from "react";
import Select from "react-select";
import { AnimatePresence } from "framer-motion";
import {
    Pencil,
    Trash2,
    Plus,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import api from "../api/axios";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";
import CreditForm from "./CreditForm";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { ok, ask } from "../utils/notify";
import useDebounce from "../hooks/useDebounce";

/* ------------------------------------------------------------------ */
/* estilos react-select                                               */
/* ------------------------------------------------------------------ */
const selectStyles = {
    menuPortal: (b) => ({ ...b, zIndex: 9999 }),
    menu: (b) => ({ ...b, zIndex: 9999 }),
    menuList: (b) => ({ ...b, maxHeight: "200px" }),
};

export default function CreditsList() {
    const { logout, user } = useAuth();
    const nav = useNavigate();
    const money = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    });

    /* ----------------------------- estado ---------------------------- */
    const [allItems, setAllItems] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        client_name: [],
        client_id: [],
        commercial: [],
    });
    const debFilters = useDebounce(filters, 300);

    const [options, setOptions] = useState({
        client_name: [],
        client_id: [],
        commercial: [],
    });

    const [sort, setSort] = useState({ field: "created_at", dir: "desc" });
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    /* ----------- opciones para selects ---------------- */
    useEffect(() => {
        api.get("/credits/distinct")
            .then(({ data }) => {
                const map = (arr) => arr.map((v) => ({ value: v, label: v }));
                setOptions({
                    client_name: map(data.client_name),
                    client_id: map(data.client_id),
                    commercial: map(data.commercial),
                });
            })
            .catch(console.error);
    }, []);

    /* ----- descarga TODOS los créditos una vez al entrar ----- */
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const { data } = await api.get("/credits/?page=1&per_page=9999");
                setAllItems(data.items);
            } catch (err) {
                if (err.response?.status === 401) {
                    logout();
                    nav("/login");
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (loading) return;

        /* ---------- aplica filtros en Front ---------- */
        let items = allItems;

        const names = debFilters.client_name.map((o) => o.value.toLowerCase());
        if (names.length) items = items.filter((c) =>
            names.includes(c.client_name.toLowerCase())
        );

        const ids = debFilters.client_id.map((o) => o.value);
        if (ids.length) items = items.filter((c) => ids.includes(c.client_id));

        const comms = debFilters.commercial.map((o) => o.value.toLowerCase());
        if (comms.length) items = items.filter((c) =>
            comms.includes(c.commercial.toLowerCase())
        );

        /* ---------- ordenamiento ---------- */
        const sorted = [...items].sort((a, b) => {
            const { field, dir } = sort;
            const x = field === "amount" ? Number(a[field]) : a[field];
            const y = field === "amount" ? Number(b[field]) : b[field];

            if (field === "created_at")
                return dir === "asc"
                    ? new Date(x) - new Date(y)
                    : new Date(y) - new Date(x);

            return dir === "asc"
                ? String(x).localeCompare(String(y))
                : String(y).localeCompare(String(x));
        });

        /* ---------- paginación local ---------- */
        const total = sorted.length;
        const pages = Math.max(1, Math.ceil(total / perPage));
        const cur = Math.min(page, pages);          // por si filtrado reduce páginas
        const slice = sorted.slice((cur - 1) * perPage, cur * perPage);

        setPage(cur);
        setMeta({
            items: slice,
            total,
            page: cur,
            per_page: perPage,
            pages,
        });
    }, [allItems, debFilters, sort, perPage, page, loading]);

    /* --------------------------- render ------------------------------- */
    if (loading || !meta) return <Spinner />;

    const start = (meta.page - 1) * meta.per_page + 1;
    const end = start + meta.items.length - 1;

    return (
        <div className="relative min-h-screen px-4 pt-4">
            {/* fondo decorativo */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: "url('/python.svg')",
                    backgroundRepeat: "repeat",
                    backgroundSize: "60px",
                    opacity: 0.05,
                }}
            />

            {/* contenido */}
            <div className="relative p-4 z-10">

                {/* ——— grupo con halo hover ——— */}
                <div className="group relative rounded-xl overflow-visible">
                    <div
                        className="
                        pointer-events-none
                        absolute inset-0
                        rounded-xl
                        opacity-0
                        group-hover:opacity-100
                        transition-opacity
                        duration-300
                        bg-gradient-to-r
                        from-purple-400
                        via-blue-500
                        to-pink-500
                        blur-2x1
                        blur-lg
                        "
                    />
                    <div className="relative bg-white rounded-xl shadow-md overflow-visible">
                        {/* encabezado */}
                        <div className="flex justify-between items-center px-6 py-4 border-b">
                            <h1 className="text-xl font-semibold">Créditos</h1>
                            <div className="hidden sm:block text-gray-700">
                                ¡Hola, <strong>{user.email}</strong>!
                            </div>
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
                            >
                                <Plus size={18} /> Nuevo
                            </button>
                        </div>

                        {/* filtros */}
                        <div className="grid md:grid-cols-4 gap-2 px-6 py-4 bg-gray-50">
                            <Select
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={selectStyles}
                                placeholder="Cliente"
                                isMulti
                                options={options.client_name}
                                value={filters.client_name}
                                onChange={(v) => setFilters({ ...filters, client_name: v || [] })}
                            />
                            <Select
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={selectStyles}
                                placeholder="ID"
                                isMulti
                                options={options.client_id}
                                value={filters.client_id}
                                onChange={(v) => setFilters({ ...filters, client_id: v || [] })}
                            />
                            <Select
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={selectStyles}
                                placeholder="Comercial"
                                isMulti
                                options={options.commercial}
                                value={filters.commercial}
                                onChange={(v) => setFilters({ ...filters, commercial: v || [] })}
                            />
                            <select
                                className="border rounded px-2 py-2"
                                value={perPage}
                                onChange={(e) => setPerPage(Number(e.target.value))}
                            >
                                {[5, 10, 20, 30].map((n) => (
                                    <option key={n} value={n}>{n} / pág</option>
                                ))}
                            </select>
                        </div>

                        {/* tabla */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-primary/90 text-white sticky top-0 select-none">
                                    <tr>
                                        {[
                                            ["client_name", "Cliente", "text-left"],
                                            ["client_id", "ID", "text-left"],
                                            ["amount", "Monto", "text-right"],
                                            ["rate", "Tasa", "text-right"],
                                            ["term", "Plazo", "text-right"],
                                            ["commercial", "Comercial", "text-left"],
                                            ["created_at", "Fecha", "text-left"],
                                        ].map(([f, lbl, align]) => (
                                            <th
                                                key={f}
                                                className={`p-3 cursor-pointer ${align}`}
                                                onClick={() =>
                                                    setSort((prev) => ({
                                                        field: f,
                                                        dir:
                                                            prev.field === f && prev.dir === "asc"
                                                                ? "desc"
                                                                : "asc",
                                                    }))
                                                }
                                            >
                                                <div className="flex items-center gap-1">
                                                    {lbl}
                                                    {sort.field === f &&
                                                        (sort.dir === "asc" ? (
                                                            <ChevronUp size={16} />
                                                        ) : (
                                                            <ChevronDown size={16} />
                                                        ))}
                                                </div>
                                            </th>
                                        ))}
                                        <th className="p-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {meta.items.map((c, i) => (
                                        <tr
                                            key={c.id}
                                            className={i % 2 ? "odd:bg-gray-50" : undefined}
                                        >
                                            <td className="p-3">{c.client_name}</td>
                                            <td className="p-3">{c.client_id}</td>
                                            <td className="p-3 text-right">{money.format(c.amount)}</td>
                                            <td className="p-3 text-right">{c.rate}%</td>
                                            <td className="p-3 text-right">{c.term}</td>
                                            <td className="p-3">{c.commercial}</td>
                                            <td className="p-3">
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 flex gap-3">
                                                <button
                                                    className="text-blue-600 hover:text-blue-800"
                                                    onClick={() => {
                                                        setEditing(c);
                                                        setShowForm(true);
                                                    }}
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-800"
                                                    onClick={async () => {
                                                        const sure = await ask("¿Eliminar crédito?");
                                                        if (!sure) return;
                                                        await api.delete(`/credits/${c.id}`);
                                                        ok("Crédito eliminado");
                                                        // refrescamos listado completo
                                                        setAllItems((prev) => prev.filter((x) => x.id !== c.id));
                                                    }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* pie + paginación */}
                        <div className="px-6 py-2 flex flex-wrap justify-between items-center gap-4 border-t text-sm text-gray-600">
                            <span>
                                Mostrando {start}-{end} de {meta.total} registros
                            </span>
                            <Pagination
                                page={meta.page}
                                pages={meta.pages}
                                onPage={(p) => setPage(p)}
                            />
                            <span>
                                Página {meta.page} / {meta.pages}
                            </span>
                        </div>
                    </div>
                </div>

                {/* modal */}
                <AnimatePresence>
                    {showForm && (
                        <CreditForm
                            initial={editing}
                            onClose={() => {
                                setShowForm(false);
                                setEditing(null);
                            }}
                            onSaved={() => {
                                setShowForm(false);
                                setEditing(null);
                                // recarga lista completa
                                (async () => {
                                    const { data } = await api.get("/credits/?page=1&per_page=9999");
                                    setAllItems(data.items);
                                })();
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
