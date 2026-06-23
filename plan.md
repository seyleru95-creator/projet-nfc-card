# Plan d'amélioration du projet NFC Card

_Dernière revue : 2026-06-23 — audit statique du dépôt, lecture seule._

## 1. Résumé global

**Forces :**
- TanStack Query v5 idiomatique dans `useProfile`/`useGallery` (`mutateAsync`, `invalidateQueries`, `setQueryData`, `enabled`).
- Types centralisés dans `src/types/profile.ts` et réutilisés partout.
- `auth.tsx` ne tape plus `supabase` directement depuis la passe précédente — il passe par `useAuth.handleLogin`.
- Décomposition `admin.tsx` → 3 sous-composants : fichiers créés, séparations franches.
- `$slug.tsx` n'a plus de fonction-form dans `head.meta`, plus de `buildVCard` local (passe à `lib/profile-utils.ts`).

**Faiblesses :**
- Les trois sous-composants admin dépassent le budget de 200 lignes (`BackgroundControls.tsx` à 359 lignes, soit presque le double du cap).
- `useAuth` n'est pas un `useQuery` — incohérent avec le reste de la couche hooks, et ne s'abonne pas à `supabase.auth.onAuthStateChange`.
- `$slug.tsx` recrée son propre client Supabase au lieu d'importer le singleton.
- `BackgroundControls` upload d'image : stub `FileReader → data URL`, jamais pushé vers le bucket `profile`.
- `services/supabaseService.ts` (184 lignes, mort) contient un `deleteGalleryItem` sans filtre `profile_id` — bombe à retardement si jamais câblé.
- Migration Tailwind non faite : `BackgroundControls` (22 blocs `style={{}}`), `GalleryManager` (5), `ProfileForm` (4), `auth.tsx` (3) — toujours 100 % inline styles.
- `plan.md` coche des ✅ qui ne correspondent pas à la réalité du code.

**Risques :**
- **Sécurité** : `supabaseService.deleteGalleryItem` omet `.eq("profile_id", profileId)` — régression latente. `$slug.tsx:120,135` log des erreurs Supabase brutes.
- **UX** : labels non associés (`auth.tsx`), pas de focus states, upload background stub.
- **Maintenabilité** : props fantômes (`void userId`, `void setMsg`), 5 fichiers `app.config.timestamp_*.js` orphelins à la racine.

## 2. Problèmes détectés

