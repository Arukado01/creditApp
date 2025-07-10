import Swal from "sweetalert2";
import confetti from "canvas-confetti";

function boom() {
    confetti({
        spread: 90,
        startVelocity: 35,
        particleCount: 120,
        origin: { y: 0.6 },
    });
}

/* Success simple  --------------------------------------------------- */
export async function ok(title = "¡Listo!", text = "") {
    await Swal.fire({
        title,
        text,
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
    });
    boom();
}

/* Confirmación (devuelve true/false)  ------------------------------- */
export async function ask(title, text = "") {
    const { isConfirmed } = await Swal.fire({
        title,
        text,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No",
    });
    if (isConfirmed) boom();
    return isConfirmed;
}
