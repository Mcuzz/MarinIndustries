"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/src/infrastructure/supabase/client";

export function RegisterPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirm-password"));

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
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
        setMessage(error.message);
        return;
      }

      if (data.session) {
        router.push("/convocatorias");
        router.refresh();
        return;
      }

      setMessage(
        "Cuenta creada. Revisa tu correo para confirmar la dirección antes de iniciar sesión.",
      );
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
            Únete a Marin Industries
          </p>
          <h1 className="max-w-lg text-4xl font-bold leading-tight sm:text-5xl">
            Tu siguiente proyecto empieza aquí.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-blue-100">
            Crea tu cuenta para acceder a tu espacio de trabajo.
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
            className="text-sm font-medium text-slate-500 transition hover:text-brandDark"
          >
            ← Volver al sitio
          </Link>
          <div className="mt-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Nueva cuenta
            </p>
            <h2 className="mt-2 text-3xl font-bold text-brandDark">
              Crear cuenta
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Completa tus datos para registrarte.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="full-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Nombre completo
              </label>
              <input
                id="full-name"
                name="full-name"
                type="text"
                autoComplete="name"
                required
                placeholder="Tu nombre"
                className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/15"
              />
            </div>
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
                autoComplete="email"
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
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="Al menos 8 caracteres"
                className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/15"
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="Repite tu contraseña"
                className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/15"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brandAccent px-5 py-3.5 text-sm font-bold text-brandDark transition hover:bg-brandAccentHover focus:outline-none focus:ring-2 focus:ring-brandBlue focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
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

          <p className="mt-8 border-t border-slate-200 pt-5 text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-semibold text-brandDark underline underline-offset-4"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
