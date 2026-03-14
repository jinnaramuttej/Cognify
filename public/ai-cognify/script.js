// =========================
// ELEMENTS
// =========================
const chatArea = document.getElementById("chat-area");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const micButton = document.getElementById("mic-button");
const languageSelect = document.getElementById("language");

// STATUS BANNER (shows demo/offline notices)
const statusBanner = document.createElement('div');
statusBanner.id = 'status-banner';
statusBanner.style.cssText = 'display:none;background:#fff4e5;color:#663c00;padding:8px 12px;border:1px solid #ffd9b3;border-radius:6px;margin-bottom:8px;text-align:center;font-weight:600;';
if (chatArea && chatArea.parentNode) {
  chatArea.parentNode.insertBefore(statusBanner, chatArea);
}

// =========================
// STATE
// =========================
let history = [];

// =========================
// CHAT UI
// =========================
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}-message`;

  if (sender === "ai") {
    div.innerHTML = formatAI(text);
    speak(text); // 🔊 SPEAK HERE
  } else {
    div.textContent = text;
  }

  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// =========================
// FORMAT AI RESPONSE
// =========================
function formatAI(text) {
  return text
    .replace(/\*\*(Lesson[^*]+)\*\*/g, "<h3>$1</h3>")
    .replace(/```sql([\s\S]*?)```/g, "<code>$1</code>")
    .replace(/\*\*Quiz Time:\*\*([\s\S]*)/g, "<div class='quiz'>❓ Quiz Time:$1</div>")
    .replace(/\n/g, "<br>");
}

// =========================
// TEXT TO SPEECH (FIX)
// =========================
function speak(text) {
  if (!window.speechSynthesis) return;

  speechSynthesis.cancel(); // stop previous speech

  const utterance = new SpeechSynthesisUtterance(text);

  const langMap = {
    English: "en-US",
    Hindi: "hi-IN",
    Telugu: "te-IN",
    Tamil: "ta-IN"
  };

  utterance.lang = langMap[languageSelect.value] || "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

// =========================
// SEND MESSAGE
// =========================
function sendMessage(forcedText = null) {
  const text = forcedText !== null ? forcedText : userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  history.push({ role: "user", content: text });

  userInput.value = "";
  fetchBot(text);
}

sendButton.addEventListener("click", () => sendMessage());

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// =========================
// SUBJECT BUTTONS
// =========================
function selectSubject(subject) {
  history = [];
  chatArea.innerHTML = "";

  addMessage(`I want to learn ${subject}`, "user");
  fetchBot(`Teach me ${subject} from scratch`);
}

// =========================
// BACKEND CALL (CHANGED TO NEXT API)
// =========================
async function fetchBot(text) {
  addMessage("Cognify is thinking...", "ai");

  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history })
    });

    const data = await res.json();
    chatArea.lastChild.remove();

    // If server reports an error or the demo flag, show banner
    if (!res.ok || data.error || data.demo === true || data.groqReachable === false) {
      // Try standalone backend fallback on localhost:3012 before showing demo/banner.
      try {
        const fallbackRes = await fetch("http://localhost:3012/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history })
        });
        if (fallbackRes.ok) {
          const fb = await fallbackRes.json();
          const fbReply = fb.reply || fb.error || "I couldn't generate a response (fallback).";
          if (statusBanner) statusBanner.style.display = 'none';
          addMessage(fbReply, "ai");
          history.push({ role: "assistant", content: fbReply });
          return;
        }
      } catch (fbErr) {
        console.warn('Standalone backend fallback failed:', fbErr);
      }

      const errMsg = data.error || data.reply || "Tutor failed to reach Groq.";
      if (statusBanner) {
        statusBanner.textContent = data.demo
          ? '⚠️ Demo mode: Groq key missing or disabled — responses are simulated.'
          : `⚠️ ${errMsg}`;
        statusBanner.style.display = 'block';
      }
      addMessage(errMsg, "ai");
      // Record assistant reply for consistency
      history.push({ role: "assistant", content: errMsg });
      return;
    }

    // success path
    if (statusBanner) statusBanner.style.display = 'none';
    const reply = data.reply || "I couldn't generate a response.";
    addMessage(reply, "ai");

    history.push({ role: "assistant", content: reply });

  } catch (err) {
    console.error(err);
    chatArea.lastChild.remove();
    if (statusBanner) {
      statusBanner.textContent = `⚠️ Error connecting to server: ${err.message || err}`;
      statusBanner.style.display = 'block';
    }
    addMessage("❌ Error connecting to server", "ai");
  }
}

// =========================
// MIC (OPTIONAL, SAFE)
// =========================
micButton.addEventListener("click", () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition not supported");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    sendMessage(transcript);
  };

  recognition.start();
});