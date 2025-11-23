const API_BASE = "https://TU_API_GATEWAY/prod/public";

const messagesDiv = document.getElementById("messages");
const textInput = document.getElementById("textInput");
const sendTextBtn = document.getElementById("sendText");
const recordBtn = document.getElementById("recordBtn");

let mediaRecorder;
let audioChunks = [];

function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;
    msg.textContent = text;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

sendTextBtn.onclick = async () => {
    const text = textInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    textInput.value = "";

    const resp = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
    });

    const data = await resp.json();
    addMessage(data.reply || "Error en la respuesta", "bot");
};

recordBtn.onclick = async () => {
    if (!mediaRecorder) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

        mediaRecorder.onstop = async () => {
            const blob = new Blob(audioChunks, { type: "audio/webm" });
            audioChunks = [];

            addMessage("🎤 Enviando audio...", "user");

            const formData = new FormData();
            formData.append("audio", blob);

            const resp = await fetch(`${API_BASE}/audio`, {
                method: "POST",
                body: formData
            });

            const data = await resp.json();
            addMessage(data.reply || "Error al procesar audio", "bot");
        };
    }

    if (mediaRecorder.state === "inactive") {
        audioChunks = [];
        mediaRecorder.start();
        addMessage("🎙️ Grabando...", "user");

        setTimeout(() => mediaRecorder.stop(), 3000);
    }
};