| Priorité | Catégorie | Fichier | Problème | Impact | Correction recommandée |
|---|---|---|---|---|---|
| Critique | Sécurité | `src/services/supabaseService.ts:179-184` | `deleteGalleryItem` filtre uniquement par `id`, pas par `profile_id` — IDOR latent | Élevé si jamais câblé | Ajouter `.eq("profile_id", profileId)` ; aligner avec `useGallery.ts:80-84` |
| Critique | Sécurité | `src/routes/admin.tsx:61-63` | `navigate({ to: "/auth" })` appelé pendant le render → warning TanStack Router | Moyen (UX/SPA) | Déplacer dans `useEffect` ou utiliser `redirect()` dans `beforeLoad` de la route `/admin` |
| Haute | Sécurité | `src/routes/auth.tsx` inputs sans `htmlFor`/id | Labels non associés aux champs (WCAG 1.3.1, 4.1.2) | Moyen (accessibilité) | Ajouter `id="email"`, `id="password"`, `<label htmlFor="...">` |
| Haute | Architecture | `src/components/admin/BackgroundControls.tsx:359` | Composant à 359 lignes, dont 22 blocs inline styles + helpers `parseBackground`/`buildValue` non exportés | Élevé (maintenabilité) | Extraire `parseBackground`/`buildValue`/`bgPreview` vers `lib/profile-utils.ts` ; scinder en `<BackgroundColorPicker>` / `<BackgroundImagePicker>` |
| Haute | Architecture | `src/components/admin/ProfileForm.tsx:229`, `GalleryManager.tsx:202` | Tous deux dépassent le cap 200 lignes | Moyen | Sortir les sous-blocs `AvatarPicker` de `ProfileForm` ; sortir `GalleryUploader`/`GalleryItem`/`GalleryGrid` de `GalleryManager` |
| Haute | Architecture | `src/hooks/useAuth.ts` | Pas un `useQuery` — incohérent avec `useProfile`/`useGallery` ; pas d'`onAuthStateChange` | Moyen (fraîcheur session, stale JWT) | Convertir en `useQuery` (queryKey `["auth","user"]`), brancher `supabase.auth.onAuthStateChange` pour invalider la query |
| Haute | Maintenabilité | `src/routes/$slug.tsx:4-13` | Double client Supabase (relit `import.meta.env` et instancie un 2e `createClient`) | Moyen (drift si env divergent) | Remplacer par `import { supabase } from "@/lib/supabase"` |
| Haute | UX | `src/components/admin/BackgroundControls.tsx:123-136` | `handleImagePick` produit un `data:image/...` URL en mémoire, jamais uploadé sur Supabase | Élevé (la fonctionnalité est factice) | Implémenter l'upload réel vers `supabase.storage.from("profile")` puis `updateBackground({ type: "image", value: publicUrl })` |
| Haute | UX | `src/routes/admin.tsx:101,111,122,132,146` | `setMsg("Erreur X : " + err.message)` — fuite de messages PostgREST | Moyen | Mapper les erreurs via un helper `toUserMessage(err)` ; logger le détail en `console.error` côté serveur uniquement |
| Haute | UX | `src/components/admin/GalleryManager.tsx:81` | Pas de `loading="lazy"` sur les images de galerie | Faible-Moyen | Ajouter `loading="lazy"` |
| Moyenne | Architecture | `src/components/admin/ProfileForm.tsx:48`, `BackgroundControls.tsx:70`, `GalleryManager.tsx:29-30` | Props inutilisés (`void userId`, `void setMsg`) | Faible (signal de refactoring incomplet) | Retirer des interfaces et des call sites |
| Moyenne | UX | `src/components/admin/GalleryManager.tsx:108-112` | `<p style={{display:"none"}}>` avec `profile.id` — dead code + aria-hidden cassé | Faible | Supprimer |
| Moyenne | UX | `src/routes/$slug.tsx:144-152` | `setInterval` du carrousel tourne même avec une seule image | Faible | Ajouter `if (gallery.length <= 1) return;` |
| Moyenne | UX | `src/routes/auth.tsx:55` | `<p>` d'erreur sans `role="alert"` | Faible | `role="alert"` |
| Moyenne | Sécurité | `src/routes/$slug.tsx:120,135` | `console.error` expose les erreurs Supabase brutes | Faible | Logger côté serveur / via le helper d'erreur ; retirer côté client |
| Moyenne | Performance | `src/routes/admin.tsx:46-50` (`useState(msg)`) | Re-render des 3 enfants à chaque changement de message | Faible | Utiliser `sonner` (déjà en deps) ou `useReducer` local ; mémoïser les callbacks enfants |
| Moyenne | Performance | `src/components/admin/GalleryManager.tsx:45` | `useMemo(() => gallery, [gallery])` — mémoïsation no-op | Aucun | Supprimer ou mémoïser un dérivé (`galleryWithUrls`) |
| Faible | Maintenabilité | `src/services/supabaseService.ts` (184 lignes) | Code dormant mais avec IDOR — à réparer plutôt que supprimer | Aucun | Réparer `deleteGalleryItem` + `deleteProfile` pour aligner avec `useGallery.ts:80-84` |
| Faible | Maintenabilité | `app.config.timestamp_*.js` × 5, `fix_admin.py` | Artefacts à la racine | Aucun | Supprimer / déplacer |
| Faible | Performance | `src/hooks/useProfile.ts:11,131`, `useGallery.ts:11,95` | `useQuery` destructure `isLoading` (alias deprecated de `isPending`) | Aucun | Renommer en `isPending` (cohérence avec les mutations) |
| Faible | Performance | `src/router.tsx:6` | `new QueryClient()` sans `defaultOptions` (pas de staleTime, retry, refetchOnWindowFocus) | Faible | Ajouter `defaultOptions.queries.staleTime: 30_000`, `retry: 1` |
| Faible | Sécurité | pas de CSP / headers | Aucun `Content-Security-Policy` ni `vercel.json` headers | Faible (Vercel SPA) | Ajouter headers via `vercel.json` (`X-Content-Type-Options`, `Referrer-Policy`, CSP) |
| Faible | Sécurité | pas de password reset | Pas de flow "mot de passe oublié" | UX | Ajouter une route `/auth/reset` ou un lien mailto |

