# Plan d'amélioration du projet NFC Card

_Dernière revue : 2026-06-23 — passe 3 (revue exhaustive)._

## 1. Résumé global

**Forces :**
- Stack technique moderne : React 19, TanStack Router + Query v5, Supabase, Tailwind v4, shadcn/ui.
- Types centralisés dans `src/types/profile.ts` — `ProfileData` et `GalleryItem` réutilisés partout.
- Hooks personnalisés propres : `useAuth` (useQuery + onAuthStateChange), `useProfile`, `useGallery`, `useBackgroundUploader`.
- Décomposition `admin.tsx` → 3 sous-composants, `BackgroundControls` → 4 sous-composants mémoïsés.
- Upload réel Supabase Storage (avatars, gallery, backgrounds) — plus de stubs.
- `router.tsx` configuré avec `defaultOptions` (staleTime 30s, retry 1, refetchOnWindowFocus).
- CSS de qualité : OKLCH, glassmorphism, dark mode, `prefers-reduced-motion`.
- Auth clean : `useAuth` synchro `onAuthStateChange`, invalidation auto des queries profile/gallery.

**Faiblesses :**
- `$slug.tsx` (526 lignes) monolithique : carrousel + modale + SVG dupliqués + navigation slide/modal dupliquée.
- `admin.tsx` fuit `err.message` PostgREST en 5 endroits (info leakage).
- `supabaseService.ts` (194 lignes) complètement dormant — hooks tapent `supabase` directement.
- `ProfileForm.tsx` mute `Object.assign(profile, draft)` — anti-pattern React.
- `useProfile`/`useGallery` utilisent `isLoading` (deprecated v5) au lieu de `isPending`.
- `BackgroundControls.tsx` utilise des `style={{}}` massifs au lieu de Tailwind.
- Pas de validation formulaire (`zod` + `react-hook-form` installés mais jamais utilisés).
- Pas de password reset.
- Pas de security headers (`vercel.json`), `.env` commité.

**Risques :**
- **Sécurité** : `admin.tsx` expose des erreurs PostgREST brutes contenant des noms de tables/colonnes. `.env` tracké par git.
- **Maintenabilité** : 194 lignes de code mort dans `supabaseService.ts`. 526 lignes monolithiques dans `$slug.tsx`.
- **UX** : Modale `$slug.tsx` sans focus trap (a11y). Bouton delete galerie visible uniquement au hover (mobile incompatible).

---

## 2. Problèmes détectés

### Architecture

| # | Fichier | Lignes | Problème | Impact | Correction |
|---|---------|--------|----------|--------|------------|
| A1 | `src/services/supabaseService.ts` | 1-194 | **Code mort** : jamais importé, duplique `useProfile`/`useGallery` | Élevé | Supprimer ou refondre les hooks pour l'utiliser |
| A2 | `src/routes/$slug.tsx` | 67-526 | **Monolithique** : 526 lignes, carrousel + modale + 8 fonctions + SVG inline ×4 | Élevé | Extraire `GalleryCarousel`, `GalleryModal`, `InstagramIcon`, `TikTokIcon` en composants séparés |
| A3 | `src/routes/$slug.tsx` | 180-194 | **Code dupliqué** : `goToPreviousSlide`/`goToNextSlide`/`goToPreviousModal`/`goToNextModal` identiques | Moyen | Fonction partagée `navigateSlide` avec paramètre direction + contexte |
| A4 | `src/components/admin/ProfileForm.tsx` | 78 | **Mutation de props** : `Object.assign(profile, draft)` — anti-pattern React qui modifie l'objet parent | Élevé | Passer les modifications dans `onSave()` au lieu de muter |
| A5 | `src/lib/profile-utils.ts` | 54-84 | **90% duplication** : `buildBackgroundValue` et `buildBackgroundPreview` quasi-identiques | Moyen | Consolider avec un paramètre `fallback` |

### Sécurité

