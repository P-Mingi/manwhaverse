# 💰 STRATÉGIE DE MONÉTISATION — ManhwaVerse
> Business model complet · Revenus récurrents · Scalable solo

---

## 🧭 Vision Business

ManhwaVerse n'est pas un projet hobby — c'est un **media business**. Le modèle cible : revenus diversifiés, majoritairement passifs une fois le trafic installé, avec une ligne premium pour les power users.

**Objectif financier réaliste :**
- Mois 6 : 500€/mois (couvre l'infra + motivation)
- Mois 12 : 3 000€/mois (side income sérieux)
- Mois 24 : 15 000€/mois (business à temps plein)

---

## 📊 Les 5 Piliers de Revenus

### 💡 Pilier 1 — Display Advertising (Revenus passifs, dès J1)

**Comment ça marche :** Publicité display automatique, revenue proportionnel au trafic.

**Progression :**
- 0-10k visites/mois → Google AdSense (RPM ~2-3$)
- 10k-50k visites/mois → Mediavine ou Ezoic (RPM ~8-15$, seuil 10k sessions)
- 50k+ visites/mois → AdThrive ou régie spécialisée anime/manga (~15-25$ RPM)

**Projection revenus display :**
| Trafic mensuel | RPM | Revenus/mois |
|---|---|---|
| 10 000 | 3$ | 30$ |
| 50 000 | 12$ | 600$ |
| 200 000 | 18$ | 3 600$ |
| 1 000 000 | 20$ | 20 000$ |

> 🎯 **Clé :** Placer les ads intelligemment — pas sur les pages de lecture (UX killer), mais sur les pages de découverte, classements, et fiches titre. L'expérience de navigation doit rester premium.

---

### 🔗 Pilier 2 — Affiliation (Revenus passifs, impact immédiat)

**Plateformes de lecture :**
- **Webtoon** — programme d'affiliation officiel (commission sur abonnements Webtoon Canvas)
- **Lezhin Comics** — commission sur achat de coins (~10-15%)
- **Tapas** — programme d'affiliation
- **Delitoon** — plateforme FR avec programme affiliation

**Versions physiques (Amazon Associates) :**
- Chaque fiche titre avec édition physique → lien affilié Amazon FR + Amazon COM
- RPM très variable (3-5% sur le prix du livre)
- Commission moyenne sur un artbook ou coffret : ~2-5€ par vente

**Intégration intelligente :**
```
Sur chaque fiche titre :
"📖 Lire légalement" → boutons plateformes (affilés)
"📦 Édition physique" → Amazon (affilié)
"⭐ Support l'auteur" → lien direct Patreon/Ko-fi de l'auteur (goodwill, pas commissionné)
```

**Projection affiliation :** Conservativement 0.5% des visiteurs cliquent ET convertissent. À 200k visites/mois → 1000 conversions × 2€ moyenne = **2 000€/mois**.

---

### 👑 Pilier 3 — Premium / Subscription (Revenus récurrents, fort LTV)

**ManhwaVerse Premium — 4.99€/mois ou 39.99€/an**

**Ce qui justifie le premium (ne PAS paywaller les features core) :**
- 🎨 Thèmes de profil exclusifs (dark mode ultra, couleurs custom)
- 📊 Statistiques de lecture avancées (graphiques, heatmaps, rapports annuels)
- 🔔 Alertes personnalisées (nouveau chapitre d'un titre suivi)
- 📋 Import/Export de bibliothèque (Myanimelist, AniList, CSV)
- 🏆 Badge "Supporter" visible sur le profil et les reviews
- 📱 App mobile native (si elle est développée en Phase 4)
- 📰 Newsletter premium hebdomadaire avec recommandations IA personnalisées
- 🚫 Expérience sans publicité

**Projection Premium :**
| Users actifs | Taux conversion | Abonnés | Revenu/mois |
|---|---|---|---|
| 10 000 | 1% | 100 | 500€ |
| 50 000 | 2% | 1 000 | 5 000€ |
| 200 000 | 2.5% | 5 000 | 25 000€ |

> 💎 **Le premium est le vrai business.** Les ads et l'affiliation sont des bonus. Cultiver une communauté engagée qui veut supporter le projet est la stratégie long terme.

---

### 🤝 Pilier 4 — Partenariats & Sponsoring (Revenus actifs, mois 6+)

**Type de sponsors naturels :**
- **Éditeurs français** (Ki-oon, Delcourt Tonkam, Kana) — promotion de leurs nouvelles sorties manwha
- **Plateformes de lecture** (Webtoon, Delitoon) — bannières sponsorisées ou "Titre mis en avant"
- **Merchandising** (sites comme Crunchyroll Store, Otakuform) — produits dérivés manwha
- **VPN / outils tech** — sponsors classiques dans l'univers du contenu digitale
- **Services de livraison de box mangas** (Otaku Box, etc.)

**Formats de sponsoring :**
- "Titre mis en avant" sur la home (1 semaine) → 500-2000€
- Newsletter sponsorisée (1 édition) → 200-1000€
- Section "Nouveautés en librairie" curatée (mensuel) → 500-1500€/mois

> ❓ **Question ouverte :** Accepter des sponsorings dès 10k users ou attendre d'avoir plus de levier ? Recommandation : attendre 25k users pour négocier avec dignité.

---

### 🛠️ Pilier 5 — API & Data (Revenus long terme, mois 12+)

Une fois la base de données riche et les ratings communautaires solides, les données ManhwaVerse ont de la valeur.

**Cas d'usage :**
- **API publique freemium** pour les développeurs (applis tierces, bots Discord) → 9.99-29.99$/mois selon le quota
- **Données de rating** vendues à des éditeurs pour valider leurs acquisitions de licences
- **Whitelist premium** pour les créateurs de contenu qui veulent intégrer des widgets ManhwaVerse sur leurs sites

---

## 💳 Intégration Technique Paiement

```typescript
// Stack de paiement recommandé
├── Stripe — abonnements premium, paiement one-time
│   ├── stripe-js (frontend)
│   └── stripe (backend webhooks via Supabase Edge Functions)
├── Paddle (alternative) — gestion TVA internationale automatique
└── Lemon Squeezy — plus simple que Stripe, bonne option solo dev
```

**À configurer dès la Phase 3 :**
- Page pricing claire avec comparatif Free / Premium
- Gestion des abonnements (annulation, pause, upgrade)
- Emails automatiques (bienvenue premium, renouvellement, expiration)

---

## 📈 P&L Prévisionnel (Hypothèse conservatrice)

| | Mois 3 | Mois 6 | Mois 12 | Mois 24 |
|---|---|---|---|---|
| **Trafic** | 5k/mois | 30k/mois | 150k/mois | 800k/mois |
| Display Ads | 15€ | 360€ | 2 700€ | 16 000€ |
| Affiliation | 50€ | 300€ | 1 500€ | 8 000€ |
| Premium | 0€ | 500€ | 5 000€ | 25 000€ |
| Sponsoring | 0€ | 0€ | 1 000€ | 5 000€ |
| **Total revenus** | **65€** | **1 160€** | **10 200€** | **54 000€** |
| Infra & coûts | 50€ | 80€ | 200€ | 500€ |
| **Bénéfice net** | **15€** | **1 080€** | **10 000€** | **53 500€** |

> Ces projections supposent une exécution SEO + communauté sérieuse. Elles sont conservatrices — le upside est bien plus grand si un titre manwha devient viral (événement extérieur qui booste la niche).

---

## ❓ Questions Business Ouvertes

1. **Structure légale :** Auto-entrepreneur FR suffit au début. À partir de 5k€/mois, envisager une société (SAS ou SASU) pour optimiser fiscalement.
2. **TVA internationale :** Si des utilisateurs premium viennent de l'UE, la TVA OSS s'applique. Paddle ou Lemon Squeezy gèrent ça automatiquement, ce qui justifie de les préférer à Stripe pour le premium.
3. **Transparence financière :** Communiquer les revenus publiquement (style "Indie Hackers") peut créer un marketing authentique et attirer des early adopters qui veulent supporter un projet indé.
4. **Quand recruter ?** À 10k€/mois de revenus nets, embaucher un community manager part-time (freelance) pour la modération et le contenu social.
5. **Exit potentiel ?** À 50k+ users actifs et 10k€/mois, le site devient acquérable par un acteur comme Crunchyroll, Mediavine, ou un fonds spécialisé media. Pas l'objectif premier, mais une option réelle.

---

*La monétisation est une conséquence du trafic et de l'engagement. Priorité absolue : construire le produit que les lecteurs adorent d'abord.*
