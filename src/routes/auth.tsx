import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion - NFC Card Admin" },
      {
        name: "description",
        content: "Accedez au back-office NFC Card pour gerer vos profils digitaux.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { loading, error, handleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await handleLogin(email, password);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[radial-gradient(circle_at_80%_20%,#1a2c4c_0%,#0b111e_60%)] px-5 py-10 text-white sm:px-6 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[10%] left-[5%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,rgba(0,0,0,0)_70%)]"
      />

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-10">
        <p className="mb-4 text-base font-bold uppercase tracking-[0.2em] text-sky-300 sm:text-lg">
          NFC Card Admin
        </p>

        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">Connexion</h1>
        <p className="mx-auto mb-8 max-w-sm text-sm leading-relaxed text-slate-400 sm:text-base">
          Connecte-toi avec ton adresse email et ton mot de passe pour acceder au back-office.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-5 text-left" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="client@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-200">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/20"
            />
          </div>

          {error ? (
            <p role="alert" className="text-center text-sm text-rose-300">
              {error}
            </p>
          ) : null}

          <div className="group relative mt-2">
            <div
              aria-hidden
              className="absolute inset-0 rounded-[30px] bg-gradient-to-r from-sky-200 to-sky-400 opacity-40 blur-[15px] transition-opacity duration-300 group-hover:opacity-60"
            />
            <button
              type="submit"
              disabled={loading}
              className="relative inline-flex w-full items-center justify-center gap-2.5 rounded-[30px] bg-gradient-to-r from-sky-100 to-sky-200 px-9 py-4 text-base font-semibold text-slate-900 transition-all duration-200 hover:scale-[1.01] hover:from-sky-50 hover:to-sky-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="mb-3 text-sm text-slate-400">Nouveau client ? ecrivez-nous</p>
          <a
            href="https://wa.me/41799384082"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-[#25D366] px-7 py-4 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#22c25e]"
          >
            <MessageCircle className="h-6 w-6" aria-hidden />
            Contactez-nous
          </a>
        </div>
      </div>
    </div>
  );
}
