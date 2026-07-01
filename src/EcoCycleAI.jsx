import { useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./EcoCycleAI.css";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);
console.log(import.meta.env.VITE_GEMINI_API_KEY);

export default function EcoCycleAI() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Bonjour 👋 Je suis EcoBot. Je peux répondre en Français, Bambara et English."
    }
  ]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});
console.log("Gemini appelé");

      const result = await model.generateContent(`
Tu es EcoBot de l'application EcoCycle Mali.

Réponds uniquement sur :
- recyclage
- environnement
- gestion des déchets
- utilisation d'EcoCycle Mali
- récompenses et points

Tu peux répondre en Français, Bambara ou Anglais selon la langue de l'utilisateur.

Question :
${message}
      `);

      const response = result.response.text();

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
      text: "Bonjour 👋 Je suis EcoBot. Le service IA est momentanément indisponible. Essayez plus tard.",
    },
  ]);
}

    setMessage("");
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
              placeholder="Pose ta question..."
            />

            <button onClick={sendMessage}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}