import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CONTACT_EMAIL, SHOP } from "../../config/shop";
import { useLocale } from "../../i18n";

// "Email me": a real contact form, sent by POST /api/contact (Resend, api/_lib/contact.ts). No
// panel: underline fields straight on the page, in the theme's colours. Falls back to mailto.

type Field = "name" | "email" | "message";
type Status = "idle" | "sending" | "sent" | "error" | "rate_limited";

const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;
const empty = { name: "", email: "", message: "", company: "" };

export function ContactForm() {
  const { t, lang, num } = useLocale();
  const reduce = useReducedMotion();
  const [values, setValues] = useState(empty);
  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const refs = { name: useRef<HTMLInputElement>(null), email: useRef<HTMLInputElement>(null), message: useRef<HTMLTextAreaElement>(null) };

  const invalid: Record<Field, boolean> = {
    name: !values.name.trim(),
    email: !EMAIL.test(values.email.trim()),
    message: !values.message.trim(),
  };
  const set = (key: keyof typeof empty) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (status === "sent" || status === "error" || status === "rate_limited") setStatus("idle");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setChecked(true);
    const first = (["name", "email", "message"] as const).find((f) => invalid[f]);
    if (first) return refs[first].current?.focus();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, page: window.location.pathname, lang }),
      });
      if (res.ok) {
        setValues(empty);
        setChecked(false);
        setStatus("sent");
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus(body.error === "rate_limited" ? "rate_limited" : "error");
    } catch {
      setStatus("error");
    }
  };

  const mailto = `mailto:${CONTACT_EMAIL}`;
  const showError = (f: Field) => checked && invalid[f];
  const counter = values.message.length >= SHOP.contact.counterFrom;

  return (
    <form noValidate onSubmit={submit} className="contact-form w-full" aria-labelledby="contact-title">
      <h2 id="contact-title" className="text-2xl font-black tracking-tight rtl:tracking-normal" style={{ color: "var(--t-text)" }}>
        {t("shop.contact.title")}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--t-text-muted)" }}>
        {t("shop.contact.line")}
      </p>

      <div className="mt-5 space-y-4">
        <TextField id="cf-name" label={t("shop.contact.name")} error={showError("name") ? t("shop.contact.invalid.name") : ""}>
          <input ref={refs.name} id="cf-name" name="name" autoComplete="name" maxLength={SHOP.contact.nameMax} value={values.name} onChange={set("name")} aria-invalid={showError("name")} aria-describedby={showError("name") ? "cf-name-error" : undefined} />
        </TextField>
        <TextField id="cf-email" label={t("shop.contact.email")} error={showError("email") ? t("shop.contact.invalid.email") : ""}>
          <input ref={refs.email} id="cf-email" name="email" type="email" dir="ltr" autoComplete="email" maxLength={254} value={values.email} onChange={set("email")} aria-invalid={showError("email")} aria-describedby={showError("email") ? "cf-email-error" : undefined} />
        </TextField>
        <TextField id="cf-message" label={t("shop.contact.message")} error={showError("message") ? t("shop.contact.invalid.message") : ""}>
          <textarea ref={refs.message} id="cf-message" name="message" rows={3} maxLength={SHOP.contact.messageMax} value={values.message} onChange={set("message")} aria-invalid={showError("message")} aria-describedby={showError("message") ? "cf-message-error" : undefined} />
        </TextField>
        {counter && (
          <p className="-mt-2 text-end text-[11px] tabular-nums" style={{ color: values.message.length >= SHOP.contact.messageMax ? "var(--t-danger)" : "var(--t-text-muted)" }}>
            {t("shop.contact.counter", { n: num(values.message.length), max: num(SHOP.contact.messageMax) })}
          </p>
        )}
        {/* Honeypot: hidden from people (and screen readers); bots that fill it are ignored. */}
        <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="cf-company">Company</label>
          <input id="cf-company" name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={set("company")} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-bold outline-none transition-opacity focus-visible:outline-[3px] focus-visible:outline-offset-2 disabled:opacity-80"
          style={{ background: "var(--t-accent)", color: "var(--t-on-accent)", outlineColor: "var(--t-text)" }}
        >
          {status === "sending" && <span aria-hidden="true" className="cf-spinner" />}
          {status === "sending" ? t("shop.contact.sending") : t("shop.contact.send")}
        </button>
        <a href={mailto} className="text-xs underline underline-offset-4 outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2" style={{ color: "var(--t-text-muted)", outlineColor: "var(--t-text)" }}>
          {t("shop.contact.direct")}
        </a>
      </div>

      <div aria-live="polite" className="min-h-6">
        <AnimatePresence>
          {(status === "sent" || status === "error" || status === "rate_limited") && (
            <motion.p
              key={status}
              initial={{ opacity: 0, y: reduce ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-3 text-sm font-semibold"
              style={{ color: status === "sent" ? "var(--t-accent)" : "var(--t-danger)" }}
            >
              {status === "sent" ? t("shop.contact.success") : t(status === "rate_limited" ? "shop.contact.rateLimited" : "shop.contact.error")}
              {status !== "sent" && (
                <>
                  {" "}
                  <a href={mailto} className="underline underline-offset-4">
                    {CONTACT_EMAIL}
                  </a>
                </>
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

function TextField({ id, label, error, children }: { id: string; label: string; error: string; children: ReactNode }) {
  return (
    <div className="cf-field" data-invalid={!!error}>
      <label htmlFor={id} className="block text-xs font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs" style={{ color: "var(--t-danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
