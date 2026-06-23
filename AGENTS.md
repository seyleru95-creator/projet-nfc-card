# Règles de Review pour le Projet NFC Card

## Rôle attendu des agents de review
Les agents doivent effectuer une analyse technique approfondie du projet, en se concentrant sur l'architecture, la sécurité, les performances, la maintenabilité et l'expérience utilisateur. Ils doivent fournir un diagnostic précis avant toute modification de code.

## Méthode d'analyse du repo
1. **Exploration initiale** : Examiner la structure du projet, les dépendances et la configuration
2. **Analyse par catégories** : Architecture, maintenabilité, sécurité, UX, performance, qualité produit
3. **Identification précise** : Citer les fichiers, fonctions et lignes spécifiques concernés
4. **Évaluation de l'impact** : Déterminer la sévérité et l'urgence de chaque problème
5. **Plan d'action priorisé** : Proposer des corrections avec un ordre d'implémentation logique

## Critères de review prioritaires

### Architecture
- Séparation claire des responsabilités (SoC)
- Modularité et faible couplage
- Évitement de la duplication de code
- Organisation logique des fichiers
- Utilisation appropriée des patterns de conception

### Maintenabilité
- Nommage explicite et cohérent
- Fonctions et composants de taille raisonnable
- Complexité cyclomatique maîtrisée
- Utilisation efficace des TypeScript
- Évitation du code mort et des commentaires obsolètes
- Lisibilité globale du code

### Sécurité
- Validation et sanitisation des entrées
- Protection contre les injections (XSS, SQL)
- Gestion sécurisée de l'authentification et des sessions
- Protection des variables d'environnement sensibles
- Configuration appropriée des headers de sécurité
- Politique de contenu security (CSP) si applicable
- Gestion sécurisée du stockage local
- Évitement de l'exposition de secrets en frontend

### Performance
- Évitement des renders inutiles
- Optimisation des requêtes réseau
- Chargement différé (lazy loading) lorsqu'approprié
- Utilisation de memoization (useMemo, useCallback)
- Optimisation du bundle size
- Gestion efficace de l'état
- Prévention des fuites de mémoire

### Expérience Utilisateur (UX)
- Clarté et cohérence de l'interface
- Feedback approprié pour les actions utilisateur
- Gestion correcte des états de chargement et d'erreur
- Accessibilité de base (ARIA, contraste, navigation clavier)
- Responsivité mobile
- Cohérence visuelle et adherence au design system
- Formulaires intuitifs avec validation en temps réel

### Qualité Produit
- Apparence professionnelle et finie
- Cohérence comportementale à travers l'application
- Éléments qui inspirent confiance (preuves sociales, sécurité)
- Absence d'éléments brouillons ou non finis
- Attention aux détails et micro-interactions

## Checks Sécurité
- [ ] Validation côté client ET serveur de toutes les entrées
- [ ] Utilisation de cookies HTTP-only pour les tokens d'auth (plutôt que localStorage)
- [ ] Échappement approprié du contenu dynamique pour prévenir XSS
- [ ] Vérification que les variables sensibles ne sont pas exposées en frontend
- [ ] Confirmation que les politiques RLS Supabase sont correctement configurées
- [ ] Analyse des dépendances pour détecter les vulnérabilités connues
- [ ] Vérification de la gestion des erreurs pour éviter la fuite d'informations sensibles
- [ ] Examination de la configuration CORS et des headers de sécurité

## Checks UX / Accessibilité
- [ ] Contraste suffisant selon les normes WCAG
- [ ] Navigation complète au clavier
- [ ] Labels associés aux champs de formulaire
- [ ] Messages d'erreur clairs et utiles
- [ ] États de chargement visibles
- [ ] Texte alternatif pour les images significatives
- [ ] Structure sémantique HTML appropriée
- [ ] Taille cible suffisante pour les éléments interactifs
- [ ] Respect des principes de conception responsive

## Checks Maintenabilité / Performance
- [ ] Aucun composant dépassant 200 lignes (idéalement < 100)
- [ ] Aucune fonction dépassant 50 lignes
- [ ] Utilisation de hooks personnalisés pour la logique réutilisable
- [ ] Évitation de la duplication de code (> similaire utilisé dans 2+ fichiers)
- [ ] Nommage cohérent et explicite
- [ ] Utilisation appropriée de TypeScript (éviter any excesif)
- [ ] Gestion d'état optimisée (éviter les re-renders inutiles)
- [ ] Utilisation de React.memo, useCallback, useMemo quand bénéfique
- [ ] Implémentation de lazy loading pour les images et composants lourds
- [ ] Séparation claire préoccupations (data access vs presentation)

## Format de restitution
Les agents DOIVENT produire :
1. Un résumé global concis (forces, faiblesses, risques)
2. Un tableau détaillé des problèmes détectés avec priorité, catégorie, fichiers, problème, impact et correction
3. Un plan d'action priorisé (quick wins, important à court terme, refonte structurelle)
4. Un top 10 des changements les plus utiles
5. Des exemples concrets de code problématique vs corrigé
6. Ce fichier AGENTS.md comme référence pour les futures revues

## Règles claires
1. **NE JAMAIS modifier le code avant d'avoir produit un diagnostic complet**
2. **TOUJOURS proposer un plan priorisé et citer les fichiers/lines spécifiques concernés**
3. **PRIVILEGIER les changements à fort impact plutôt que les micro-optimisations**
4. **SOYER HONNÊTE sur les niveaux de confiance lorsqu'il y a de l'incertitude**
5. **RECONNAÎTRE ce qui fonctionne bien en plus de pointer les problèmes**
6. **SE CONCENTRER sur les problèmes systémiques plutôt que les symptômes isolés**

## Adaptations spécifiques à ce repo
- Vérifier particulièrement la configuration Supabase et les politiques RLS
- Examiner l'utilisation de TanStack Query pour l'état serveur
- Évaluer la cohérence de l'utilisation de Tailwind vs styles en ligne
- Inspector la taille et la complexité des composants admin.tsx et $slug.tsx
- Évaluer l'opportunité d'extraire des hooks personnalisés pour la logique de données