| # | Fichier | Lignes | Problème | Impact | Correction |
|---|---------|--------|----------|--------|------------|
| S1 | `src/routes/admin.tsx` | 109, 119, 130, 140, 154 | **Fuite d'infos** : `err.message` PostgREST affiché à l'utilisateur (noms de tables, colonnes) | Critique | Créer `toUserMessage(err)` qui mappe les erreurs vers des messages safe |
| S2 | `.env` | 1-2 | **Tracké par git** : `.env` commité avec clés Supabase | Moyen | `git rm --cached .env`, ajouter à `.gitignore`, documenter dans `.env.example` |
| S3 | `vercel.json` | 1-8 | **Headers manquants** : pas de CSP, X-Content-Type-Options, Referrer-Policy | Faible | Ajouter `headers` dans `vercel.json` |
| S4 | `src/routes/$slug.tsx` | 110, 125 | **Logs navigateur** : `console.error` expose erreurs Supabase au client | Faible | Remplacer par logger silencieux ou centralisé |
| S5 | `eslint.config.js` | 36 | **Règle désactivée** : `@typescript-eslint/no-unused-vars: "off"` | Faible | Réactiver ou configurer avec `argsIgnorePattern: "^_"` |

### UX / Accessibilité

| # | Fichier | Lignes | Problème | Impact | Correction |
|---|---------|--------|----------|--------|------------|
| U1 | `src/routes/$slug.tsx` | 431-515 | **Pas de focus trap** dans la modale galerie | Moyen | Ajouter focus trap manuel ou utiliser `focus-trap-react` |
| U2 | `src/components/admin/GalleryManager.tsx` | 90-97 | **Delete hover-only** : `group-hover/item:opacity-100` — invisible sur mobile/tactile | Moyen | Afficher toujours un indicateur + `opacity-70` en permanence |
| U3 | `src/routes/index.tsx` | 15-20 | **Meta SEO pauvres** : description faible, pas d'Open Graph complet | Faible | Améliorer meta avec `og:image`, `og:url`, `twitter:card` |
| U4 | `index.html` | - | **Meta vides** : titre "Personal Profile", pas de favicon, pas d'OG tags | Faible | Ajouter favicon, meta description, Open Graph |
| U5 | `src/components/admin/ProfileForm.tsx` | 176 | **String matching fragile** : `msg.toLowerCase().includes("erreur")` pour la couleur | Faible | Utiliser un flag `isError` explicite |

### Maintenabilité

| # | Fichier | Lignes | Problème | Impact | Correction |
|---|---------|--------|----------|--------|------------|
| M1 | `src/services/supabaseService.ts` | 1-194 | Code mort complet | Élevé | Supprimer (les hooks font tout) |
| M2 | `src/routes/$slug.tsx` | 388-498 | SVG icons dupliqués ×4 + SVG chevron ×2 | Moyen | Extraire en composants `ChevronLeft`, `ChevronRight`, `CloseIcon` |
| M3 | `src/hooks/useProfile.ts` | 11, 131 | `isLoading` déprécié depuis TanStack Query v5 | Faible | Renommer en `isPending` |
| M4 | `src/hooks/useGallery.ts` | 11, 95 | `isLoading` déprécié | Faible | Renommer en `isPending` |
| M5 | `eslint.config.js` | 13 | `ecmaVersion: 2020` alors que `tsconfig` cible `ES2022` | Faible | Mettre à jour vers `2022` |
| M6 | `tsconfig.json` | 19-20 | `noUnusedLocals: false` + `noUnusedParameters: false` | Faible | Passer à `true` (ESLint devrait compenser mais règle désactivée) |

### Performance

| # | Fichier | Lignes | Problème | Impact | Correction |
|---|---------|--------|----------|--------|------------|
| P1 | `src/components/admin/BackgroundControls.tsx` | 83-91 | 5 `setState` séparés dans 1 `useEffect` | Faible | Remplacer par 1 appel `setState(state => ({...state, ...next}))` |
| P2 | `src/hooks/useAuth.ts` | 51-52 | `invalidateQueries(["profile"])` même si pas de profile chargé | Faible | Vérifier si queryKey existe avant invalidation |

### Qualité Produit

| # | Fichier | Lignes | Problème | Impact | Correction |
|---|---------|--------|----------|--------|------------|
| Q1 | `src/components/admin/BackgroundControls.tsx` | 25-54, 121-196 | **Styles inline** massifs au lieu de Tailwind — incohérent avec le reste de l'app (auth, landing, admin header) | Moyen | Migrer vers des classes Tailwind |
| Q2 | `src/routes/admin.tsx` | 64 | **`setMsg` pattern** : force re-render des enfants, pas de toast moderne | Moyen | Remplacer par `sonner` toast (déjà en dépendances) |
| Q3 | `src/routes/auth.tsx` | 46 | **`noValidate`** sans fallback JS de validation | Faible | Ajouter validation avec `zod` + `react-hook-form` |
| Q4 | `src/lib/api/example.functions.ts` | 1-22 | Fichier example qui ressemble à du code prod | Faible | Supprimer ou déplacer dans un dossier `_examples/` |

