"use client";

import { FormEvent, useRef, useState } from "react";
import { useSession } from "next-auth/react";

type Message = {
  role: "assistant" | "user";
  text: string;
};

export function SosAssistant() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Bonjour ! Je suis votre assistant IA SOS. Posez-moi n’importe quelle question, et je vous répondrai avec des conseils clairs et utiles.",
    },
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);

  if (status !== "authenticated") {
    return null;
  }

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();

    if (!trimmed || loading) return;

    const userMessage = { role: "user" as const, text: trimmed };
    setMessages((current) => [...current, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await response.json();
      const assistantMessage = {
        role: "assistant" as const,
        text:
          data?.answer ||
          "Je n’ai pas pu répondre pour le moment. Réessayez dans quelques instants.",
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "Une erreur est survenue. Vérifiez votre connexion et réessayez.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 1000 }}>
      {open && (
        <div
          style={{
            width: 360,
            maxWidth: "calc(100vw - 24px)",
            background: "#ffffff",
            border: "1px solid #dfeadf",
            borderRadius: 18,
            boxShadow: "0 20px 50px rgba(18, 45, 24, 0.18)",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #16794b, #1d9f68)",
              color: "#fff",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontWeight: 700,
            }}
          >
            <span>SOS Avicole</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              height: 280,
              overflowY: "auto",
              padding: 12,
              background: "#f7faf7",
            }}
          >
            {messages.map((entry, index) => (
              <div
                key={`${entry.role}-${index}`}
                style={{
                  display: "flex",
                  justifyContent: entry.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: entry.role === "user" ? "#16794b" : "#eaf7ee",
                    color: entry.role === "user" ? "#fff" : "#123822",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.45,
                    fontSize: 14,
                  }}
                >
                  {entry.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "#eaf7ee",
                    color: "#123822",
                    fontSize: 14,
                  }}
                >
                  Je réfléchis…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={sendMessage} style={{ padding: 12, borderTop: "1px solid #edf2ee" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Posez votre question avicole..."
                style={{
                  flex: 1,
                  border: "1px solid #dfeadf",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 14,
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  border: "none",
                  borderRadius: 10,
                  background: "#16794b",
                  color: "#fff",
                  padding: "10px 14px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                Envoyer
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        style={{
          border: "none",
          borderRadius: "999px",
          background: "linear-gradient(135deg, #cf3f45, #9b0d19)",
          color: "#fff",
          padding: "16px 22px",
          fontWeight: 800,
          letterSpacing: 0.5,
          boxShadow: "0 14px 30px rgba(110, 17, 24, 0.35)",
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        SOS
      </button>
    </div>
  );
}
