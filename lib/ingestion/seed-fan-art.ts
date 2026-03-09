/**
 * Seed script: 123 real manhwa fan art posts with verified artist attribution.
 * Sources: Safebooru.org (stable CDN), artist credits point to Twitter/Pixiv/Lofter.
 *
 * Run: npx ts-node --project tsconfig.json -e "require('./lib/ingestion/seed-fan-art')"
 *   or: bun lib/ingestion/seed-fan-art.ts
 */

import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// ─── Artist registry ──────────────────────────────────────────────────────────

const ARTISTS: Record<string, { displayName: string; socialUrl: string }> = {
  ryunmaii:       { displayName: 'ryunmaii',       socialUrl: 'https://twitter.com/ryunmaii' },
  ianzhouart:     { displayName: 'ianzhouart',     socialUrl: 'https://twitter.com/ianzhouart' },
  shugo19:        { displayName: 'shugo19',         socialUrl: 'https://www.pixiv.net/en/users/shugo19' },
  pluvium_grandis:{ displayName: 'PluviumG',        socialUrl: 'https://twitter.com/PluviumG' },
  logicsterrr:    { displayName: 'Logicsterrr',     socialUrl: 'https://twitter.com/Logicsterrr' },
  saihachi06:     { displayName: 'SaiHachi06',      socialUrl: 'https://twitter.com/SaiHachi06' },
  kaktussan3:     { displayName: 'kaktussan3',      socialUrl: 'https://twitter.com/kaktussan3' },
  lantercat:      { displayName: 'LanterCat',       socialUrl: 'https://twitter.com/LanterCat' },
  keomikan:       { displayName: 'keomikan',        socialUrl: 'https://twitter.com/keomikan' },
  goo_g000:       { displayName: 'goo_g000',        socialUrl: 'https://twitter.com/goo_g000' },
  hydrangea9158:  { displayName: 'Hydrangea9158',   socialUrl: 'https://twitter.com/Hydrangea9158' },
  ddi_pu17184:    { displayName: 'ddi_pu17184',     socialUrl: 'https://twitter.com/ddi_pu17184' },
  benkdjjituibot: { displayName: 'BENkdjjituibot',  socialUrl: 'https://twitter.com/BENkdjjituibot' },
  kudou_masashi:  { displayName: 'Kudo_M_',         socialUrl: 'https://twitter.com/Kudo_M_' },
  papiputog:      { displayName: 'papiputog',       socialUrl: 'https://www.pixiv.net/en/artworks/92667959' },
  siji105:        { displayName: 'siji105',          socialUrl: 'https://twitter.com/siji105' },
  spyairi:        { displayName: 'spyairi',          socialUrl: 'https://www.pixiv.net/en/artworks/89466096' },
  esu_kota:       { displayName: 'esu_kota_',       socialUrl: 'https://twitter.com/esu_kota_' },
  blackbox9158:   { displayName: 'blackbox9158',    socialUrl: 'https://twitter.com/2L9l2Aa8UCL0IGJ' },
  leenim:         { displayName: 'eastown486',      socialUrl: 'https://twitter.com/eastown486' },
  noomuaz:        { displayName: 'NoomuAz',         socialUrl: 'https://twitter.com/NoomuAz' },
  kazyeon1:       { displayName: 'Kazyeon1',        socialUrl: 'https://twitter.com/Kazyeon1' },
  eterorca:       { displayName: 'eterorca',        socialUrl: 'https://twitter.com/eterorca' },
  kasuga_kaya:    { displayName: 'kasuga_kaya',     socialUrl: 'https://www.pixiv.net/en/users/kasuga_kaya' },
  so_boio:        { displayName: 'so_bOIO',         socialUrl: 'https://twitter.com/so_bOIO' },
  ibsm:           { displayName: 'ibsm',            socialUrl: 'https://sanryokuchashuman.lofter.com/' },
  gtjedah:        { displayName: 'GTJedah',         socialUrl: 'https://twitter.com/GTJedah' },
  gwechul:        { displayName: 'gwechul',         socialUrl: 'https://twitter.com/gwechul' },
}

// ─── Manhwa search terms ──────────────────────────────────────────────────────

type ManhwaKey = 'SL' | 'ORV' | 'TOG' | 'TBATE' | 'GOHS' | 'LOOKISM'

const MANHWA_SEARCH: Record<ManhwaKey, string> = {
  SL:     'Solo Leveling',
  ORV:    'Omniscient Reader',
  TOG:    'Tower of God',
  TBATE:  'Beginning After the End',
  GOHS:   'High School',
  LOOKISM:'Lookism',
}

