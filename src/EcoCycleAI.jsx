import { useState } from "react";
import { Bot, Send, X } from "lucide-react";
import "./EcoCycleAI.css";

const BOT_WELCOME =
  "Bonjour 👋 Je suis EcoBot. Je réponds à vos questions sur EcoCycle Mali, l'application, le recyclage et l'écologie.";

const BOT_OUT_OF_SCOPE =
  "Je peux aider uniquement sur EcoCycle Mali, l'application, le recyclage, l'environnement et la gestion des déchets.";

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

  const getLocalFallbackAnswer = (question) => {
    const q = question.toLowerCase();

    if (q.includes("gagner") || q.includes("point") || q.includes("récompense")) {
      return "Pour gagner des points sur EcoCycle Mali : 1) va sur « Signaler », 2) choisis le type de déchet, 3) indique la quantité, 4) envoie la demande. Tes points augmentent après enregistrement de la collecte et tu peux les convertir dans « Récompenses ».";
    }

    if (
      q.includes("déchet") ||
      q.includes("plastique") ||
      q.includes("fer") ||
      q.includes("aluminium") ||
      q.includes("papier")
    ) {
      return "Sur EcoCycle Mali, les déchets valorisés incluent notamment l'aluminium, le plastique, le fer et le papier. En général, l'aluminium rapporte le plus, puis les autres matières selon le tarif en vigueur affiché dans la page « Signaler ».";
    }

    if (q.includes("comment") && (q.includes("application") || q.includes("ecocycle"))) {
      return "L'application EcoCycle Mali fonctionne en 4 étapes : créer un compte, signaler une collecte, suivre la demande, puis consulter les points et récompenses. Le dashboard, les récompenses et les notifications se mettent à jour selon tes actions.";
    }

    if (q.includes("écologie") || q.includes("environnement") || q.includes("recyclage")) {
      return "Pour mieux recycler : trie les déchets par type, garde les matières propres et sèches, puis regroupe-les avant de signaler une collecte. Ces gestes améliorent la valorisation et réduisent l'impact environnemental.";
    }

    return BOT_OUT_OF_SCOPE;
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

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

    const localReply = getLocalFallbackAnswer(trimmedMessage);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.loading),
        {
          sender: "bot",
          text: localReply,
        },
      ]);
      setIsLoading(false);
    }, 450);
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