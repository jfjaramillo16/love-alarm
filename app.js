const DB_BASE_URL = "https://love-alarm-fff53-default-rtdb.firebaseio.com/users";
const chime = new Audio("https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3");

// Lee el parámetro ?id= de la URL. Si no existe, usa por defecto el ID de Xio.
const urlParams = new URLSearchParams(window.location.search);
const currentUserId = urlParams.get("id") || "11724390";

const startBtn = document.getElementById("start-btn");
const startOverlay = document.getElementById("start-overlay");
const countEl = document.getElementById("count-display");
const statusText = document.getElementById("status-text");
const heartIcon = document.getElementById("heart-svg");
const outerRing = document.getElementById("outer-glow");
const core = document.getElementById("radar-core");
const heartIdDisplay = document.getElementById("heart-id-display");
const modalUserName = document.getElementById("modal-user-name");
const headerTitle = document.getElementById("header-title");
const pageTitle = document.getElementById("page-title");

// Muestra el Heart ID en pantalla
if (heartIdDisplay) {
    heartIdDisplay.textContent = `Heart ID : ${currentUserId}`;
}

let lastState = false;

// Desbloqueo de audio obligatorio para móviles
startBtn.addEventListener("click", () => {
    chime.play().then(() => {
        chime.pause();
        chime.currentTime = 0;
    }).catch(() => { });
    startOverlay.classList.add("hidden");
});

// Actualización reactiva de la interfaz
function renderLoveState(userData) {
    const active = userData ? userData.alarmTrigger : false;
    const userName = (userData && userData.name) ? userData.name : "ti";

    // Sincroniza nombres en títulos y modales
    if (modalUserName && !modalUserName.dataset.set) {
        modalUserName.textContent = userName;
        modalUserName.dataset.set = "true";
    }
    if (headerTitle) headerTitle.textContent = `Love Alarm • ${userName}`;
    if (pageTitle) pageTitle.textContent = `Love Alarm • ${userName}`;

    if (active === true || active === "true") {
        countEl.textContent = "1";
        countEl.classList.remove("text-rose-100/60");
        countEl.classList.add("text-rose-400", "scale-110");

        statusText.textContent = `¡${userName}, alguien que te quiere un montón está a menos de 10 m!`;
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

        statusText.textContent = `Esperando a que alguien haga sonar el corazón de ${userName}...`;
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

// Sondeo REST a la ruta específica del Heart ID
async function checkStatus() {
    try {
        const res = await fetch(`${DB_BASE_URL}/${currentUserId}.json`, { cache: "no-store" });
        const userData = await res.json();
        renderLoveState(userData);
    } catch (err) {
        console.warn("Error polling Firebase:", err);
    }
}

setInterval(checkStatus, 1000);
checkStatus();