import { useAuth } from "../auth/AuthContext";

export default function Footer() {
    const { user } = useAuth();
    return (
        <footer className={`${user ? "md:ml-56" : ""} fixed bottom-0 left-0 w-full bg-[#e4d8ed] text-center py-4 text-sm z-20`} >
            Web App creada por{" "}
            <a
                href="mailto:carlosjcortinam@gmail.com"
                className="underline font-semibold"
            >
                Carlos Cortina
            </a>{" "}
            · Todos los derechos reservados ©{new Date().getFullYear()}
        </footer>
    );
}
