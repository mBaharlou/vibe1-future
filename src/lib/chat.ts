import { useCallback, useEffect, useRef, useState } from "react";
import { ASK_CAT } from "../config/home";
import type { Lang } from "../i18n";

// "Ask the cat" conversation: kept in sessionStorage (this tab only), sent to POST /api/chat,
// and the reply streamed in as plain text. The API key lives on the server only.

export type ChatMessage = { id: string; role: "user" | "assistant"; content: string };
export type ChatError = "not_configured" | "rate_limited" | "error";
export type ChatStatus = "idle" | "waiting" | "streaming";

const newId = () => Math.random().toString(36).slice(2, 10);

function load(): ChatMessage[] {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(ASK_CAT.storageKey) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((m): m is ChatMessage => !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && typeof m.id === "string")
      : [];
  } catch {
    return [];
  }
}

function save(messages: ChatMessage[]) {
  try {
    if (messages.length) sessionStorage.setItem(ASK_CAT.storageKey, JSON.stringify(messages));
    else sessionStorage.removeItem(ASK_CAT.storageKey);
  } catch {
    // Storage blocked: the chat still works for this page view.
  }
}

const errorOf = (code: unknown): ChatError => (code === "not_configured" || code === "rate_limited" ? code : "error");

export function useChat(lang: Lang) {
  const [messages, setMessages] = useState<ChatMessage[]>(load);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<ChatError | null>(null);
  /** The last reply that finished, for the screen-reader live region. */
  const [announced, setAnnounced] = useState("");
  const abort = useRef<AbortController | null>(null);

  // Saved once a reply is complete (not on every streamed token).
  useEffect(() => {
    if (status === "idle") save(messages);
  }, [messages, status]);

  useEffect(() => () => abort.current?.abort(), []);

  const request = useCallback(
    async (history: ChatMessage[]) => {
      abort.current?.abort();
      const controller = new AbortController();
      abort.current = controller;
      setError(null);
      setStatus("waiting");
      const id = newId();
      let text = "";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })), lang }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body || !res.headers.get("content-type")?.startsWith("text/plain")) {
          const body = (await res.json().catch(() => ({}))) as { error?: unknown };
          throw errorOf(body.error);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          if (!text) continue;
          const reply: ChatMessage = { id, role: "assistant", content: text };
          setStatus("streaming");
          setMessages((list) => (list.at(-1)?.id === id ? [...list.slice(0, -1), reply] : [...list, reply]));
        }
        text += decoder.decode();
        if (!text.trim()) throw "error";
        setAnnounced(text);
      } catch (thrown) {
        if (controller.signal.aborted) return;
        // A reply cut off mid-way is dropped; "Try again" asks for it again.
        setMessages((list) => (list.at(-1)?.id === id ? list.slice(0, -1) : list));
        setError(typeof thrown === "string" ? errorOf(thrown) : "error");
      } finally {
        if (abort.current === controller) {
          abort.current = null;
          setStatus("idle");
        }
      }
    },
    [lang],
  );

  const send = useCallback(
    (content: string) => {
      const text = content.trim().slice(0, ASK_CAT.maxChars);
      if (!text || status !== "idle") return;
      const next = [...messages, { id: newId(), role: "user" as const, content: text }];
      setMessages(next);
      void request(next);
    },
    [messages, status, request],
  );

  const retry = useCallback(() => {
    if (status !== "idle" || messages.at(-1)?.role !== "user") return;
    void request(messages);
  }, [messages, status, request]);

  const reset = useCallback(() => {
    abort.current?.abort();
    abort.current = null;
    setMessages([]);
    setError(null);
    setStatus("idle");
    setAnnounced("");
  }, []);

  return { messages, status, error, announced, send, retry, reset };
}
