export default function Pagination({ page, pages, onPage }) {
    if (pages <= 1) return null;

    const numbers = [];
    for (let i = 1; i <= pages; i++) numbers.push(i);

    return (
        <div className="flex gap-2 justify-center mt-4">
            <button
                className="btn border px-3"
                disabled={page === 1}
                onClick={() => onPage(page - 1)}
            >
                «
            </button>
            {numbers.map((n) => (
                <button
                    key={n}
                    className={`btn px-3 ${n === page ? "bg-blue-600 text-white" : "border"}`}
                    onClick={() => onPage(n)}
                >
                    {n}
                </button>
            ))}
            <button
                className="btn border px-3"
                disabled={page === pages}
                onClick={() => onPage(page + 1)}
            >
                »
            </button>
        </div>
    );
}