## 3. Plan d'action priorisé

### Quick wins (1-2 heures)

**✅ Déjà faits, statut réel :**

- ✅ **Extraire les types partagés vers `src/types/profile.ts`** — TERMINÉ
- ✅ **Créer un hook d'authentification basique `useAuth.ts`** — TERMINÉ (mais à convertir en `useQuery` + `onAuthStateChange`, voir CT-D)
- ✅ **Améliorer les messages d'erreur dans `auth.tsx`** — PARTIELLEMENT FAIT (`useAuth` OK, mais `admin.tsx` fuit encore `err.message`)

**Quick wins réels restants :**

- **QW-A** Réparer `supabaseService.ts` (ajouter `.eq("profile_id", profileId)` sur `deleteGalleryItem` et `deleteProfile`)
- **QW-B** Supprimer `app.config.timestamp_*.js` ×5 + `fix_admin.py` à la racine
- **QW-C** Fixer `navigate` pendant render dans `admin.tsx` (`useEffect` ou `redirect()` dans `beforeLoad`)
- **QW-D** Brancher `$slug.tsx` sur le singleton `lib/supabase.ts`
- **QW-E** Convertir `useAuth` en `useQuery(["auth","user"])` + `supabase.auth.onAuthStateChange`

### Important à court terme (1-2 jours)

**✅ Déjà faits, statut réel :**

- ✅ **Décomposer `admin.tsx`** — PARTIELLEMENT FAIT (fichiers créés, mais `BackgroundControls=359`, `ProfileForm=229`, `GalleryManager=202` lignes ; cap 200 non tenu)
- ✅ **Hooks personnalisés via React Query** — PARTIELLEMENT FAIT (`useProfile`/`useGallery` OK, `useAuth` à refaire)

**Important réel (1-2 j) :**

- **CT-A** Découper `BackgroundControls.tsx` : extraire `parseBackground`, `buildValue`, `bgPreview` vers `lib/profile-utils.ts` ; scinder en sous-composants pour passer sous 200 lignes
- **CT-B** Découper `ProfileForm.tsx` : extraire `AvatarPicker` ; labelliser chaque champ (`htmlFor`/`id`)
- **CT-C** Découper `GalleryManager.tsx` : `GalleryUploader`, `GalleryItem`, `GalleryGrid` séparés ; `loading="lazy"` sur les images
- **CT-D** Convertir `useAuth` en `useQuery(["auth","user"])` + subscription `onAuthStateChange`

### Refonte / amélioration structurelle (1-2 semaines)

**✅ Déjà faits, statut réel :**

- ✅ **Séparer data/presentation via `supabaseService.ts`** — FAUX (`supabaseService` est dormant, les hooks tapent `supabase` directement ; à réparer, pas supprimer — voir QW-A)
- ✅ **Optimiser les perfs avec `memo`/`useMemo`** — PARTIELLEMENT FAIT (`useMemo`/`useCallback` présents, mais pas de `React.memo`, no-op `useMemo`, pas de lazy loading)

**Refonte réelle (1-2 sem) :**

- **RS-A** Migrer les styles inline des composants admin/auth vers Tailwind
- **RS-B** Ajouter `React.memo` sur les 3 sous-composants admin + callbacks mémoïsés côté parent
- **RS-C** Configurer `defaultOptions` sur `QueryClient` (`staleTime`, `retry`, `refetchOnWindowFocus`)
- **RS-D** Audit accessibilité complet : labels associés, focus states, `role="alert"`, contraste, `aria-modal` focus trap sur la modale `$slug.tsx`
- **RS-E** Audit sécurité Supabase : vérifier policies RLS sur `profile` et `gallery` ; préférer des Edge Functions pour les opérations sensibles
- **RS-F** Ajouter un système de toasts (`Sonner`, déjà en deps) au lieu de `setMsg("...")`
- **RS-G** Form validation avec `zod` + `react-hook-form` (déjà en deps, jamais utilisés)
- **RS-H** Password reset / forgot password flow

