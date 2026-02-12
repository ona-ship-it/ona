# Analyse du projet ONAGUI (etat actuel)

Date: 2026-02-11
Branche: main

## 1) Resume executif
Le projet couvre deja les flux principaux (giveaways, raffles, fundraise, marketplace, profils, analytics), avec un front riche et des APIs Supabase. Les gaps restants sont surtout:
- Donnees reelles manquantes dans plusieurs sections (profil public et landing).
- Cohabitation de deux tables de profil (`profiles` et `onagui_profiles`) sans synchro complete.
- Fonctionnalites critiques encore mockees ou TODO (escrow raffles, contenus profile feed, fundraise cards landing).
- Observabilite et tests limites (peu de tests, erreurs runtime masquees par `ignoreBuildErrors`).

## 2) Gaps fonctionnels (priorite haute)
1. **Profil public: sections encore mockees**
   - `live`, `history`, `popular`, `winners`, `fundraise` dans [src/app/profiles/ProfilePageClient.tsx](src/app/profiles/ProfilePageClient.tsx) utilisent des donnees statiques.
   - Manque: requetes reelles pour giveaways/raffles de ce createur, gagnants, vues, et causes soutenues.

2. **Landing page: marketplace + fundraise encore mockes**
   - TODO explicites dans [src/app/page.tsx](src/app/page.tsx).
   - Manque: brancher `fundraisers` et `marketplace_listings` (already done for marketplace list page, pas la landing).

3. **Escrow raffles**
   - TODO dans [src/app/raffles/create/page.tsx](src/app/raffles/create/page.tsx): paiement escrow pour non-admin.
   - Manque: logique on-chain / escrow et verification serveur.

## 3) Donnees et schema (priorite haute)
1. **Deux sources de profil**
   - `profiles` (socials, bio, avatar) et `onagui_profiles` (username, avatar, type) coexistent.
   - Profil public lit les deux mais il n y a pas de synchro complete.
   - Manque: trigger ou job pour maintenir `onagui_profiles` a jour depuis `profiles` (bio, socials, avatar, full_name).

2. **Commissions / ONAGUI subs**
   - Calcul fait a partir des tickets payants et du status giveaway.
   - Manque: source verifiee de payout (ex: table de paiements), et statut payout au lieu de `status == completed`.

3. **Followers**
   - Policies: insert + delete ok, read public.
   - Manque: index pour lookup rapide par `follower_id` si volume (actuellement idx_profile_followers_follower_id existe, ok).
   - Manque: prevention multi-insert client (unique PK ok), pas de rate limiting.

## 4) UX / Produit (priorite moyenne)
1. **Profil public**
   - Pas de route canonique type `/profiles/[id]` ou `/@username`.
   - Partage/SEO limite car tout est en client-side et query param `?id=`.

2. **Settings profile**
   - Sauvegarde par alert; UX basique (pas de toast).
   - Validation URL basique manquante (format/https).

3. **Follow UX**
   - Pas de confirmation visuelle persistante hors bouton.
   - Pas de compteur "following" visible dans stats (only followers).

## 5) Performance et qualite (priorite moyenne)
1. **Beaucoup de requetes cote client**
   - Landing et profils executent plusieurs requetes Supabase en client, ce qui impacte TTFB et UX mobile.
   - Manque: server components / API aggregation.

2. **Build safety**
   - `next.config.js` a `ignoreBuildErrors: true`.
   - Manque: verification types strictes + CI.

3. **Tests**
   - Tests e2e/playwright existe mais pas de suite active ni CI.

## 6) Observabilite / securite (priorite moyenne)
1. **API analytics**
   - Insert public ok, mais pas de rate limit / abuse protection.

2. **Donations / fundraise**
   - Logique donation client sans validation server forte.
   - Manque: verification transaction on-chain et reconciliation.

## 7) Checklist d actions proposees
Priorite immediate:
- Brancher data reelle pour profil (live/history/popular/winners/fundraise).
- Remplacer mocks marketplace/fundraise sur landing.
- Ajouter synchro `profiles` -> `onagui_profiles`.

Priorite suivante:
- Implementer escrow raffles.
- Crer routes publiques SEO pour profils.
- Ajouter verification backend pour donations.

Qualite:
- Retirer `ignoreBuildErrors`.
- Ajouter tests critiques (signup, giveaway entry, follow).

## 8) Notes techniques
- Les policies RLS `profile_followers` sont en place (insert/delete/read).
- Le `bio` est maintenant ajoute a `profiles` et la UI a un fallback si le schema cache n est pas a jour.

---
Si tu veux, je peux transformer cette analyse en plan d execution avec tickets et ordre de livraison.

## 9) Plan d execution (tickets)

### Phase 1 (P0 - critique)
1. **ONAGUI-001: Profil public - data reelle**
    - Objectif: remplacer les mocks des sections live/history/popular/winners/fundraise.
    - Taches:
       - Lier giveaways/raffles par `creator_id`.
       - Winners: requete gagnants + aggregation.
       - Fundraises soutenus: relation donations -> fundraisers.
    - Definition of done:
       - Aucune section mockee restante sur le profil public.

2. **ONAGUI-002: Landing - marketplace/fundraise data**
    - Objectif: remplacer les mocks landing.
    - Taches:
       - Brancher `marketplace_listings` et `fundraisers` dans la landing.
       - Fallback propre si pas de data.
    - Definition of done:
       - Landing 100% data reelle.

3. **ONAGUI-003: Sync profiles -> onagui_profiles**
    - Objectif: source unique fiable.
    - Taches:
       - Trigger SQL sur update `profiles` pour copier avatar/social/bio.
       - Backfill des donnees existantes.
    - Definition of done:
       - Les deux tables restent coherentes.

### Phase 2 (P1 - important)
4. **ONAGUI-004: Escrow raffles**
    - Objectif: completion du TODO escrow.
    - Taches:
       - Implementer paiement escrow non-admin.
       - Verification backend.
    - Definition of done:
       - Raffle create fonctionne en prod.

5. **ONAGUI-005: Routes profils SEO**
    - Objectif: profil public accessible via URL propre.
    - Taches:
       - `/@username` ou `/profiles/[id]`.
       - SSR ou prefetch pour meta tags.
    - Definition of done:
       - Pages indexables + partage social.

6. **ONAGUI-006: Verification donations**
    - Objectif: securiser les donations.
    - Taches:
       - Verifier tx on-chain cote API.
       - Reconciliation et statut.
    - Definition of done:
       - Donations non spoofables.

### Phase 3 (P2 - qualite)
7. **ONAGUI-007: Tests critiques**
    - Objectif: stabilite.
    - Taches:
       - Tests signup/login, giveaway entry, follow/unfollow.
    - Definition of done:
       - Suite Playwright en CI.

8. **ONAGUI-008: Build safety**
    - Objectif: supprimer `ignoreBuildErrors`.
    - Taches:
       - Fix types et activer check.
    - Definition of done:
       - Build fails on type errors.

### Estimation rapide
- Phase 1: 3-5 jours
- Phase 2: 5-8 jours
- Phase 3: 2-4 jours
