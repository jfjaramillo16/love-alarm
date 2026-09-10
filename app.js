const FIREBASE_URL = "https://love-alarm-fff53-default-rtdb.firebaseio.com/alarmTrigger.json";
const chime = new Audio("https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3");

const startBtn = document.getElementById("start-btn");
const startOverlay = document.getElementById("start-overlay");
const countEl = document.getElementById("count-display");
const statusText = document.getElementById("status-text");
const heartIcon = document.getElementById("heart-svg");
const outerRing = document.getElementById("outer-glow");
const core = document.getElementById("radar-core");

let lastState = false;

// Manejo del evento táctil inicial para permisos del navegador
startBtn.addEventListener("click", () => {
    chime.play().then(() => {
        chime.pause();
        chime.currentTime = 0;
    }).catch(() => { });
    startOverlay.classList.add("hidden");
});

// Actualización reactiva del DOM según el estado de la DB
function renderLoveState(active) {
    if (active === true || active === "true") {
        countEl.textContent = "1";
        countEl.classList.remove("text-rose-100/60");
        countEl.classList.add("text-rose-400", "scale-110");

        statusText.textContent = "¡Xio, alguien que te quiere un montón está a menos de 10 m!";
        statusText.classList.remove("text-pink-200/70");
        statusText.classList.add("text-rose-300", "font-semibold");

        heartIcon.classList.remove("text-rose-200/30");
        heartIcon.classList.add("text-rose-500", "drop-shadow-[0_0_25px_rgba(244,63,94,0.9)]", "animate-heartbeat");

        outerRing.classList.remove("opacity-0");
        outerRing.classList.add("opacity-100", "bg-rose-500/40");

        core.classList.add("border-rose-400/60", "shadow-[0_0_50px_rgba(244,63,94,0.45)]");

        if (!lastState) {
            if (navigator.vibrate) navigator.vibrate([400, 200, 400]);
            chime.currentTime = 0;
            chime.play().catch(e => console.warn(e));
        }
        lastState = true;
    } else {
        countEl.textContent = "0";
        countEl.classList.remove("text-rose-400", "scale-110");
        countEl.classList.add("text-rose-100/60");

        statusText.textContent = "Esperando a que alguien haga sonar el corazón de Xio...";
        statusText.classList.remove("text-rose-300", "font-semibold");
        statusText.classList.add("text-pink-200/70");

        heartIcon.classList.add("text-rose-200/30");
        heartIcon.classList.remove("text-rose-500", "drop-shadow-[0_0_25px_rgba(244,63,94,0.9)]", "animate-heartbeat");

        outerRing.classList.remove("opacity-100", "bg-rose-500/40");
        outerRing.classList.add("opacity-0");

        core.classList.remove("border-rose-400/60", "shadow-[0_0_50px_rgba(244,63,94,0.45)]");

        lastState = false;
    }
}

// Sondeo constante al backend (Firebase REST)
async function checkStatus() {
    try {
        const res = await fetch(FIREBASE_URL, { cache: "no-store" });
        const active = await res.json();
        renderLoveState(active);
    } catch (err) {
        console.warn("Error polling Firebase:", err);
    }
}

setInterval(checkStatus, 1000);
checkStatus();