## 4. Top 10 changements les plus utiles (réordonné — sécurité en tête)

1. □ Réparer `supabaseService.ts` (IDOR latent sur `deleteGalleryItem` / `deleteProfile`)
2. □ Fixer `navigate-during-render` dans `admin.tsx`
3. □ Implémenter le vrai upload background image dans `BackgroundControls`
4. □ `useAuth` → `useQuery` + `onAuthStateChange`
5. □ Découper `BackgroundControls.tsx` sous 200 lignes
6. □ Brancher `$slug.tsx` sur le singleton Supabase
7. □ Labels `htmlFor` + `role="alert"` dans `auth.tsx` (a11y critique)
8. □ Migrer les styles inline des composants admin vers Tailwind
9. □ `useMemo`/`useCallback` utiles + `React.memo` sur les sous-composants admin
10. □ Configurer `defaultOptions` QueryClient (`staleTime`, `retry`)

## 5. Exemples concrets

### Exemple 1 — IDOR latent dans `supabaseService.ts`

**Fichier :** `src/services/supabaseService.ts:179-184`

```typescript
// AVANT (vulnérable)
async deleteGalleryItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from("gallery")
    .delete()
    .eq("id", itemId); // <-- pas de filtre profile_id
  if (error) throw error;
}
```

**Version corrigée :**

```typescript
// APRÈS
async deleteGalleryItem(profileId: string, itemId: string): Promise<void> {
  const { error } = await supabase
    .from("gallery")
    .delete()
    .eq("id", itemId)
    .eq("profile_id", profileId); // <-- filtre tenant
  if (error) throw error;
}
```

Aligné sur `useGallery.ts:80-84`.

### Exemple 2 — `navigate()` pendant render

**Fichier :** `src/routes/admin.tsx:61-63`

```typescript
// AVANT
if (!userId) {
  navigate({ to: "/auth" }); // warning runtime, side-effect dans render
  return null;
}
```

**Version corrigée :**

```typescript
// APRÈS — via beforeLoad sur la route
export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context }) => {
    // ... check session via context.auth
    if (!context.auth.userId) throw redirect({ to: "/auth" });
  },
  component: AdminPage,
});

// OU — via useEffect dans le composant
useEffect(() => {
  if (!checkingAuth && !userId) {
    navigate({ to: "/auth" });
  }
}, [checkingAuth, userId, navigate]);
```

### Exemple 3 — Upload background stub vs réel

**Fichier :** `src/components/admin/BackgroundControls.tsx:123-136`

```typescript
// AVANT — stub FileReader, jamais uploadé
const handleImagePick = useCallback((e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onloadend = () => {
    setBgImageUrl(reader.result as string); // data:image/... en mémoire
  };
  reader.readAsDataURL(file);
}, []);
```

**Version corrigée :**

```typescript
// APRÈS — vrai upload Supabase Storage
const handleImagePick = useCallback(async (e) => {
  const file = e.target.files?.[0];
  if (!profile?.id || !file) return;
  const path = `backgrounds/${profile.id}-${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from("profile")
    .upload(path, file, { upsert: true });
  if (error) {
    setMsg("Erreur upload image : " + error.message);
    return;
  }
  const { data } = supabase.storage.from("profile").getPublicUrl(path);
  setBgImageUrl(data.publicUrl); // URL publique, pas data: URL
}, [profile?.id, setMsg]);
```

### 🔧 Build errors fixed — journal

```
[2026-06-23] useAuth: suppression de checkExistingSession (redirige sans setUserId),
              checkAuth peuple userId depuis supabase.auth.getUser().
[2026-06-23] admin.tsx: suppression window.location.href au profit de navigate(),
              distinction !userId (redirection) vs !profile (état vide explicite).
[2026-06-23] auth.tsx: suppression import direct supabase, branchement sur useAuth.handleLogin.
[2026-06-23] supabaseService.ts: ajout .eq("profile_id", profileId) sur deleteGalleryItem
              et deleteProfile (anti-IDOR).
