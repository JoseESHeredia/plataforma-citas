const API_BASE = "https://adqfu1fo7i.execute-api.us-east-1.amazonaws.com/prod/public";

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

            const base64 = await blobToBase64(blob);

            const resp = await fetch(`${API_BASE}/audio`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audio: base64 })
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

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
