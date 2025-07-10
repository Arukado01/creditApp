import { useEffect, useState } from "react";
export default function useDebounce(value, delay = 400) {
    const [deb, setDeb] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDeb(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return deb;
}
