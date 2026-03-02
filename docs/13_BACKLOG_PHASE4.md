# 📦 BACKLOG PHASE 4+ — Features à implémenter plus tard
> Idées validées · À ne pas implémenter avant que le produit core soit terminé
> Ne pas toucher à ces specs pendant les Phases 0-3

---

## ⚠️ Règle absolue

Ces features sont **validées et documentées** mais **gelées**.
Aucune ligne de code, aucune table DB, aucun composant avant
que les Phases 1-3 soient terminées et que les métriques soient atteintes.

Déclencheur pour démarrer cette phase :
- 25 000 utilisateurs actifs
- SEO stable (top 10 sur les requêtes cibles)
- Revenu mensuel > €2,000

---

## 📚 FEATURE PRINCIPALE — Collection Physique

### Concept (inspiré de MangaCollec)

Ajouter une couche de tracking des volumes physiques à ManhwaVerse.
MangaCollec le fait pour le manga japonais mais pas spécifiquement pour
le manhwa. Et surtout : ils n'ont aucune couche sociale, aucun rating,
aucune communauté. On leur prend la feature et on y ajoute tout notre
écosystème communautaire dessus.

**Le gap de marché :**
- Le marché physique manhwa VF explose (Ki-oon, Delcourt/Tonkawa, Mangetsu)
- Aucune plateforme ne couvre ça spécifiquement pour le manhwa
- MangaCollec est manga-first, manhwa très pauvrement couvert
- Zéro outil qui unifie digital + physique pour le manhwa

---

### Features physiques à implémenter (toutes validées)

**1. Tracker volumes par édition**
```
Solo Leveling — Collection physique VF (Ki-oon)

Tomes disponibles :
☑ Tome 1  ·  Standard          ← possédé
☑ Tome 2  ·  Standard
☐ Tome 3  ·  Standard          ← manquant
☐ Tome 3  ·  Édition Collector ← manquant
☑ Tome 4  ·  Standard

Progression : 3/6 tomes · Valeur estimée collection : ~24€
```

**2. Alertes sorties VF physiques**
- Notification email/push quand un nouveau tome VF sort
- Calendrier des prochaines sorties (Planning page comme MangaCollec)
- "Préviens-moi quand le Tome 5 sort en VF"

**3. Wishlist avec liens Amazon affiliés**
- Tomes manquants → bouton "Trouver" → lien Amazon affilié
- Génération automatique des liens affiliés par ISBN
- Monétisation passive parfaite

**4. Valeur estimée de la collection**
- Prix moyen par tome × tomes possédés = valeur estimée
- Évolution dans le temps (si le prix change)
- "Ta collection manhwa physique vaut environ €340"
- Très partageable sur les réseaux

**5. Photo de collection (partage social)**
- Upload photo de sa bibliothèque
- Tag des titres présents sur la photo
- Partage Instagram/Twitter avec génération automatique d'image stylisée
- "Ma collection ManhwaVerse" — image générée avec les covers des tomes possédés

---

### Donnée unique que personne n'a

```
Sur chaque fiche manhwa :

Lecteurs digitaux  ·  2 847 personnes lisent en digital
Collection physique · 342 personnes possèdent l'édition Ki-oon VF

→ Ce signal de demande intéresse directement les éditeurs français
→ Donnée vendable à Ki-oon / Delcourt pour leurs décisions d'édition
→ Monétisation Phase 4 : rapports d'insights pour les éditeurs
```

---

### Travail éditorial nécessaire (pourquoi on attend)

La base de données des volumes physiques est un travail conséquent :
- Sourcer les ISBNs pour chaque tome
- Prix de vente par édition
- Éditeurs VF par titre (Ki-oon, Delcourt, Mangetsu, Kana...)
- Variants d'éditions (standard, collector, prestige, deluxe...)
- Dates de sortie VF historiques et à venir

