import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Menu, X, Home, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Sidebar({ open, setOpen }) {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    if (!user) return null;

    // enlace reutilizable
    const Item = ({ to, icon: Icon, children }) => (
        <NavLink
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md hover:bg-primary/20 ${isActive ? "bg-primary/30 font-semibold" : ""
                }`
            }
        >
            <Icon size={18} /> {children}
        </NavLink>
    );

    // contenido interno (se usa en desktop y mobile)
    const Inner = () => (
        <>
            <div className="py-4 px-4 text-lg font-bold border-b border-white/20">
                CreditApp
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 text-sm overflow-y-auto">
                <Item to="/credits" icon={Home}>
                    Créditos
                </Item>
            </nav>
            <button
                onClick={() => {
                    logout();
                    nav("/login");
                }}
                className="mx-4 mb-4 flex items-center gap-3 px-4 py-3 rounded-md hover:bg-primary/20"
            >
                <LogOut size={18} /> Cerrar sesión
            </button>
        </>
    );

    return (
        <>
            {/* ------- Mobile Top bar con botón hamburguesa -------- */}
            <div className="md:hidden flex items-center bg-primary text-white p-3">
                <button onClick={() => setOpen(true)}>
                    <Menu size={24} />
                </button>
                <span className="ml-3 font-semibold">CreditApp</span>
            </div>

            {/* ------- Sidebar fija (desktop) -------- */}
            <aside className="hidden md:flex fixed inset-y-0 left-0 w-56 bg-primary text-white flex-col">
                <Inner />
            </aside>

            {/* ------- Drawer lateral (mobile) -------- */}
            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="relative z-50 md:hidden" onClose={setOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition duration-200 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition duration-200 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative w-56 bg-primary text-white flex flex-col">
                                <button
                                    className="absolute top-3 right-3"
                                    onClick={() => setOpen(false)}
                                >
                                    <X />
                                </button>
                                <Inner />
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>
        </>
    );
}
