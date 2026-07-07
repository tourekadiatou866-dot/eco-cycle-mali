import { useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./EcoCycleAI.css";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const BOT_WELCOME =
  "Bonjour 👋 Je suis EcoBot. Je réponds à vos questions sur EcoCycle Mali, l'application, le recyclage et l'écologie.";

const BOT_OUT_OF_SCOPE =
  "Je peux aider uniquement sur EcoCycle Mali, l'application, le recyclage, l'environnement et la gestion des déchets.";

const BOT_MISSING_KEY =
  "Le chatbot n'est pas configuré. Ajoutez VITE_GEMINI_API_KEY dans Netlify (Site settings > Environment variables), puis redéployez.";
const MODEL_CANDIDATES = ["gemini-1.5-flash", "gemini-2.0-flash"];

export default function EcoCycleAI() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: BOT_WELCOME
    },
  ]);

  const buildPrompt = (userMessage) => `
Tu es EcoBot de l'application EcoCycle Mali.

Réponds uniquement sur :
- EcoCycle Mali
- l'application EcoCycle Mali
- recyclage
- environnement
- gestion des déchets
- récompenses et points de l'application

Si la question est hors sujet, réponds poliment avec ce message :
"${BOT_OUT_OF_SCOPE}"

Réponds uniquement en français.
Réponse courte, claire, utile et concrète.

Question :
${userMessage}
`;

  const getErrorMessage = (error) => {
    const raw = (error?.message || "").toLowerCase();
    if (!GEMINI_KEY) return BOT_MISSING_KEY;
    if (raw.includes("api key")) {
      return "La clé Gemini est invalide ou bloquée. Vérifie la variable VITE_GEMINI_API_KEY et redéploie le site.";
    }
    if (raw.includes("quota")) {
      return "Le quota Gemini est atteint pour le moment. Réessaie un peu plus tard.";
    }
    if (raw.includes("network")) {
      return "Erreur réseau. Vérifie la connexion internet puis réessaie.";
    }
    if (raw.includes("permission") || raw.includes("forbidden")) {
      return "La clé Gemini n'a pas les permissions requises pour ce domaine.";
    }
    return "Le service IA est momentanément indisponible. Réessaie dans quelques instants.";
  };

  const requestWithFallbackModel = async (trimmedMessage) => {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    let lastError = null;

    for (const modelName of MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(buildPrompt(trimmedMessage));
        const text = result?.response?.text()?.trim();
        if (text) {
          return text;
        }
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("Aucun modèle Gemini disponible.");
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    if (!GEMINI_KEY) {
      setMessages((prev) => [...prev, { sender: "bot", text: BOT_MISSING_KEY }]);
      return;
    }

    const userMessage = {
      sender: "user",
      text: trimmedMessage
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "EcoBot réfléchit...",
        loading: true
      }
    ]);

    try {
      const response = await requestWithFallbackModel(trimmedMessage);

      setMessages((prev) => [
        ...prev.filter((msg) => !msg.loading),
        {
          sender: "bot",
          text: response || "Je n'ai pas de réponse pour le moment.",
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.loading),
        {
          sender: "bot",
          text: getErrorMessage(error),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        className="ai-button"
        onClick={() => setOpen(!open)}
      >
        <Bot size={26} />
      </button>

      {open && (
        <div className="ai-chat">
          <div className="ai-header">
            <span>EcoBot IA</span>

            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="ai-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender} ${msg.loading ? "loading" : ""}`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="ai-input">
            <input
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Pose ta question..."
              disabled={isLoading}
            />

            <button onClick={sendMessage} disabled={isLoading || !message.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}