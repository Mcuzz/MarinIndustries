"use client";

import Link from "next/link";
import { ThemeToggle } from "../components/layout/ThemeToggle";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/src/infrastructure/supabase/client";
import { useLanguage } from "../i18n/LanguageProvider";

export function RegisterPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { translations, language, setLanguage } = useLanguage();
  const t = translations.auth;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirm-password"));

    if (password !== confirmPassword) {
      setMessage(t.passwordMismatch);
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: String(formData.get("email")),
        password,
        options: {
          data: { full_name: String(formData.get("full-name")) },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        console.error("Error de registro:", error);
        setMessage(t.registrationError);
        return;
      }

      if (data.session) {
        router.push("/convocatorias");
        router.refresh();
        return;
      }

      setMessage(
        t.accountCreated,
      );
    } catch {
      setMessage(
        t.connectionError,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-brandBg lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative flex min-h-[34vh] flex-col justify-between overflow-hidden bg-brandBlueDeep px-7 py-7 text-white sm:px-12 sm:py-10 lg:min-h-screen lg:px-16 lg:py-12">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full border border-brandAccent/30" />
        <Link href="/" className="relative flex w-fit items-center gap-3">
          <img
            src="/assets/logo.jpeg"
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />
          <span className="text-sm font-semibold tracking-wide">
            MARIN INDUSTRIES
          </span>
        </Link>

        <div className="relative mt-10 max-w-xl lg:mt-0">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brandAccent">
            {t.registerEyebrow}
          </p>
          <h1 className="max-w-lg text-4xl font-bold leading-tight sm:text-5xl">
            {t.registerTitle}
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-blue-100">
            {t.registerDescription}
          </p>
        </div>

        <p className="relative mt-8 text-xs text-blue-200 lg:mt-0">
          {translations.common.footerDescription}
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-brandMuted transition hover:text-brandDark"
            >
              ← {t.backHome}
            </Link>
            <div className="flex items-center gap-2" aria-label={translations.language.select}>
              <button type="button" aria-pressed={language === "es"} onClick={() => setLanguage("es")}>ES</button>
              <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
            </div>
            <ThemeToggle />
          </div>
          <div className="mt-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brandMuted">
              {t.registerEyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-brandDark">
              {t.registerHeading}
            </h2>
            <p className="mt-3 text-sm leading-6 text-brandText">
              {t.registerLead}
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="full-name"
                className="mb-2 block text-sm font-semibold text-brandText"
              >
                {t.name}
              </label>
              <input
                id="full-name"
                name="full-name"
                type="text"
                autoComplete="name"
                required
                placeholder={t.namePlaceholder}
                className="w-full border border-brandLine bg-brandSurface px-4 py-3 text-sm text-brandDark outline-none transition placeholder:text-brandMuted focus:border-interactive focus:ring-2 focus:ring-interactive/15"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-brandText"
              >
                {t.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder={t.emailPlaceholder}
                className="w-full border border-brandLine bg-brandSurface px-4 py-3 text-sm text-brandDark outline-none transition placeholder:text-brandMuted focus:border-interactive focus:ring-2 focus:ring-interactive/15"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-brandText"
              >
                {t.password}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                placeholder={t.passwordHint}
                className="w-full border border-brandLine bg-brandSurface px-4 py-3 text-sm text-brandDark outline-none transition placeholder:text-brandMuted focus:border-interactive focus:ring-2 focus:ring-interactive/15"
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-semibold text-brandText"
              >
                {t.confirmPassword}
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                placeholder={t.confirmPlaceholder}
                className="w-full border border-brandLine bg-brandSurface px-4 py-3 text-sm text-brandDark outline-none transition placeholder:text-brandMuted focus:border-interactive focus:ring-2 focus:ring-interactive/15"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brandAccent px-5 py-3.5 text-sm font-bold text-brandDark transition hover:bg-brandAccentHover focus:outline-none focus:ring-2 focus:ring-interactive focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? t.creating : t.create}
            </button>
            {message ? (
              <p
                role="status"
                className="border-l-2 border-brandAccent bg-brandSurface px-4 py-3 text-sm text-brandText"
              >
                {message}
              </p>
            ) : null}
          </form>

          <p className="mt-8 border-t border-brandLine pt-5 text-sm text-brandMuted">
            {t.haveAccount}{" "}
            <Link
              href="/login"
              className="font-semibold text-brandDark underline underline-offset-4"
            >
              {t.login}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
