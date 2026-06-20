import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NFC Profile" },
      {
        name: "description",
        content: "Digital profile pages for NFC cards.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  // --------------------------------------------------
  // Logique globale :
  // 1. Cette page n'affiche plus de profil client
  // 2. Elle sert juste de point d'entrée propre pour le projet
  // 3. Les vrais profils publics sont désormais sur /$slug
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_oklch(0.78_0.09_285),_oklch(0.62_0.08_260)_100%)] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <main className="w-full rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 text-center shadow-2xl backdrop-blur-md">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
            NFC Profile
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Profils digitaux pour cartes NFC
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
            Cette page d’accueil est maintenant neutre. Les profils publics clients
            sont accessibles via leur slug personnalisé.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/auth"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Connexion client
            </Link>

            <Link
              to="/admin"
              className="rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
            >
              Back-office
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
              Exemple
            </p>
            <p className="mt-2 text-sm text-white/75">
              Un profil public se consulte avec une URL comme :
            </p>
            <p className="mt-2 rounded-xl bg-black/20 px-3 py-2 text-sm text-white">
              /elyes-mansour
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}