# ❓ QUESTIONS OUVERTES & DÉCISIONS CLÉS — ManhwaVerse
> Le document à remplir avant de coder la première ligne

---

## 🎯 Pourquoi ce document existe

Chaque heure passée à coder une feature basée sur une hypothèse non-validée est une heure potentiellement perdue. Ce document centralise toutes les décisions importantes à prendre — idéalement avec des données, au minimum avec un raisonnement clair.

**Statuts :** ✅ Décidé | 🔄 En réflexion | ❓ Ouvert | ⛔ Écarté

---

## 🏷️ IDENTITÉ DU PROJET

### Q1 : Quel est le nom final ?
**Statut :** ❓ Ouvert

**Options identifiées :**
- ManhwaVerse — évocateur, disponibilité à vérifier
- ManhwaBox — référence directe à Letterboxd
- ManhwaList — simple, SEO-friendly
- ManhwaDB — plus technique, moins sexy
- WToonDB — couvre webtoon + manhwa
- Lectorat — nom français original, distinguant

**Critères de choix :**
- Disponibilité domaine `.com` (prioritaire)
- Mémorable, prononçable en FR et EN
- Pas de trademark existant
- URL courte (< 12 caractères idéalement)

**Action requise :** Vérifier la disponibilité de chaque option sur Namecheap + Google Trademark Search.

---

### Q2 : Quelle est la tagline ?
**Statut :** ❓ Ouvert

**Options :**
- "Track. Discover. Share." (générique mais clair)
- "Your manhwa universe, mapped." 
- "The place where manhwa readers live."
- "Read more. Read better." 
- "The definitive manhwa companion."

---

### Q3 : Quel est le scope exact — Manhwa seulement ou Manhwa + Manga + Manhua ?
**Statut :** 🔄 En réflexion

**Arguments pour Manhwa uniquement :**
- Différenciation forte vs MyAnimeList / AniList
- Moins de contenu à gérer au lancement
- Community plus ciblée et engagée
- SEO plus précis

**Arguments pour élargir :**
- Plus de trafic potentiel
- Les lecteurs lisent souvent les trois (manhwa, manga, manhua)
- Risque de perdre des users qui veulent tout tracker au même endroit

**Recommandation :** Manhwa + Manhua au lancement (même format vertical, cultures proches). Manga en Phase 3 si la demande est forte.

---

## 🛠️ PRODUIT

### Q4 : Faut-il un reader intégré dès le lancement ?
**Statut :** ⛔ Écarté (Phase 1)
**Raison :** Complexité légale et technique disproportionnée. On reste tracker + communauté.

---

### Q5 : Comment gérer les spoilers dans les reviews ?
**Statut :** 🔄 En réflexion

**Options :**
- A) Tag #spoiler obligatoire, blur automatique du texte
- B) Champ séparé "Review sans spoiler / Review avec spoiler"
- C) Système de toggle : l'utilisateur choisit s'il veut voir les spoilers

**Recommandation :** Option C — toggle global dans les préférences + tag par review. C'est le standard le plus respectueux.

---

### Q6 : Quel système de notation ?
**Statut :** 🔄 En réflexion

**Options :**
- /10 avec demi-points (comme AniList) — précis
- /5 étoiles (comme Letterboxd) — simple et reconnu
- /100 — trop granulaire
- Like/Dislike simple (comme YouTube) — peu informatif

**Recommandation :** /10 avec demi-points. Le lectorat manhwa vient souvent d'AniList, c'est leur système de référence.

---

### Q7 : Contenu UGC — FR/EN séparés ou mélangés ?
**Statut :** ❓ Ouvert

**Option A :** Tout mélangé, badge de langue sur chaque review
**Option B :** Tabs FR / EN sur chaque fiche
**Option C :** Interface en langue choisie, reviews filtrées par langue par défaut mais option "voir toutes les langues"

**Recommandation :** Option C — experience localisée par défaut, ouverture possible.

---

### Q8 : Quel est le modèle de modération au lancement ?
**Statut :** ❓ Ouvert

**Niveaux :**
1. Signalement communautaire uniquement (zéro modération active)
2. Toi comme modérateur + signalement
3. 2-3 modérateurs bénévoles + signalement + IA

**Recommandation :** Option 2 au lancement. Recruter des modérateurs bénévoles dès 5k users actifs. Claude API pour modération automatique des contenus évidents (haine, spam) dès la Phase 2.

---

## 💰 BUSINESS

### Q9 : Prix du Premium ?
**Statut :** ❓ Ouvert

**Références marché :**
- AniList : Gratuit (donation)
- MyAnimeList Premium : 5$/mois
- Letterboxd Pro : 4$/mois
- Crunchyroll : 8$/mois