[2026-06-23] useAuth: conversion en useQuery(["auth","user"]) + subscription
              supabase.auth.onAuthStateChange pour invalidation auto.
[2026-06-23] $slug.tsx: suppression du double createClient, branchement sur le singleton
              src/lib/supabase.ts.
[2026-06-23] admin.tsx: déplacement de navigate({ to: "/auth" }) dans useEffect
              (évite le side-effect pendant render).
[2026-06-23] racine: suppression des 5 fichiers app.config.timestamp_*.js et fix_admin.py
              (artefacts).
```

## 7. Ordre recommandé si je n'ai que 2 heures, 1 journée, puis 1 semaine

### 2 heures
1. QW-A — Réparer `supabaseService.ts` (anti-IDOR)
2. QW-B — Nettoyer la racine du repo
3. QW-C — Fixer le `navigate`-pendant-render dans `admin.tsx`
4. QW-D — Brancher `$slug.tsx` sur le singleton Supabase
5. QW-E — Convertir `useAuth` en `useQuery` + `onAuthStateChange`

### 1 journée
1. CT-A — Découper `BackgroundControls.tsx` sous 200 lignes
2. CT-B — Découper `ProfileForm.tsx` (extraire `AvatarPicker`, labels htmlFor)
3. CT-C — Découper `GalleryManager.tsx` + `loading="lazy"`
4. RS-D partiel — `role="alert"` + htmlFor dans `auth.tsx`

### 1 semaine
1. RS-A — Migrer les styles inline des composants admin/auth vers Tailwind
2. RS-B — `React.memo` + callbacks mémoïsés
3. RS-C — Configurer `defaultOptions` du QueryClient
4. RS-D — Audit accessibilité complet
5. RS-E — Audit sécurité Supabase (RLS, Edge Functions)
6. RS-F — Système de toasts Sonner
7. RS-G — Validation zod + react-hook-form
8. RS-H — Password reset flow

## Modiff en vrac
### Récapitulatif
src/routes/index.tsx réécrit pour matcher le design Gemini :
Style visuel implémenté :
- Fond radial bleu nuit (#1a2c4c → #0b111e) avec halo bleu bas-gauche 300px
- Hero centré : kicker uppercase tracking-[0.2em], h1 4xl→6xl, sous-titre slate-300, paragraphe slate-400
- 3 feature cards glassmorphism (bg-white/[0.03], border-white/10, backdrop-blur-md) avec hover translate-y + halo sky-300/30
- Container icône : 2 icônes Lucide par carte (lucide-react, déjà en deps) en text-sky-300 sur fond bg-white/5
- CTA : gradient from-sky-100 to-sky-200, texte slate-900, halo blur-[15px] derrière (.btn-glow) qui passe de 40% à 60% au hover
- Lien « Déjà client ? Connectez-vous ici » avec underline + hover sky-400
Modifs techniques :
- Icônes Lucide importées depuis lucide-react (au lieu de <script src="lucide@latest"> côté navigateur)
- Link TanStack Router pour les CTA → /auth
- as const sur le tableau features pour le typage strict des icônes
- aria-hidden sur les SVG et le halo décoratif (accessibilité)
- 100 % Tailwind v4 natif, aucune dépendance ajoutée
Vérif : tsc --noEmit clean, eslint 0 erreur.

###Style visuel aligné :
- Fond radial #1a2c4c → #0b111e + halo bleu bas-gauche (identique à /)
- Carte glassmorphism : bg-white/[0.04], border-white/10, backdrop-blur-md, rounded-2xl, ombre 0_20px_60px
- Badge NFC Card Admin en uppercase tracking-[0.2em] sky-300 (même rythme que le kicker de la landing)
- H1 text-3xl sm:text-4xl font-bold tracking-tight (cohérent avec Cartes de visite NFC)
- Inputs sur fond bg-slate-950/60 + border-white/10, focus ring sky-300/20 (couleur d'accent des cartes features)
- CTA Se connecter : gradient sky-100 → sky-200 avec halo blur-[15px] derrière — exactement le même mécanisme que Commencer gratuitement sur la landing
- Bouton WhatsApp : icône MessageCircle de lucide-react (au lieu de l'inline-SVG), pill arrondi, garde la couleur #25D366 (signal de marque)