---

## 3. Plan d'action priorisé

### Quick wins (1-2 heures)

| # | Action | Fichier(s) | Effort |
|---|--------|------------|--------|
| QW-1 | ✅ **Créer `toUserMessage(err)`** pour masquer les erreurs PostgREST dans `admin.tsx` | `src/lib/error-message.ts` + `src/routes/admin.tsx` | 15 min |
| QW-2 | ✅ **Renommer `isLoading` → `isPending`** dans `useProfile.ts` et `useGallery.ts` | `useProfile.ts`, `useGallery.ts`, `admin.tsx` | 5 min |
| QW-3 | ✅ **Fixer `ecmaVersion: 2022`** dans `eslint.config.js` | `eslint.config.js` | 2 min |
| QW-4 | ✅ **Supprimer `src/lib/api/example.functions.ts`** | `src/lib/api/example.functions.ts` | 2 min |
| QW-5 | ✅ **Ajouter favicon** dans `index.html` | `index.html` + `public/favicon.svg` | 5 min |
| QW-6 | ✅ **Extraire SVGs** en composants dans `$slug.tsx` | `$slug.tsx` | 15 min |
| QW-7 | ✅ **Fusionner `goToPreviousSlide`/`goToNextSlide`/`goToPreviousModal`/`goToNextModal`** en fonctions réutilisables | `$slug.tsx` | 10 min |

### Important à court terme (1-2 jours)

| # | Action | Fichier(s) | Effort |
|---|--------|------------|--------|
| CT-1 | ✅ **Refondre `$slug.tsx`** : extraire `GalleryCarousel`, `GalleryModal`, icônes | `$slug.tsx` → `components/public/` | 3-4 h |
| CT-2 | ✅ **Remplacer `setMsg` par `sonner` toasts** dans `admin.tsx` et ses enfants | `admin.tsx`, `ProfileForm`, `GalleryManager`, `BackgroundControls` | 1-2 h |
| CT-3 | ✅ **Supprimer `supabaseService.ts`** (code mort) | `src/services/supabaseService.ts` | 5 min |
| CT-4 | ✅ **Fixer `Object.assign(profile, draft)`** dans `ProfileForm.tsx` | `ProfileForm.tsx:78` | 15 min |
| CT-5 | ✅ **Ajouter focus trap** à la modale `$slug.tsx` | `$slug.tsx` | 1 h |
| CT-6 | ✅ **Rendre bouton delete galerie visible** sur mobile | `GalleryManager.tsx` | 10 min |
| CT-7 | ✅ **Ajouter `.env` à `.gitignore`** + creer `.env.example` | `.gitignore`, `.env.example` | 5 min |

### Refonte / amélioration structurelle (1-2 semaines)

| # | Action | Fichier(s) | Effort |
|---|--------|------------|--------|
| RS-1 | **Migrer styles inline `BackgroundControls`** vers Tailwind | `BackgroundControls.tsx` | 2 h |
| RS-2 | **Ajouter validation formulaires** avec `zod` + `react-hook-form` | `auth.tsx`, `ProfileForm.tsx` | 2-3 h |
| RS-3 | **Ajouter headers de sécurité** dans `vercel.json` | `vercel.json` | 30 min |
| RS-4 | **Améliorer SEO/meta** : OG tags, meta description, Twitter card | `index.html`, `__root.tsx`, `index.tsx`, `$slug.tsx` | 1 h |
| RS-5 | **Ajouter password reset** (route + flow Supabase) | `auth.tsx`, nouvelle route | 2 h |
| RS-6 | **Consolider `buildBackgroundValue`/`buildBackgroundPreview`** | `profile-utils.ts:54-84` | 15 min |
| RS-7 | **Réactiver `no-unused-vars`** dans ESLint + `noUnusedLocals`/`noUnusedParameters` dans tsconfig | `eslint.config.js`, `tsconfig.json` | 30 min |
| RS-8 | **Réduire `setState` dans `BackgroundControls.useEffect`** | `BackgroundControls.tsx:83-91` | 10 min |

---

## 4. Top 10 changements les plus utiles

