import { useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./EcoCycleAI.css";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const BOT_WELCOME =
  "Bonjour 👋 Je suis EcoBot. Je peux répondre en Français, Bambara et English.";

const BOT_OUT_OF_SCOPE =
  "Je peux aider uniquement sur le recyclage, l'environnement, la gestion des déchets et l'utilisation d'EcoCycle Mali.";

const BOT_MISSING_KEY =
  "Le chatbot n'est pas configuré. Ajoutez VITE_GEMINI_API_KEY dans Netlify (Site settings > Environment variables), puis redéployez.";

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
- recyclage
- environnement
- gestion des déchets
- utilisation d'EcoCycle Mali
- récompenses et points

Si la question est hors sujet, réponds poliment avec ce message :
"${BOT_OUT_OF_SCOPE}"

Tu peux répondre en Français, Bambara ou Anglais selon la langue de l'utilisateur.
Réponse courte, claire, et utile.

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
    return "Le service IA est momentanément indisponible. Réessaie dans quelques instants.";
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

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const result = await model.generateContent(buildPrompt(trimmedMessage));

      const response = result?.response?.text()?.trim() || "Je n'ai pas de réponse pour le moment.";

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: response,
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
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
                className={`message ${msg.sender}`}
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