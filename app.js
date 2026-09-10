const DB_BASE_URL = "https://love-alarm-fff53-default-rtdb.firebaseio.com/users";
const chime = new Audio("https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3");

// Mapeo de destinatarios y textos personalizados
const PARTNER_MAP = {
  // Xio ve textos hacia un "anónimo", pero la señal impacta en tu ID (Fer)
  "11724390": { 
    partnerId: "20261602", 
    buttonText: "Hacer sonar a anónimo",
    sendingMsg: "Enviando señal de amor anónima...",
    successMsg: "¡Hiciste sonar un corazón anónimo!"
  },
  // Tu pantalla apunta a Xio
  "20261602": { 
    partnerId: "11724390", 
    buttonText: "Hacer sonar a Xio",
    sendingMsg: "Enviando amor a Xio...",
    successMsg: "¡Hiciste sonar el corazón de Xio!"
  },
  // Modo de pruebas individual
  "99999999": { 
    partnerId: "99999999", 
    buttonText: "Hacer sonar a Modo Prueba",
    sendingMsg: "Enviando prueba...",
    successMsg: "¡Prueba enviada!"
  }
};

// Obtener usuario desde URL (?id=...)
const urlParams = new URLSearchParams(window.location.search);
const currentUserId = urlParams.get("id") || "11724390";
const partnerInfo = PARTNER_MAP[currentUserId] || PARTNER_MAP["11724390"];

// Nodos del DOM
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
const sendLoveBtn = document.getElementById("send-love-btn");
const sendBtnText = document.getElementById("send-btn-text");
const sendFeedback = document.getElementById("send-feedback");

// Configurar etiquetas iniciales
if (heartIdDisplay) heartIdDisplay.textContent = `Heart ID : ${currentUserId}`;
if (sendBtnText) sendBtnText.textContent = partnerInfo.buttonText;

let lastState = false;

// Conceder permisos de reproducción de audio
startBtn.addEventListener("click", () => {
  chime.play().then(() => {
    chime.pause();
    chime.currentTime = 0;
  }).catch(() => { });
  startOverlay.classList.add("hidden");
});

// Enviar señal interactiva
sendLoveBtn.addEventListener("click", async () => {
  sendLoveBtn.disabled = true;
  sendFeedback.textContent = partnerInfo.sendingMsg;

  try {
    // Activa la alarma del destinatario
    await fetch(`${DB_BASE_URL}/${partnerInfo.partnerId}/alarmTrigger.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(true)
    });

    sendFeedback.textContent = partnerInfo.successMsg;

    // Se apaga automáticamente a los 6 segundos
    setTimeout(async () => {
      await fetch(`${DB_BASE_URL}/${partnerInfo.partnerId}/alarmTrigger.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(false)
      });
      sendFeedback.textContent = "";
      sendLoveBtn.disabled = false;
    }, 6000);

  } catch (err) {
    sendFeedback.textContent = "Error al enviar la señal.";
    sendLoveBtn.disabled = false;
  }
});

// Reacción visual cuando activan el radar propio
function renderLoveState(userData) {
  const active = userData ? userData.alarmTrigger : false;
  const userName = (userData && userData.name) ? userData.name : "ti";

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

    statusText.textContent = `¡${userName}, alguien que te ama está a menos de 10 m!`;
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

// Consultar la base de datos cada segundo
async function checkStatus() {
  try {
    const res = await fetch(`${DB_BASE_URL}/${currentUserId}.json`, { cache: "no-store" });
    const userData = await res.json();
    renderLoveState(userData);
  } catch (err) {
    console.warn("Error polling:", err);
  }
}

setInterval(checkStatus, 1000);
checkStatus();