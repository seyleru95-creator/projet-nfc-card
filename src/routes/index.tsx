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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="text-center mb-16">
          <p className="mb-4 text-xs font-semibold tracking-wider text-slate-400 uppercase letter-spacing-[0.15em]">
            Transformez votre présence numérique
          </p>
          
          <h1 className="text-5xl font-bold tracking-tight mb-6 sm:text-6xl lg:text-7xl bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Cartes de visite NFC<br/><span className="block text-slate-200 text-lg font-normal lg:text-xl">pour les professionnels modernes</span>
          </h1>
          
          <p className="text-slate-300 max-w-2xl mx-auto text-lg lg:text-xl leading-relaxed">
            Créez des profils digitaux élégants et interactifs pour vos cartes NFC. Partagez vos coordonnées, réseaux sociaux et portfolio avec un simple tap.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature Card 1 */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-8 hover:border-slate-600/70 transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-6 p-4 bg-slate-800/30 rounded-xl">
              <svg className="h-10 w-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zm0 10c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z"/>
              </svg>
            </div>
            <h3 className="mb-4 text-xl font-semibold">Profils personnalisables</h3>
            <p className="text-slate-400 leading-relaxed">
              Personnalisez chaque aspect de votre profil NFC : couleurs, polices, réseaux sociaux et bien plus encore.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-8 hover:border-slate-600/70 transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-6 p-4 bg-slate-800/30 rounded-xl">
              <svg className="h-10 w-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="mb-4 text-xl font-semibold">Partage instantané</h3>
            <p className="text-slate-400 leading-relaxed">
              Un simple tap sur votre carte NFC suffit pour partager vos informations avec n'importe quel smartphone compatible.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-8 hover:border-slate-600/70 transition-all duration-300 transform hover:-translate-y-1">
            <div className="mb-6 p-4 bg-slate-800/30 rounded-xl">
              <svg className="h-10 w-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8m0 0L8 15m0 0l4-4"/>
              </svg>
            </div>
            <h3 className="mb-4 text-xl font-semibold">Analytics intégrés</h3>
            <p className="text-slate-400 leading-relaxed">
              Suivez l'engagement de vos contacts avec des statistiques détaillées sur les vues et les interactions.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/auth"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-slate-200 to-slate-300 text-slate-900 font-semibold rounded-3xl hover:opacity-90 transition-all duration-300 shadow-lg shadow-slate-500/25 text-sm sm:px-10 sm:py-5"
          >
            Commencer gratuitement
            <svg className="ml-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        <div className="mt-20 text-center text-slate-500 text-sm">
          <p>Déjà client ? <a href="/auth" className="text-slate-200 hover:underline font-medium">Connectez-vous ici</a></p>
        </div>
      </div>
    </div>
  );
}