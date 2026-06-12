"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import Link from "next/link";
import { AssistantProductPicker } from "@/components/ai/AssistantProductPicker";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import type { AssistantProduct, AssistantLink } from "@/lib/assistant/types";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  links?: AssistantLink[];
  products?: AssistantProduct[];
};

const SESSION_KEY = "palm-shades-assistant-session";

function getSessionId() {
  if (typeof window === "undefined") return undefined;
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `sess-${Date.now()}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export function ShoppingAssistant() {
  const openCart = useCart((s) => s.open);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: `Hi! I'm the ${siteConfig.shortName} assistant. Ask about frames, lenses, fittings, delivery, or payment — or say "add [product] to cart".`,
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/shop-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: getSessionId(),
          pagePath:
            typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: data.reply ?? "Sorry, I couldn't process that. Try again?",
          links: data.links,
          products: data.products,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-4 z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 transition hover:bg-primary-700 lg:bottom-6"
          aria-label="Open shopping assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      ) : null}

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close shopping assistant"
            className="fixed inset-0 z-[64] bg-charcoal/30 backdrop-blur-[2px] lg:bg-charcoal/20"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Shopping assistant"
            className={cn(
              "fixed z-[65] flex flex-col overflow-hidden border border-blush-200 bg-white shadow-2xl",
              "inset-x-0 bottom-0 max-h-[min(88dvh,calc(100dvh-4rem))] rounded-t-2xl",
              "lg:inset-x-auto lg:bottom-24 lg:right-4 lg:max-h-[min(560px,72dvh)] lg:w-[min(400px,calc(100vw-2rem))] lg:rounded-2xl"
            )}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-blush-100 bg-blush-50 px-4 py-3">
              <div className="min-w-0 pr-3">
                <p className="truncate font-semibold text-charcoal">
                  {siteConfig.shortName} Assistant
                </p>
                <p className="truncate text-xs text-charcoal-light">
                  Products, booking & add to cart
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-charcoal-light hover:bg-blush-100 hover:text-charcoal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex w-full min-w-0 flex-col gap-2",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed break-words",
                      msg.role === "user"
                        ? "bg-primary-600 text-white"
                        : "bg-blush-50 text-charcoal"
                    )}
                  >
                    <p>{msg.text}</p>
                    {msg.links?.length ? (
                      <ul className="mt-2 space-y-1">
                        {msg.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="text-xs font-semibold underline opacity-90"
                              onClick={() => setOpen(false)}
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  {msg.products?.length ? (
                    <div className="w-full min-w-0 space-y-2">
                      {msg.products.map((p) => (
                        <AssistantProductPicker
                          key={p.id}
                          product={p}
                          onViewCart={() => {
                            setOpen(false);
                            openCart();
                          }}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}

              {loading ? (
                <p className="text-xs text-charcoal-light">Thinking…</p>
              ) : null}
            </div>

            <form
              className="flex shrink-0 gap-2 border-t border-blush-100 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask or say add aviator to cart…"
                className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-blush-200 px-3 text-base outline-none focus:border-primary-400 sm:text-sm"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-600 text-white disabled:opacity-50"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      ) : null}
    </>
  );
}