| # | Changement | Impact | Effort |
|---|-----------|--------|--------|
| 1 | ✅ **Créer `toUserMessage()` helper + brancher dans `admin.tsx`** (QW-1) | Sécurité — stop fuite infos PostgREST | 15 min |
| 2 | ✅ **Extraire composants de `$slug.tsx`** (CT-1) | Maintenabilité — divise 526 lignes en modules | 3-4 h |
| 3 | ✅ **Remplacer `setMsg` par `sonner` toasts** (CT-2) | UX — toasts modernes, moins de re-renders | 1-2 h |
| 4 | ✅ **Supprimer `supabaseService.ts`** (CT-3) | Architecture — -194 lignes de code mort | 5 min |
| 5 | ✅ **Fixer `Object.assign(profile, draft)`** (CT-4) | Correctness — stop mutation de props | 15 min |
| 6 | ✅ **Ajouter focus trap modale** (CT-5) | A11y — navigation clavier complète | 1 h |
| 7 | ✅ **Ajouter `.env` à `.gitignore`** (CT-7) | Sécurité — éviter fuite future de secrets | 5 min |
| 8 | **Migrer styles inline `BackgroundControls` → Tailwind** (RS-1) | Consistance visuelle | 2 h |
| 9 | ✅ **Extraire SVGs + fusionner fonctions navigation** (QW-6 + QW-7) | Maintenabilité — -40 lignes dupliquées | 25 min |
| 10 | **Ajouter headers de sécurité** (RS-3) | Sécurité — CSP, XSS protection | 30 min |

---

## 5. Exemples concrets

### Exemple 1 — Fuite d'erreurs PostgREST (CRITICAL)

**Fichier :** `src/routes/admin.tsx:109, 119, 130, 140, 154`

```typescript
// AVANT — fuite d'information
} catch (err) {
  setMsg("Erreur : " + (err instanceof Error ? err.message : String(err)));
}

// APRÈS — message safe
function toUserMessage(err: unknown): string {
  const postgrestErrorMsg = err && typeof err === "object" && "code" in err
    ? "Erreur lors de la sauvegarde. Veuillez réessayer."
    : undefined;
  return postgrestErrorMsg ?? "Une erreur est survenue.";
}

// Dans admin.tsx :
} catch (err) {
  console.error("Erreur admin:", err); // log détaillé côté dev
  toast.error(toUserMessage(err));     // message safe pour l'utilisateur
}
```

### Exemple 2 — Mutation de props dans ProfileForm

**Fichier :** `src/components/admin/ProfileForm.tsx:78`

```typescript
// AVANT — mutation directe de la prop `profile`
const handleSave = useCallback(async () => {
  setMsg("");
  Object.assign(profile, draft);  // <-- mute l'objet reçu en props !
  await onSave();
}, [draft, onSave, profile, setMsg]);

// APRÈS — pas de mutation, onSave reçoit les données
const handleSave = useCallback(async () => {
  setMsg("");
  await onSave();  // onSave() lit profile via le hook parent
}, [onSave, setMsg]);
```

### Exemple 3 — SVG dupliqués dans $slug.tsx

**Fichier :** `src/routes/$slug.tsx:388-498`

```typescript
// AVANT — 4 copies du même SVG chevron
<svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="h-4 w-4">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
</svg>
// ... répété ×2 pour carrousel + ×2 pour modale

// APRÈS — composants partagés
const ChevronLeft = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevronRight = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
```

### Exemple 4 — Fonctions de navigation dupliquées

**Fichier :** `src/routes/$slug.tsx:180-194`

```typescript
// AVANT — 4 fonctions quasi-identiques
const goToPreviousSlide = () => { setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length); };
const goToNextSlide = () => { setCurrentIndex((prev) => (prev + 1) % gallery.length); };
const goToPreviousModal = () => { setModalIndex((prev) => (prev - 1 + gallery.length) % gallery.length); };
const goToNextModal = () => { setModalIndex((prev) => (prev + 1) % gallery.length); };

// APRÈS — 2 fonctions génériques
const navigateSlide = (dir: -1 | 1) =>
  setCurrentIndex((prev) => (prev + dir + gallery.length) % gallery.length);
const navigateModal = (dir: -1 | 1) =>
  setModalIndex((prev) => (prev + dir + gallery.length) % gallery.length);
```

---

## 6. Référence

Ce plan suit les critères définis dans `AGENTS.md` :
- **Architecture** : séparation des responsabilités, modularité, pas de duplication.
- **Sécurité** : IDOR, fuite d'infos, headers, `.env` tracking.
- **Maintenabilité** : taille des fichiers, nommage, TypeScript, code mort.
- **UX** : accessibilité, feedback utilisateur, responsive, toasts.
- **Performance** : renders inutiles, lazy loading, memoization.
- **Qualité Produit** : incohérence visuelle, éléments non finis.