MangaCollec a mis des années. On peut accélérer via :
- Scraping MangaCollec (si légalement possible)
- API éditeurs (peu existent)
- Communauté de contributors (comme Wikipedia)
- Partenariat direct avec les éditeurs

---

### Schéma DB à créer en Phase 4

```prisma
model PhysicalVolume {
  id              String    @id @default(cuid())
  manhwa_id       String
  manhwa          Manhwa    @relation(...)
  volume_number   Int
  edition_type    EditionType
  title_fr        String?
  publisher_fr    String?   // "Ki-oon", "Delcourt/Tonkawa"
  isbn            String?   @unique
  release_date_fr DateTime?
  price_fr        Float?
  cover_url       String?
  is_last_volume  Boolean   @default(false)
  created_at      DateTime  @default(now())
  
  user_collections UserPhysicalCollection[]
}

enum EditionType {
  STANDARD
  COLLECTOR
  PRESTIGE
  DELUXE
  PERFECT_EDITION
  GRAND_FORMAT
  OMNIBUS
  OTHER
}

model UserPhysicalCollection {
  id          String          @id @default(cuid())
  user_id     String
  volume_id   String
  volume      PhysicalVolume  @relation(...)
  condition   String?         // "neuf", "très bon état", "bon état"
  price_paid  Float?
  acquired_at DateTime?
  notes       String?
  created_at  DateTime        @default(now())
  
  @@unique([user_id, volume_id])
}

model PhysicalWishlist {
  user_id     String
  volume_id   String
  volume      PhysicalVolume  @relation(...)
  priority    Int             @default(0)
  created_at  DateTime        @default(now())
  
  @@id([user_id, volume_id])
}
```

---

### Positionnement dans l'UI (décision validée)

**Option retenue : Toutes les trois selon le contexte**

- **Profil** : onglet dédié "📦 Collection" côte à côte avec "📚 Bibliothèque"
- **Bibliothèque** : section séparée "Ma collection physique"
- **Fiche titre** : section intégrée montrant digital + physique côte à côte

```
Profil @username

[📚 Bibliothèque (147)] [📦 Collection physique (89)] [⭐ Reviews (23)]

Sur la fiche Solo Leveling :
├── 📱 Digital  : En cours · Chapitre 87 · 8.5/10
└── 📦 Physique : 4/6 tomes Ki-oon · Manque T3 et T5
    [+ Ajouter à ma wishlist]  [Trouver sur Amazon →]
```

---

### Monétisation directe de cette feature

```
Affiliation Amazon      → lien affilié sur chaque tome manquant
Alertes push sponsored  → éditeurs paient pour notifier leur base
Insights éditeurs       → données de possession agrégées vendues
"Précommande" button    → commissions sur les précommandes
```

---

## 🔮 Autres features backlog Phase 4+

**API Publique payante**
Exposer les données ManhwaVerse (scores, trends, tropes, collection stats)
via une API freemium. €9.99-29.99/mois selon le quota.
Clients potentiels : développeurs, créateurs d'outils, éditeurs.

**Programme éditeurs**
Dashboard privé pour Ki-oon, Delcourt, Mangetsu :
- Voir la demande pour leurs titres (wishlist count, reader count)
- Identifier les titres non-licenciés très demandés
- Données de sentiment (reviews + scores) sur leur catalogue
Prix : €200-500/mois par éditeur.

**Scan de code-barre**
Sur mobile : scanner l'ISBN d'un livre pour l'ajouter à sa collection.
Feature killer pour l'app mobile native (Phase 4).

**Comparaison de collections**
"Compare ta collection avec @ami" — % de tomes en commun,
titres que l'un a et pas l'autre → recommendations croisées.

**Valeur de revente**
Intégration avec les places de marché (eBay, Vinted) pour estimer
la valeur de revente de sa collection.
Feature très engageante pour les collectors.

---

*Backlog Phase 4+ · v1.0 · Mars 2026*
*Ne pas implémenter avant : 25k users + SEO stable + €2k/mois*
*Toutes features validées par le founder*