**Options :**
- 3.99€/mois ou 29.99€/an
- 4.99€/mois ou 39.99€/an
- 6.99€/mois ou 49.99€/an

**Recommandation :** 4.99€/mois | 39.99€/an (2 mois offerts). Dans la moyenne haute du marché, justifié par la qualité de l'expérience.

---

### Q10 : Quand lancer le Premium ?
**Statut :** ❓ Ouvert

**Options :**
- Dès la Phase 1 (monétiser tôt)
- Phase 2 (quand les features premium existent vraiment)
- Phase 3 (quand la communauté est assez grande pour convertir)

**Recommandation :** Phase 2 — lancer le Premium quand les features qui le justifient existent (Taste Cards, stats avancées, alertes intelligentes). Lancer trop tôt avec peu de valeur = mauvaise réputation.

---

### Q11 : Facturer la TVA ?
**Statut :** ❓ Ouvert

**Si cible internationale dès le début :** Utiliser Paddle ou Lemon Squeezy (gèrent la TVA mondiale automatiquement). Ne pas utiliser Stripe directement à moins d'avoir une solution TVA propre.

---

## 🚀 LANCEMENT

### Q12 : Soft launch ou hard launch ?
**Statut :** 🔄 En réflexion

**Recommandation :** Soft launch invite-only 2-3 semaines pour les membres Discord/waitlist → correction des bugs critiques → hard launch public avec communication maximale.

---

### Q13 : Lancer sur Product Hunt ?
**Statut :** ❓ Ouvert

**Pour :**
- Trafic qualifié instantané (tech-savvy early adopters)
- Backlink de qualité
- Crédibilité "produit sérieux"

**Contre :**
- Nécessite une préparation importante (media kit, supporters prêts à upvoter)
- Si le lancement PH rate (< top 10), c'est peu utile

**Recommandation :** Oui, mais préparer le launch PH séparément du lancement principal. Ne pas mettre tous les oeufs dans le même panier.

---

### Q14 : Quel est le "magic moment" du produit — quand un nouvel utilisateur comprend la valeur ?
**Statut :** ❓ Ouvert (crucial à identifier)

**Hypothèse :** Le magic moment se produit quand un utilisateur :
1. Ajoute 5+ manhwas à sa bibliothèque
2. Et reçoit sa première recommandation personnalisée pertinente

**Action :** Mesurer ce funnel dès le lancement. Si les users drop avant d'atteindre 5 titres en bibliothèque → problème d'onboarding à corriger en priorité.

---

## 🔧 TECHNIQUE

### Q15 : AniList API ou scraping pour la base de données initiale ?
**Statut :** ✅ Décidé
**Décision :** AniList API pour le bootstrap initial (gratuit, légal, riche), enrichissement manuel ensuite pour les top 500 titres les plus populaires.

---

### Q16 : Meilisearch ou Algolia pour la recherche ?
**Statut :** 🔄 En réflexion

| | Meilisearch | Algolia |
|---|---|---|
| Coût | ~5$/mois (self-hosted Railway) | 0$ jusqu'à 10k req/mois, puis cher |
| Setup | Plus complexe | Plus simple |
| Features | Suffisant pour nos besoins | Plus avancé |
| Contrôle | Total | Limité |

**Recommandation :** Meilisearch sur Railway. Plus économique à l'échelle, et le contrôle total sur les données est important.

---

### Q17 : Comment gérer les images (covers) à l'échelle ?
**Statut :** ✅ Décidé
**Décision :** Cloudflare Images (stockage + transformation à la volée) + Next.js Image component. Budget : ~5-20$/mois selon le volume.

---

### Q18 : RGPD — Quelles données collecter et comment les protéger ?
**Statut :** ❓ Ouvert (nécessite attention avant lancement FR)

**Données collectées :**
- Email (auth)
- Historique de lecture (fonctionnel)
- IP (logs serveur, non stockée en DB)
- Préférences de notification

**Actions requises :**
- Page Privacy Policy claire
- Consentement cookies (obligatoire EU)
- Droit à l'effacement (delete account = delete all data)
- Pas de vente de données (jamais)

---

## 📋 CHECKLIST DÉCISIONS PRIORITAIRES

Avant de commencer le dev :

- [ ] Nom de domaine choisi et acheté
- [ ] Structure légale clarifiée (auto-entrepreneur ?)
- [ ] Scope produit défini (manhwa seul ? + manhua ?)
- [ ] Système de notation choisi
- [ ] Politique de modération définie
- [ ] Stack technique validé
- [ ] Budget mensuel alloué (infra + outils)
- [ ] Planning lancement (soft → hard) daté
- [ ] Nom du Discord et canaux structurés
- [ ] Premier compte social créé

---

*Ce document est vivant. Chaque décision prise → changer le statut en ✅ avec la décision et la date.*
