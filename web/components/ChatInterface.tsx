"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { PaperPlaneTilt, ArrowsClockwise } from "@phosphor-icons/react";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { MarkdownText } from "./MarkdownText";

type Msg = {
  role: "user" | "assistant";
  content: string;
  id: string;
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  // Scroll to bottom on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming]);

  async function send(content: string) {
    if (!content.trim() || streaming) return;

    const userMsg: Msg = {
      role: "user",
      content: content.trim(),
      id: crypto.randomUUID(),
    };
    const assistantId = crypto.randomUUID();
    setMessages((m) => [
      ...m,
      userMsg,
      { role: "assistant", content: "", id: assistantId },
    ]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Chat API ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId ? { ...msg, content: acc } : msg
          )
        );
      }
    } catch (e) {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content:
                  "Fever HQ glitched for a sec. Try again, or text me a different question.",
              }
            : msg
        )
      );
    } finally {
      setStreaming(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  function reset() {
    setMessages([]);
    setInput("");
  }

  const empty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-2 space-y-4">
        {empty && (
          <div className="space-y-5 py-2">
            <div>
              <p className="font-display text-3xl tracking-tight leading-none mb-2 text-paper">
                Ask me anything.
              </p>
              <p className="text-sm text-paper/65 max-w-[42ch]">
                I know the 2026 Fever schedule, channels, tipoff times, and
                where every game is played. Sports radio energy. No filler.
              </p>
            </div>
            <SuggestedPrompts onPick={send} />
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={
                m.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-tr-md bg-fever-gold text-fever-navy-deep px-4 py-2.5 text-[15px] leading-snug"
                    : "max-w-[88%] rounded-2xl rounded-tl-md bg-white/8 text-paper px-4 py-2.5 text-[15px] leading-snug"
                }
              >
                {m.content ? (
                  <MarkdownText text={m.content} />
                ) : m.role === "assistant" && streaming ? (
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-paper/60 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-paper/60 animate-pulse [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-paper/60 animate-pulse [animation-delay:0.3s]" />
                  </span>
                ) : null}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={onSubmit}
        className="border-t border-white/5 bg-fever-navy-deep/80 backdrop-blur-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-end gap-2">
          {!empty && (
            <button
              type="button"
              onClick={reset}
              className="shrink-0 w-10 h-10 rounded-full text-paper/60 hover:text-fever-gold transition-colors flex items-center justify-center"
              aria-label="New conversation"
            >
              <ArrowsClockwise size={18} weight="bold" />
            </button>
          )}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask Fever HQ..."
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none bg-white/8 text-paper placeholder:text-paper/40 rounded-[20px] px-4 py-2.5 outline-none focus:bg-white/12 focus:ring-2 focus:ring-fever-gold/40 text-[15px] leading-snug max-h-[120px]"
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="shrink-0 w-10 h-10 rounded-full bg-fever-gold text-fever-navy-deep disabled:bg-white/10 disabled:text-paper/30 transition-colors flex items-center justify-center active:scale-[0.95]"
            aria-label="Send"
          >
            <PaperPlaneTilt size={18} weight="fill" />
          </button>
        </div>
      </form>
    </div>
  );
}
