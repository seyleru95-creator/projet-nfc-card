import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronRight,
  Smartphone,
  TrendingUp,
  User,
  UserCheck,
  Wifi,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cartes de visite NFC - Presence Numerique" },
      {
        name: "description",
        content:
          "Creez des profils digitaux elegants et interactifs pour vos cartes NFC. Partagez vos coordonnees, reseaux sociaux et portfolio avec un simple tap.",
      },
    ],
  }),
  component: HomePage,
});

const features = [
  {
    icons: [User, UserCheck],
    title: "Profils personnalisables",
    text: "Personnalisez chaque aspect de votre profil NFC : couleurs, polices, reseaux sociaux et bien plus encore.",
  },
  {
    icons: [Smartphone, Wifi],
    title: "Partage instantane",
    text: "Un simple tap sur votre carte NFC suffit pour partager vos informations avec n'importe quel smartphone compatible.",
  },
  {
    icons: [BarChart3, TrendingUp],
    title: "Analytics integres",
    text: "Suivez l'engagement de vos contacts avec des statistiques detaillees sur les vues et les interactions.",
  },
] as const;

function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-[radial-gradient(circle_at_80%_20%,#1a2c4c_0%,#0b111e_60%)] px-5 py-10 text-white sm:px-6 sm:py-16">
      {/* Decorative halo bottom-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[10%] left-[5%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,rgba(0,0,0,0)_70%)]"
      />

      <header className="mb-12 max-w-2xl text-center sm:mb-14">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Transformez votre presence numerique
        </p>
        <h1 className="mb-1 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Cartes de visite NFC
        </h1>
        <p className="mb-6 text-xl font-normal text-slate-300 sm:text-2xl">
          pour les professionnels modernes
        </p>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
          Creez des profils digitaux elegants et interactifs pour vos cartes NFC. Partagez vos
          coordonnees, reseaux sociaux et portfolio avec un simple tap.
        </p>
      </header>

      <main className="mb-12 grid w-full max-w-6xl gap-6 sm:mb-14 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
          >
            <div className="mb-6 inline-flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sky-300">
              {feature.icons.map((Icon, idx) => (
                <Icon key={idx} className="h-6 w-6 opacity-90" aria-hidden />
              ))}
            </div>
            <h3 className="mb-4 text-xl font-semibold text-white">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{feature.text}</p>
          </article>
        ))}
      </main>

      <div className="group relative mb-7">
        <div
          aria-hidden
          className="absolute inset-0 rounded-[30px] bg-gradient-to-r from-sky-200 to-sky-400 opacity-40 blur-[15px] transition-opacity duration-300 group-hover:opacity-60"
        />
        <Link
          to="/auth"
          className="relative inline-flex items-center gap-2.5 rounded-[30px] bg-gradient-to-r from-sky-100 to-sky-200 px-9 py-4 text-base font-semibold text-slate-900 transition-all duration-200 hover:scale-[1.02] hover:from-sky-50 hover:to-sky-100 sm:px-10"
        >
          Commencer gratuitement
          <ChevronRight className="h-[18px] w-[18px]" aria-hidden />
        </Link>
      </div>

      <p className="text-sm text-slate-500">
        Deja client ?{" "}
        <Link
          to="/auth"
          className="text-slate-300 underline underline-offset-2 transition-colors hover:text-sky-400"
        >
          Connectez-vous ici
        </Link>
      </p>
    </div>
  );
}