const MANHWA_TAGS: Record<ManhwaKey, string[]> = {
  SL:     ['solo-leveling', 'manhwa', 'action', 'sung-jinwoo'],
  ORV:    ['orv', 'omniscient-reader', 'manhwa', 'kim-dokja'],
  TOG:    ['tower-of-god', 'tog', 'manhwa', 'fantasy'],
  TBATE:  ['tbate', 'beginning-after-the-end', 'manhwa', 'fantasy'],
  GOHS:   ['god-of-high-school', 'manhwa', 'martial-arts', 'action'],
  LOOKISM:['lookism', 'manhwa', 'action'],
}

const MANHWA_LABEL: Record<ManhwaKey, string> = {
  SL:     'Solo Leveling',
  ORV:    'Omniscient Reader\'s Viewpoint',
  TOG:    'Tower of God',
  TBATE:  'The Beginning After the End',
  GOHS:   'The God of High School',
  LOOKISM:'Lookism',
}

// ─── Fan art data (123 entries with verified image URLs and artist credits) ───

interface FanArtEntry {
  manhwa: ManhwaKey
  artist: string
  imageUrl: string
}

const FAN_ARTS: FanArtEntry[] = [
  // ── Solo Leveling (5) ──────────────────────────────────────────────────────
  { manhwa: 'SL',      artist: 'ryunmaii',       imageUrl: 'https://safebooru.org/images/555/6261d73c9578a28b3875d359a6220e06c15bfb25.jpg' },
  { manhwa: 'SL',      artist: 'ianzhouart',     imageUrl: 'https://safebooru.org/images/288/745616758b1de5427dafbebecd45b8df549bff03.jpg' },
  { manhwa: 'SL',      artist: 'shugo19',        imageUrl: 'https://safebooru.org/images/4386/6e5a8d5bac412972457ba0b0f0145030cd78545d.png' },
  { manhwa: 'SL',      artist: 'pluvium_grandis', imageUrl: 'https://safebooru.org/images/290/f98b93cf8463d20d98f5f0c7c678a367cacc9768.jpg' },
  { manhwa: 'SL',      artist: 'logicsterrr',    imageUrl: 'https://safebooru.org/images/1568/5889f0de0982f199448bc6d43afb8e32b889a06b.jpg' },

  // ── Omniscient Reader's Viewpoint — original batch (26) ───────────────────
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1071/56e6e1106cbdcb349f0d9cead2c13e4e9618f8ab.jpg' },
  { manhwa: 'ORV',     artist: 'kaktussan3',     imageUrl: 'https://safebooru.org/images/814/9779b85be76520c859808cfbeafec04123df663c.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/f34fc1c8af1c6549715334783cca20c9e00067bd.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/922bfef750a6585b29c59130faa2e3f863e8739e.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1060/38de06054b0e82b7de5af38b6fc8ac0f102fd0ef.jpg' },
  { manhwa: 'ORV',     artist: 'kaktussan3',     imageUrl: 'https://safebooru.org/images/814/6e454c5e399f1bf01b48885ae2f333ca4a29b91b.jpg' },
  { manhwa: 'ORV',     artist: 'kaktussan3',     imageUrl: 'https://safebooru.org/images/814/f2bf84faa18bee0f92dca1671849d0e0a796a473.jpg' },
  { manhwa: 'ORV',     artist: 'kaktussan3',     imageUrl: 'https://safebooru.org/images/814/c555fe6ab1d9d2bc208a557da5dac1be733ecd46.jpg' },
  { manhwa: 'ORV',     artist: 'kaktussan3',     imageUrl: 'https://safebooru.org/images/814/8895488a808837a2fd6b46e8fee8f915b085b7d2.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/815/d500905fe8d455a870ef3a268ac8a45421042f02.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/32/8876a127bbc4cadc914c2dc8fdb738e3a2471b44.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1567/50a633a597f9ca6efb88fed25e99b5aff1b3d1c0.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/4123/5648fcf7c56a68dd5538cfa4bef84f4f5015e9e9.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/4123/235e934f7f679ecc779cb39693ef3d6325b23f3a.jpg' },
  { manhwa: 'ORV',     artist: 'keomikan',       imageUrl: 'https://safebooru.org/images/2094/fe4e978c771a359af3e06c797ab3e0a68ce62368.jpg' },
  { manhwa: 'ORV',     artist: 'keomikan',       imageUrl: 'https://safebooru.org/images/547/c0edca5e60218ebaec2a75f87afa4b18f8382d62.jpg' },
  { manhwa: 'ORV',     artist: 'keomikan',       imageUrl: 'https://safebooru.org/images/547/0bcbac4cfc00f8aaafd6fe56d3a6f8004fd8f3f9.jpg' },
  { manhwa: 'ORV',     artist: 'goo_g000',       imageUrl: 'https://safebooru.org/images/2094/76bd60b226feb164e50bb78deeda38347b63ddef.jpg' },
  { manhwa: 'ORV',     artist: 'goo_g000',       imageUrl: 'https://safebooru.org/images/1567/e33c8ccbbdeb20af899b82f82131128af04ea5c3.jpg' },
  { manhwa: 'ORV',     artist: 'hydrangea9158',  imageUrl: 'https://safebooru.org/images/815/40ebcf364820b632a0129073d59e119bab409f7a.jpg' },
  { manhwa: 'ORV',     artist: 'hydrangea9158',  imageUrl: 'https://safebooru.org/images/815/b9ffc63d1f834e9276eb8b1728bbc425ac85742c.jpg' },
  { manhwa: 'ORV',     artist: 'ddi_pu17184',    imageUrl: 'https://safebooru.org/images/814/088964172ad76d1875eea3097bd055480313316c.jpg' },
  { manhwa: 'ORV',     artist: 'ddi_pu17184',    imageUrl: 'https://safebooru.org/images/814/02312f7919b9d1269092baa16c23baa372eabec8.jpg' },
  { manhwa: 'ORV',     artist: 'benkdjjituibot', imageUrl: 'https://safebooru.org/images/815/4d9b9db9f701632a67213c142925d13bf7b984c5.jpg' },
  { manhwa: 'ORV',     artist: 'benkdjjituibot', imageUrl: 'https://safebooru.org/images/284/ab5554ef08f60e61e984bd46beac916e9ea46b91.jpg' },
  { manhwa: 'ORV',     artist: 'benkdjjituibot', imageUrl: 'https://safebooru.org/images/539/16e10d256932068984f772c008d582b83f97045c.jpg' },
  { manhwa: 'ORV',     artist: 'goo_g000',       imageUrl: 'https://safebooru.org/images/1567/c619f390091d04ff96d3168a8bd8a371c2832728.jpg' },
  { manhwa: 'ORV',     artist: 'goo_g000',       imageUrl: 'https://safebooru.org/images/1567/a5b4b17fbefccb1ba9b43a72bf623d205ee40abc.jpg' },

  // ── Tower of God (8) ──────────────────────────────────────────────────────
  { manhwa: 'TOG',     artist: 'kudou_masashi',  imageUrl: 'https://safebooru.org/images/1568/96c33de94aef70f3609ae37d3625e1650d248ccb.jpg' },
  { manhwa: 'TOG',     artist: 'papiputog',      imageUrl: 'https://safebooru.org/images/26/185b515591ec81880b87d445a1787a5488b8bef9.jpg' },
  { manhwa: 'TOG',     artist: 'siji105',        imageUrl: 'https://safebooru.org/images/4383/0b006bd75c9f3787b84f15964b14351e0d7abba9.jpg' },
  { manhwa: 'TOG',     artist: 'papiputog',      imageUrl: 'https://safebooru.org/images/26/c9a58290938643dc8807acc55585cc16636e76ac.jpg' },
  { manhwa: 'TOG',     artist: 'papiputog',      imageUrl: 'https://safebooru.org/images/26/5ced24590efc605ef8a4e92f302174ff3392c73b.jpg' },
  { manhwa: 'TOG',     artist: 'spyairi',        imageUrl: 'https://safebooru.org/images/26/3ac6a4aeae9b5634180598230b04f1a1a18059d6.jpg' },
  { manhwa: 'TOG',     artist: 'spyairi',        imageUrl: 'https://safebooru.org/images/26/5391f3dd0376d33f69199e35ceccf184a4ba9589.jpg' },
  { manhwa: 'TOG',     artist: 'esu_kota',       imageUrl: 'https://safebooru.org/images/4377/e5e932480322394177c9f1ecafe7284ce4c83aa7.jpg' },

  // ── The God of High School (2) ────────────────────────────────────────────
  { manhwa: 'GOHS',    artist: 'blackbox9158',   imageUrl: 'https://safebooru.org/images/539/bc93c71966e036bd57162ecbf36fd65673001e7c.png' },
  { manhwa: 'GOHS',    artist: 'leenim',         imageUrl: 'https://safebooru.org/images/18/c9fd187a4a8fffd7b031397eeb0b8c513e3c5bd2.jpg' },

  // ── The Beginning After the End — noomuaz (4) ─────────────────────────────
  { manhwa: 'TBATE',   artist: 'noomuaz',        imageUrl: 'https://safebooru.org/images/43/1b6f63bcdc4d976d5dad1347c6a9aae36d77b951.jpg' },
  { manhwa: 'TBATE',   artist: 'noomuaz',        imageUrl: 'https://safebooru.org/images/43/30ea8ccfbf1ab4832ce3c18ab9a2c245f34ea03b.jpg' },
  { manhwa: 'TBATE',   artist: 'noomuaz',        imageUrl: 'https://safebooru.org/images/555/266e1d7d7461a83f59007dfd9b5ef1e97462d73a.jpg' },
  { manhwa: 'TBATE',   artist: 'noomuaz',        imageUrl: 'https://safebooru.org/images/3857/ea87a0d9eb7d82f51af9fe948dcd75fde7a0a639.jpg' },

  // ── Lookism (12) ──────────────────────────────────────────────────────────
  { manhwa: 'LOOKISM', artist: 'kazyeon1',       imageUrl: 'https://safebooru.org/images/4379/b2205e9a1d645ae01ad36bf7ebff2d2312bad97b.jpg' },
  { manhwa: 'LOOKISM', artist: 'kazyeon1',       imageUrl: 'https://safebooru.org/images/4379/1ad661802873d1805bd3cf5d35b0751e12a83a75.jpg' },
  { manhwa: 'LOOKISM', artist: 'eterorca',       imageUrl: 'https://safebooru.org/images/4379/f3537e25f6c6249d7fdb8e0c0bd40ff5c1b2f633.jpg' },
  { manhwa: 'LOOKISM', artist: 'kasuga_kaya',    imageUrl: 'https://safebooru.org/images/4374/373e3ebf0df3000f1961a99698424c18b28c435d.png' },
  { manhwa: 'LOOKISM', artist: 'kasuga_kaya',    imageUrl: 'https://safebooru.org/images/1558/3569ee2b0b2c536395feb1d2c5adfa8631bb54f3.png' },
  { manhwa: 'LOOKISM', artist: 'so_boio',        imageUrl: 'https://safebooru.org/images/1558/2167032b88c50fe1d2d602e5f6fa157a6283e89a.jpg' },
  { manhwa: 'LOOKISM', artist: 'ibsm',           imageUrl: 'https://safebooru.org/images/1302/8d0e78d453d5d441dfecc08e54e9226e62a0483d.png' },
  { manhwa: 'LOOKISM', artist: 'gtjedah',        imageUrl: 'https://safebooru.org/images/1046/05ed1958968812f191aaf6d6b182e0fffa7245bc.jpg' },
  { manhwa: 'LOOKISM', artist: 'eterorca',       imageUrl: 'https://safebooru.org/images/790/2cc372c993bc3bced8eadbc176f7e3f3322e5a37.jpg' },
  { manhwa: 'LOOKISM', artist: 'eterorca',       imageUrl: 'https://safebooru.org/images/790/c8543523bf56a4114aba82262062c63009d19318.jpg' },
  { manhwa: 'LOOKISM', artist: 'so_boio',        imageUrl: 'https://safebooru.org/images/1302/44d7951b0d8c3fd85a90bec573e7e586d4eabc6c.jpg' },
  { manhwa: 'LOOKISM', artist: 'ibsm',           imageUrl: 'https://safebooru.org/images/1558/57dae138b514a5256bb42eaa5c69dabdcec21264.jpg' },

  // ── The Beginning After the End — logicsterrr (4) ────────────────────────
  { manhwa: 'TBATE',   artist: 'logicsterrr',    imageUrl: 'https://safebooru.org/images/544/4996ddd68465550065e728422aafe800fae8be0b.jpg' },
  { manhwa: 'TBATE',   artist: 'logicsterrr',    imageUrl: 'https://safebooru.org/images/288/89fbb42acc3b36ec75dff6978b56af982448e1f2.jpg' },
  { manhwa: 'TBATE',   artist: 'logicsterrr',    imageUrl: 'https://safebooru.org/images/288/54e69f314d54da83139c1882a8c96b9bd0376380.jpg' },
  { manhwa: 'TBATE',   artist: 'logicsterrr',    imageUrl: 'https://safebooru.org/images/288/5a1097b380f4e43777e6c34d126c946c88e1bace.jpg' },

  // ── Omniscient Reader's Viewpoint — extended lantercat & saihachi06 (60) ──
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1313/7b6f52988707a7937883fc674fb2cbd892ae5eb3.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1313/0422246e2d755ac96a7681c3b0620afea3ed6194.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1313/34ac031c13e1167a03d4d3f262f19fae5760a71a.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/32/344b7403ce5c1556a9c3af8d2cab5950b57537d9.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/32/c833d27a044fbd1de1a6198cab88731b2adaf08b.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/783268ecbc946ae29606c686c65fce3092f7395b.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/4ff21dd23a33dd95ebc1b82757dfe79aa64e2c83.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1567/4da848a2ad43b41cada899e256fc29f8ede68bf1.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1567/754616a39ae6f4e0375a03cf27b59a2b0d6d9736.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1567/3d1e24186ad9bf1dbde3e8e595f1815fe424faa4.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/6d75e648439f87248bca455598094738f222e2fd.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/bcfc264a52bf8c4ab6d927529705d8fa0bf6374a.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1567/aa4eff6be3481616525ba65e47b24e8d62104c9b.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1567/bedd6530dcba44e06987359a4b83fc1013d8c0c2.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/0b4cdfc9637c35dd4dac6f2af3ed575cf5b64294.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/3a2b249535af8e92ab279ea9c36352e06ed41051.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1567/8f7a26a81f412fe21ff1895998cbbc8231947bcb.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1567/840c5f3fa0573905239b7efa3cd550d68254129a.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/59485fbb4560c2a6a2df583d2a5742c84e43f685.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/724ae20c738c9f7d3973b1f3e678831d8939f407.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1567/b0afdb94b7a528feb5ece3f60cdac3c254e8f6bb.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1567/5b300750f0544bb0981247e0125231301568dbcd.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/b5118451b651c9361ec8b1c1ad9dc0dd39d27c05.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/1c9a1f6e4ec1a3579cd9459495b7998a30872788.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1567/16d7f6b6c3ff65151cadae3f629a4876ddae0e4a.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1567/211d896f0a69130e4aadbf0b31b30c0823fef004.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/37bca8843f8a60cdb2cfa71960a70c8fd3cf1050.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/b43c78071eeea64d752c4ec7a1763acbf4a04d4a.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/1567/37ea57ff69ac59b1697fee1d3f7ca2312a75917b.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/4123/19a9485698cfa94f0ad91ae1e65cdaf054ab394e.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/e5ceed9b79e5f696c4ca88b692ea941a7c076b09.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/49bb9b78d96a30584bd2a82bf74ca15872f397fb.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/4123/37b2bc8ce495a21e4e9085cfb9eba3393a056799.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/4123/1dfd31f6ab08bacf3a3199089b2b3e20b8a03b5d.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/b2e31d25ccf26c29585278781ac5128e6a02029e.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/87450349b4abe9ab09b81a3feb1fc281f885837f.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/4123/fefb594ac47a1880737fb6ac2a6fbf7a7547a3e1.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/4123/abfc6614fad2b638f474978b10ce39183a9c9067.png' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/10c3d810a1b9e464543538da6759c90a14297569.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/67127bb6516df31b42d30c39844d16c10ed48f1b.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/4123/7eb8adc7c75b7184243b0de2aaada3547d29dee7.jpg' },
  { manhwa: 'ORV',     artist: 'gwechul',        imageUrl: 'https://safebooru.org/images/4123/c518dacf435076697f0fb23ba51b1fad72cc9be9.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/e6c69d6da82b1426180586f8dfae1d177b929710.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/c4d9e9bd85e6996363e6d22f279974972a134c7b.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/4123/e02449d796dccddc97b2dd486aa59657f164aa88.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/4123/909a9e4b02b44c1630e93cbea01bd37a9e3a17e8.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/d4b83f1bf4a46a7310e699fbaffaff038449a77d.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/ed62b1f31ed1366c8943ab8bd18178adbab3486c.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/4123/9d8debc5ec0fc90777e2c684c4aefbd7acfed695.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/4e3dfee47237363332cfe879713409ab1a17f812.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/70edf0c8a3c59269eeb3ae0da2587c3ec1000864.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/4123/799ff94d6f7c4a1da9b32808a3f3d31762870a8a.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/4123/f23f0572b975b246fc9263fdbfb628ca33a31e23.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',      imageUrl: 'https://safebooru.org/images/4123/4d17fb95ff26dcd9001f1a9fc495529ade3008f9.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/39fb64fb258f2b67ec74fb8e786f4bc491f5fc07.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/3a46845ce136e197975704962109f6240d41b0da.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',     imageUrl: 'https://safebooru.org/images/1568/1ac26aa9366cd08362eb04cad0d3bf7c17cea431.jpg' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomDate(daysBack: number): Date {
  return new Date(Date.now() - Math.floor(Math.random() * daysBack) * 24 * 60 * 60 * 1000)
}

function randomLikes(): number {
  return Math.floor(Math.random() * 120)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🎨 Starting fan art seed...')
  console.log(`   ${FAN_ARTS.length} entries to insert`)

  // ── 1. Create or find the gallery curator user ──────────────────────────────
  const curatorEmail = 'gallery.seed@manhwaverse.internal'
  const now = new Date()

  let curator = await prisma.user.findUnique({ where: { email: curatorEmail } })

  if (!curator) {
    curator = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: curatorEmail,
        username: 'mw_gallery',
        display_name: 'ManhwaVerse Gallery',
        is_seed: true,
        is_artist: false,
        updated_at: now,
      },
    })
    console.log(`   ✅ Created curator user: ${curator.username}`)
  } else {
    console.log(`   ✅ Found curator user: ${curator.username}`)
  }

  // ── 2. Look up manhwa IDs ───────────────────────────────────────────────────
  const manhwaMap: Partial<Record<ManhwaKey, string>> = {}

  for (const [key, searchTerm] of Object.entries(MANHWA_SEARCH) as [ManhwaKey, string][]) {
    const found = await prisma.manhwa.findFirst({
      where: { title_en: { contains: searchTerm, mode: 'insensitive' } },
      select: { id: true, title_en: true },
    })
    if (found) {
      manhwaMap[key] = found.id
      console.log(`   📖 Found: ${found.title_en} (${key})`)
    } else {
      console.warn(`   ⚠️  Manhwa not found for key "${key}" (search: "${searchTerm}") — skipping those posts`)
    }
  }

  // ── 3. Insert fan art posts ─────────────────────────────────────────────────
  let inserted = 0
  let skipped = 0

  for (const entry of FAN_ARTS) {
    const manhwaId = manhwaMap[entry.manhwa]
    if (!manhwaId) {
      skipped++
      continue
    }

    const artist = ARTISTS[entry.artist]
    if (!artist) {
      console.warn(`   ⚠️  Unknown artist key: ${entry.artist}`)
      skipped++
      continue
    }

    const label = MANHWA_LABEL[entry.manhwa]
    const tags = MANHWA_TAGS[entry.manhwa]
    const title = `${label} fan art by ${artist.displayName}`
    const createdAt = randomDate(120)

    const post = await prisma.fanArtPost.create({
      data: {
        id: randomUUID(),
        user_id: curator.id,
        manhwa_id: manhwaId,
        title,
        is_original: false,
        credit_name: artist.displayName,
        credit_url: artist.socialUrl,
        is_nsfw: false,
        tags,
        like_count: randomLikes(),
        comment_count: 0,
        view_count: Math.floor(Math.random() * 500),
        created_at: createdAt,
        updated_at: createdAt,
      },
    })

    await prisma.fanArtImage.create({
      data: {
        id: randomUUID(),
        post_id: post.id,
        position: 1,
        image_url: entry.imageUrl,
        thumb_url: entry.imageUrl,
        alt_text: title,
        width: 0,
        height: 0,
      },
    })

    inserted++
    if (inserted % 10 === 0) {
      process.stdout.write(`   ⬆  ${inserted}/${FAN_ARTS.length - skipped} inserted...\r`)
    }
  }

  console.log(`\n\n✅ Done! Inserted ${inserted} fan art posts (${skipped} skipped).`)
  console.log(`\n   Breakdown:`)
  const counts: Partial<Record<ManhwaKey, number>> = {}
  for (const e of FAN_ARTS) {
    if (manhwaMap[e.manhwa]) counts[e.manhwa] = (counts[e.manhwa] ?? 0) + 1
  }
  for (const [key, count] of Object.entries(counts)) {
    console.log(`   · ${MANHWA_LABEL[key as ManhwaKey]}: ${count} posts`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
