"use client";

import Link from "next/link";
import { ThemeToggle } from "../components/layout/ThemeToggle";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/src/infrastructure/supabase/client";
import { useLanguage } from "../i18n/LanguageProvider";

export function LoginPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { translations, language, setLanguage } = useLanguage();
  const t = translations.auth;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      });

      if (error) {
        setMessage(
          t.loginError,
        );
        return;
      }

      router.push("/convocatorias");
      router.refresh();
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
        <Link href="/" className="relative flex w-fit items-center gap-3">
          <img
            src="/assets/logo.png"
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />
          <span className="text-sm font-semibold tracking-wide">
            MARIN INDUSTRIES
          </span>
        </Link>

        <div className="relative mt-10 max-w-xl lg:mt-0">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brandAccent">
            {t.portal}
          </p>
          <h1 className="max-w-lg text-4xl font-bold leading-tight sm:text-5xl">
            {t.loginTitle}
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-blue-100">
            {t.loginDescription}
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
              className="text-sm font-medium text-brandText transition hover:text-brandDark"
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
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brandText">
              {t.loginEyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-brandDark">
              {t.loginHeading}
            </h2>
            <p className="mt-3 text-sm leading-6 text-brandText">
              {t.loginLead}
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
                autoComplete="username"
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
                autoComplete="current-password"
                required
                placeholder={t.passwordPlaceholder}
                className="w-full border border-brandLine bg-brandSurface px-4 py-3 text-sm text-brandDark outline-none transition placeholder:text-brandMuted focus:border-interactive focus:ring-2 focus:ring-interactive/15"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-brandText">
              <input
                type="checkbox"
                name="remember"
                className="h-4 w-4 accent-brandBlue"
              />
              {t.remember}
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brandAccent px-5 py-3.5 text-sm font-bold text-brandDark transition hover:bg-brandAccentHover focus:outline-none focus:ring-2 focus:ring-interactive focus:ring-offset-2"
            >
              {isSubmitting ? t.signingIn : t.signIn}
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

          <p className="mt-5 text-center text-sm text-brandText">
            {t.needAccount}{" "}
            <Link
              href="/registro"
              className="font-semibold text-brandMuted underline underline-offset-4"
            >
              {t.register}
            </Link>
          </p>

          <p className="mt-8 border-t border-brandLine pt-5 text-sm text-brandText">
            {" "}
            {t.contactPrompt}{" "}
            <Link
              href="/#contacto"
              className="font-semibold text-brandMuted underline underline-offset-4"
            >
              {t.contact}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
