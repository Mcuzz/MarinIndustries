"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/src/infrastructure/supabase/client";

export function LoginPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
          "No se pudo iniciar sesión. Revisa tu correo y contraseña e inténtalo de nuevo.",
        );
        return;
      }

      router.push("/convocatorias");
      router.refresh();
    } catch {
      setMessage(
        "No se pudo conectar. Revisa la configuración de Supabase e inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f4f5f2] lg:grid-cols-[1.05fr_0.95fr]">
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
            Portal de acceso
          </p>
          <h1 className="max-w-lg text-4xl font-bold leading-tight sm:text-5xl">
            Tecnología que mueve tu negocio.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-blue-100">
            Ingresa a tu espacio de trabajo de Marin Industries.
          </p>
        </div>

        <p className="relative mt-8 text-xs text-blue-200 lg:mt-0">
          Soluciones digitales para negocios locales
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="text-sm font-medium text-slate-700 transition hover:text-brandDark"
          >
            {" "}
            ← Volver al sitio
          </Link>
          <div className="mt-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">
              Bienvenido
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Iniciar sesión
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Introduce tus datos para continuar a tu cuenta.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                placeholder="nombre@empresa.com"
                className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/15"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Ingresa tu contraseña"
                className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/15"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="remember"
                className="h-4 w-4 accent-brandBlue"
              />
              Recordar mi correo
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brandAccent px-5 py-3.5 text-sm font-bold text-brandDark transition hover:bg-brandAccentHover focus:outline-none focus:ring-2 focus:ring-brandBlue focus:ring-offset-2"
            >
              {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
            </button>
            {message ? (
              <p
                role="status"
                className="border-l-2 border-brandAccent bg-white px-4 py-3 text-sm text-slate-700"
              >
                {message}
              </p>
            ) : null}
          </form>

          <p className="mt-5 text-center text-sm text-slate-700">
            ¿No tienes cuenta?{" "}
            <Link
              href="/registro"
              className="font-semibold text-slate-400 underline underline-offset-4"
            >
              Crear cuenta
            </Link>
          </p>

          <p className="mt-8 border-t border-slate-200 pt-5 text-sm text-slate-700">
            {" "}
            ¿Necesitas ayuda?{" "}
            <Link
              href="/#contacto"
              className="font-semibold text-slate-400 underline underline-offset-4"
            >
              Contacta con Marin Industries
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
