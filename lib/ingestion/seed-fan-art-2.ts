/**
 * Seed 200 more fan art posts (batch 2)
 * Run: npx tsx lib/ingestion/seed-fan-art-2.ts
 */

import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// ─── Artists ──────────────────────────────────────────────────────────────────

const ARTISTS: Record<string, { displayName: string; socialUrl: string }> = {
  lantercat:       { displayName: 'LanterCat',       socialUrl: 'https://twitter.com/LanterCat' },
  saihachi06:      { displayName: 'SaiHachi06',      socialUrl: 'https://twitter.com/SaiHachi06' },
  kazyeon1:        { displayName: 'kazyeon1',        socialUrl: 'https://twitter.com/Kazyeon1' },
  ailianmachao47679: { displayName: 'ailianmachao47679', socialUrl: 'https://ailianmachao47679.lofter.com/' },
  kasuga_kaya:     { displayName: 'kasuga_kaya',     socialUrl: 'https://www.pixiv.net/en/users/kasuga_kaya' },
  xinlizhou8:      { displayName: 'xinlizhou8',      socialUrl: 'https://twitter.com/xinlizhou8' },
  kkiisscchhuu:    { displayName: 'kkiisscchhuu',    socialUrl: 'https://twitter.com/kkiisscchhuu' },
  harua_sorausagi: { displayName: 'harua_sorausagi', socialUrl: 'https://www.pixiv.net/en/artworks/83097869' },
  ibsm:            { displayName: 'ibsm',            socialUrl: 'https://sanryokuchashuman.lofter.com/' },
  so_boio:         { displayName: 'so_bOIO',         socialUrl: 'https://twitter.com/so_bOIO' },
  gtjedah:         { displayName: 'GTJedah',         socialUrl: 'https://twitter.com/GTJedah' },
  iljinsae30735:   { displayName: 'iljinsae30735',   socialUrl: 'https://twitter.com/iljinsae30735' },
  omuteri:         { displayName: 'omuteri',         socialUrl: 'https://twitter.com/javjavinmybath' },
  eterorca:        { displayName: 'eterorca',        socialUrl: 'https://twitter.com/eterorca' },
  gensakuu:        { displayName: 'Gensakuu',        socialUrl: 'https://twitter.com/Gensakuu' },
  zigaziggxl:      { displayName: 'zigaziggxl',      socialUrl: 'https://twitter.com/zigaziggxl' },
  anjanikorry:     { displayName: 'AnjaniKorry',     socialUrl: 'https://twitter.com/AnjaniKorry' },
  wei_inn:         { displayName: 'wei_inn',         socialUrl: 'https://twitter.com/wei_inn' },
  maga_mok23:      { displayName: 'maga_mok23',      socialUrl: 'https://twitter.com/moggi1863' },
  eonsuena:        { displayName: 'eonsuena',        socialUrl: 'https://twitter.com/eonsuena' },
  papercider:      { displayName: 'papercider',      socialUrl: 'https://twitter.com/papercider' },
  '8612starreader': { displayName: '8612StarReader', socialUrl: 'https://twitter.com/8612StarReader' },
  rc_dec:          { displayName: 'rc_dec',          socialUrl: 'https://twitter.com/rc_dec' },
  vacation_town:   { displayName: 'vacation_town',   socialUrl: 'https://twitter.com/vacation_town' },
  milo59950:       { displayName: 'Milo59950',       socialUrl: 'https://twitter.com/Milo59950' },
  evie_baoxiao:    { displayName: 'evie (baoxiao)',  socialUrl: 'https://twitter.com/ebeevee' },
  choung_choung:   { displayName: 'choung_choung',   socialUrl: 'https://twitter.com/choung_choung' },
  zco111:          { displayName: 'zco111',          socialUrl: 'https://twitter.com/zco111' },
  yu_shiro_ki:     { displayName: 'Yu_Shiro_Ki',     socialUrl: 'https://twitter.com/Yu_Shiro_Ki' },
  tawhirl:         { displayName: 'tawhirl',         socialUrl: 'https://safebooru.org' },
  guomukaoya97:    { displayName: 'guomukaoya97',    socialUrl: 'https://twitter.com/guomukaoya97' },
  breathing742105: { displayName: 'breathing742105', socialUrl: 'https://twitter.com/breathing742105' },
  zero_q_0q:       { displayName: 'Zero_Q_0q',       socialUrl: 'https://twitter.com/Zero_Q_0q' },
  lumolyv:         { displayName: 'lumolyv',         socialUrl: 'https://twitter.com/lumolyv' },
  sion_428:        { displayName: 'SION_428',        socialUrl: 'https://twitter.com/SION_428' },
  typo_koneko:     { displayName: 'typo_koneko',     socialUrl: 'https://twitter.com/typo_koneko' },
  jpqaa5:          { displayName: 'JPQaA5',          socialUrl: 'https://twitter.com/JPQaA5' },
  wangwanghan0723: { displayName: 'wangwanghan0723', socialUrl: 'https://www.xiaohongshu.com' },
  eyesoffyou0003:  { displayName: 'eyesoffyou0003',  socialUrl: 'https://twitter.com/eyesoffyou0003_' },
  dalchi09:        { displayName: 'dalchi09',        socialUrl: 'https://twitter.com/dalchi09' },
  areuwuu:         { displayName: 'areuwuu',         socialUrl: 'https://twitter.com/areuwuu' },
}

// ─── Fan art entries ──────────────────────────────────────────────────────────

type FanArtEntry = {
  manhwa: 'ORV' | 'Lookism'
  artist: string
  imageUrl: string
}

const FAN_ARTS: FanArtEntry[] = [
  // ── Previous session batch (posts 1-39) ──────────────────────────────────
  { manhwa: 'Lookism', artist: 'kazyeon1',        imageUrl: 'https://safebooru.org/images/4379/272db559feeccaf68410d8bd4a45fa27b82d5dd9.jpg' },
  { manhwa: 'Lookism', artist: 'ailianmachao47679', imageUrl: 'https://safebooru.org/images/279/58d623c9aef98703149b75a32d03520f2323ac7d.png' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/895b655025b1b3037118e7ac233a61add51f3883.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/6288f349369d3246a072eb376d3f26592ef59ba6.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',       imageUrl: 'https://safebooru.org/images/1568/89a3d1d17f9ecff30481c6aee07169dbcf70c719.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',       imageUrl: 'https://safebooru.org/images/1568/6486922a3297c2a6a1eb6382820a4f153a864a66.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/ef3cd289fb06a5b98da94f755919813ad7723cfb.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/c16efa4209a8b7d09a33d6aa349cc1757f7e3ee3.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',       imageUrl: 'https://safebooru.org/images/1568/6e5504808184129a7605b224dfa7053ef55c20fc.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',       imageUrl: 'https://safebooru.org/images/1568/2d7fce0a3b2b86a55bd11671a363bcb6011286b0.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/b5b64c6d27cf6ca60fffee82172223151cfda5ac.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/671b4b400d7cc772ccd299cde67d67903b46b458.png' },
  { manhwa: 'ORV',     artist: 'saihachi06',       imageUrl: 'https://safebooru.org/images/1568/b590ae4182f5296f760648f9901f0ed06fcf590a.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',       imageUrl: 'https://safebooru.org/images/1056/c6b090d721baed749e8f81331f1871fe4ca41df2.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/94f40f4ce875a2a6c62124a9fe66bed0ae84cd71.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/3dd6d4f1ef4bd62ccca0f7c83dc02e4e77f4ff63.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',       imageUrl: 'https://safebooru.org/images/1056/9d3edde9ea4352b0c63d9b7abffa7b929da493de.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',       imageUrl: 'https://safebooru.org/images/1056/566307bfe2648804200ba2c4a93a3238354d573e.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/02fd583a3498948e2c0a47805784a4e518930dd4.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/d90423ee1e11c473b6ce066418c9c44e4efbee03.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',       imageUrl: 'https://safebooru.org/images/1056/bc1dd74dfe078e13d4109ff7f48e5361705f10a0.jpg' },
  { manhwa: 'ORV',     artist: 'saihachi06',       imageUrl: 'https://safebooru.org/images/1556/d6479fa1ffbd197831f9c34638a1c73c939310fe.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/86437013162c6b8f521f6786aec7ed353f2ad476.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/bdec3a500c346328537abcb66d7765a52a58195c.png' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/b9b6bae4433960def982040fb66c5a2b6b4a7ee5.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/81ffff3144a0f0a6d0c89bf7f10f1ef798a37e99.jpg' },
  { manhwa: 'Lookism', artist: 'kasuga_kaya',      imageUrl: 'https://safebooru.org/images/4374/24a0475d805eed179b9743b9c16f21542d771781.png' },
  { manhwa: 'Lookism', artist: 'xinlizhou8',       imageUrl: 'https://safebooru.org/images/4374/1491e8959173f4109d43750c39d217f9866c2895.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/5102fecca69e67b5e78a7d1b54a33c5415aa77eb.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/439439657853eb808195d849cbe2a4f9f7b2bfec.jpg' },
  { manhwa: 'Lookism', artist: 'kkiisscchhuu',     imageUrl: 'https://safebooru.org/images/4374/bb43d39842503c9d18eb5a6531a93d068e031e74.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/23ba30a630282df5d36ec4c1e8499f405a9f1e2b.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/1c0e9997296afe12bf17234b0896f8ba28e062fb.jpg' },
  { manhwa: 'Lookism', artist: 'harua_sorausagi',  imageUrl: 'https://safebooru.org/images/1558/288e2ea9ad930d6d06a9a38f17eb01c02efac4f4.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/c8f2367d56a3d5ddc558442c2a488c3d2420a726.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/680d263d3bbe73a3aa0bf309a2360daaf0b6de1e.jpg' },
  { manhwa: 'Lookism', artist: 'kasuga_kaya',      imageUrl: 'https://safebooru.org/images/1558/b403800b13288e54154c8abfe538fa6465099ea6.png' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/2d32ca060ec40046660779904a5958428ba790aa.jpg' },
  { manhwa: 'ORV',     artist: 'lantercat',        imageUrl: 'https://safebooru.org/images/4123/4323b45274f46cb0a1a1a7aaee2d44450bf8312b.jpg' },

  // ── This session batch (posts 40-200) ────────────────────────────────────
  // lantercat page 3 remaining
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4123/fbfa53dc1112cad9c4274208e1bf1f461ba447c2.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4123/d649b8bd2a8dfa88bfa64f1c5af25b4b70b9bcf4.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4123/8c9fec429745d7adb35f34dbb045e49b2f7dbb4b.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/1300/d622a705f2050d8beaab362699ee675f8c4da552.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/1300/d481a7e5137b5a3afe137ecea7bc0af91643ef1b.jpg' },
  // lantercat page 4
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/d4612a1858f36283bf9ffa857c23bf5373ed3b9a.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/46559ecb04e979444f2433ef4227dee3171b469f.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/4e723836eb52c33365d61ffa8df502d12ab72578.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/228ae9645133dc6d9c1e229a12b8130c6e73c630.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/504dac12d0472bab64b58776a131397ce1feb90d.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/8ed6ff62752dc1eb690e870e97b35ee884dc5fb0.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/914f101c4dab296c23c72aed7c61f219e2d0ddc0.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/dbecb4bd4a08b1a5acd38a1e05d75c9ee84a2b80.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/9a5905a43777079ca688d3319c6b3dca65db323a.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/d68b64b04b32e9fe96fe742c8ec2b3eea54944f5.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/fbe360bd2411505735ea7face7dafb1f425b0483.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/ea58f2f2ca21e68ac7bac4a481a15b63c00520e8.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/054b350af73970851272e2e0a22746f0c67a63e6.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/c9c2616d099f5d7fa63a1c7afaa38b145c034494.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/1806a399e9c193eec7ca076d2b4cef4a59832737.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/ffcaed4f228db73b793950c418af0686a77da35a.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/c6f161c9b079c35133fe22d7cbea6ea6fca23979.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/978d2a159be91900c6b9def27ecc3660dadd9673.jpg' },
  { manhwa: 'ORV', artist: 'lantercat', imageUrl: 'https://safebooru.org/images/4368/c50023762a03b3aa298c915dbd506924b3044148.jpg' },
  // saihachi06 page 3 remaining
  { manhwa: 'ORV', artist: 'saihachi06', imageUrl: 'https://safebooru.org/images/4365/e9b361bd89dcdf3671354d675ec775a5c7e49003.jpg' },
  { manhwa: 'ORV', artist: 'saihachi06', imageUrl: 'https://safebooru.org/images/4613/bfa0a53ec4e1ee98e5ad2359b4f3a7154b80160b.jpg' },
  { manhwa: 'ORV', artist: 'saihachi06', imageUrl: 'https://safebooru.org/images/4618/2824285a37682bd187dda31194d56d8db3b60976.jpg' },
  // kasuga_kaya Lookism (new)
  { manhwa: 'Lookism', artist: 'kasuga_kaya', imageUrl: 'https://safebooru.org/images/1558/3d4abb7ff8ca3a596017213647df2ff4fc8d0d19.png' },
  { manhwa: 'Lookism', artist: 'kasuga_kaya', imageUrl: 'https://safebooru.org/images/1558/1e3672f35caeef62376a2f8c2d041f752eba48cd.png' },
  { manhwa: 'Lookism', artist: 'kasuga_kaya', imageUrl: 'https://safebooru.org/images/1558/e77e904714969047782a97c023ec0ee1c6d4b3a5.png' },
  // ibsm Lookism
  { manhwa: 'Lookism', artist: 'ibsm', imageUrl: 'https://safebooru.org/images/1558/57dae138b514a5256bb42eaa5c69dabdcec21264.jpg' },
  { manhwa: 'Lookism', artist: 'ibsm', imageUrl: 'https://safebooru.org/images/1558/a51b6e166878e15edbd3c3c6f37b413af0b5c17c.png' },
  { manhwa: 'Lookism', artist: 'ibsm', imageUrl: 'https://safebooru.org/images/1302/8d0e78d453d5d441dfecc08e54e9226e62a0483d.png' },
  // so_boio, xinlizhou8 Lookism
  { manhwa: 'Lookism', artist: 'so_boio',    imageUrl: 'https://safebooru.org/images/1302/44d7951b0d8c3fd85a90bec573e7e586d4eabc6c.jpg' },
  { manhwa: 'Lookism', artist: 'xinlizhou8', imageUrl: 'https://safebooru.org/images/1302/34a1fd266cf46c7af16a3edfb048f29ea0cc0be3.jpg' },
  { manhwa: 'Lookism', artist: 'xinlizhou8', imageUrl: 'https://safebooru.org/images/1046/e227ff83608a6c79a137964db56d150734b868f3.jpg' },
  // gtjedah Lookism
  { manhwa: 'Lookism', artist: 'gtjedah', imageUrl: 'https://safebooru.org/images/1046/05ed1958968812f191aaf6d6b182e0fffa7245bc.jpg' },
  { manhwa: 'Lookism', artist: 'gtjedah', imageUrl: 'https://safebooru.org/images/1046/ad886d136958b5a75eeab362bc35a4c27c45b401.jpg' },
  { manhwa: 'Lookism', artist: 'gtjedah', imageUrl: 'https://safebooru.org/images/1046/30c75b5951d90baf22c355939e242ef61868b372.jpg' },
  // iljinsae30735, omuteri Lookism
  { manhwa: 'Lookism', artist: 'iljinsae30735', imageUrl: 'https://safebooru.org/images/1046/eddb803a368e72d39e3c2cd19905390036ef85f2.jpg' },
  { manhwa: 'Lookism', artist: 'iljinsae30735', imageUrl: 'https://safebooru.org/images/1046/baf2b6d77efebde9037fbd33fce65d045c91531c.jpg' },
  { manhwa: 'Lookism', artist: 'omuteri',       imageUrl: 'https://safebooru.org/images/1046/42465b8710e1407bffc426d5c8423c711684a227.jpg' },
  // eterorca Lookism
  { manhwa: 'Lookism', artist: 'eterorca', imageUrl: 'https://safebooru.org/images/790/2cc372c993bc3bced8eadbc176f7e3f3322e5a37.jpg' },
  { manhwa: 'Lookism', artist: 'eterorca', imageUrl: 'https://safebooru.org/images/790/04603e59683a043e0918ad6011f611cf001b3bd9.jpg' },
  { manhwa: 'Lookism', artist: 'eterorca', imageUrl: 'https://safebooru.org/images/790/c8543523bf56a4114aba82262062c63009d19318.jpg' },
  // gensakuu, zigaziggxl, anjanikorry Lookism
  { manhwa: 'Lookism', artist: 'gensakuu',    imageUrl: 'https://safebooru.org/images/790/303b6f112bcf2c4a1fe51d57307faa77865bd0dd.jpg' },
  { manhwa: 'Lookism', artist: 'zigaziggxl',  imageUrl: 'https://safebooru.org/images/790/ed34915e3bee05015e1455acbf52e4abdae90a50.jpg' },
  { manhwa: 'Lookism', artist: 'zigaziggxl',  imageUrl: 'https://safebooru.org/images/790/c8d3692141f5b05909c39afb008370d218e908cb.jpg' },
  { manhwa: 'Lookism', artist: 'anjanikorry', imageUrl: 'https://safebooru.org/images/790/e734e426f672be8e0e3f2f4669defe6414f57b64.jpg' },
  { manhwa: 'Lookism', artist: 'gensakuu',    imageUrl: 'https://safebooru.org/images/790/5b2328bc569a677562df5205a6c9086c13fc8996.jpg' },
  // wei_inn ORV (page 3)
  { manhwa: 'ORV', artist: 'wei_inn', imageUrl: 'https://safebooru.org/images/811/d58c4e68b9035bb448dce6877ae25dc80095941a.jpg' },
  { manhwa: 'ORV', artist: 'wei_inn', imageUrl: 'https://safebooru.org/images/811/277102b28ae3e568cb6bf0b7643d78f22b3300a1.jpg' },
  { manhwa: 'ORV', artist: 'wei_inn', imageUrl: 'https://safebooru.org/images/811/9fec1a7237269f1994291e064291d8c09794bb2c.jpg' },
  { manhwa: 'ORV', artist: 'wei_inn', imageUrl: 'https://safebooru.org/images/811/bf04052fe33f003eaf5313734302dd3ac9a030a8.jpg' },
  { manhwa: 'ORV', artist: 'wei_inn', imageUrl: 'https://safebooru.org/images/811/b36d26b30d2af96465bb9329aa0a7a8258861956.jpg' },
  { manhwa: 'ORV', artist: 'wei_inn', imageUrl: 'https://safebooru.org/images/811/edf903534aba846067da2deba93d0c8d61dbd6ea.jpg' },
  { manhwa: 'ORV', artist: 'wei_inn', imageUrl: 'https://safebooru.org/images/811/6f261c12edc0ec0b0905d03af8bfd27cd11a628e.jpg' },
  { manhwa: 'ORV', artist: 'wei_inn', imageUrl: 'https://safebooru.org/images/811/533daa463ab5c0fd527458ab84bae43355cd3ac3.jpg' },
  { manhwa: 'ORV', artist: 'wei_inn', imageUrl: 'https://safebooru.org/images/811/b458cde7fc7d55e2c81a3d3de39f01bb32ceadd1.jpg' },
  { manhwa: 'ORV', artist: 'wei_inn', imageUrl: 'https://safebooru.org/images/811/4399a2abd484eb79f495e4fdc71321d628548151.jpg' },
  { manhwa: 'ORV', artist: 'wei_inn', imageUrl: 'https://safebooru.org/images/811/3232a901f8f7706bef0a056f0deb28fe68c39ea1.jpg' },
  { manhwa: 'ORV', artist: 'wei_inn', imageUrl: 'https://safebooru.org/images/811/e9f05c2580869e210addb5882f81efbe331f309e.jpg' },
  { manhwa: 'ORV', artist: 'wei_inn', imageUrl: 'https://safebooru.org/images/811/5d1f8161c3d377a8fd4a9c051ced8fa4ffac43d5.jpg' },
  { manhwa: 'ORV', artist: 'wei_inn', imageUrl: 'https://safebooru.org/images/811/a19ae618aea3c108a0629557dfdab47d2c5ef9d8.jpg' },
  // maga_mok23, eonsuena, papercider, 8612starreader ORV
  { manhwa: 'ORV', artist: 'maga_mok23',       imageUrl: 'https://safebooru.org/images/299/789b39824f71b8a6fa4ecf886bbf384ad4786eed.jpg' },
  { manhwa: 'ORV', artist: 'maga_mok23',       imageUrl: 'https://safebooru.org/images/299/b7f5be8cb95c510e9b719259f22b3432092a4ef9.jpg' },
  { manhwa: 'ORV', artist: 'eonsuena',         imageUrl: 'https://safebooru.org/images/299/7193af2c260a74444160b5e458ccc488a0c68364.jpg' },
  { manhwa: 'ORV', artist: 'papercider',       imageUrl: 'https://safebooru.org/images/299/3f43f82cb932ce10b6ff09ba4e5411257ae132ff.jpg' },
  { manhwa: 'ORV', artist: '8612starreader',   imageUrl: 'https://safebooru.org/images/43/3f197f7736a1454e0270910ce6d440cc06b89b24.jpg' },
  { manhwa: 'ORV', artist: '8612starreader',   imageUrl: 'https://safebooru.org/images/43/494f0c5669670706b17fdaf0020bcd2988d56880.jpg' },
  { manhwa: 'ORV', artist: '8612starreader',   imageUrl: 'https://safebooru.org/images/43/091b745f975677f5720773646ed76942e6dc68a2.jpg' },
  { manhwa: 'ORV', artist: '8612starreader',   imageUrl: 'https://safebooru.org/images/43/8dcbef2362a9a8ea4668ff6069c87fd5bd4c4164.jpg' },
  { manhwa: 'ORV', artist: '8612starreader',   imageUrl: 'https://safebooru.org/images/43/dcb34b4e5d552142fff8aa86fd5f3e09c9a5ff8a.jpg' },
  { manhwa: 'ORV', artist: '8612starreader',   imageUrl: 'https://safebooru.org/images/43/04ceb312f156d71eca9e75f7215f6d370197ff79.jpg' },
  { manhwa: 'ORV', artist: '8612starreader',   imageUrl: 'https://safebooru.org/images/43/1e572263167e49da581e5fe24aba9501304b27d3.jpg' },
  // rc_dec, vacation_town, milo59950, evie_baoxiao, choung_choung, zco111, yu_shiro_ki, tawhirl ORV
  { manhwa: 'ORV', artist: 'rc_dec',         imageUrl: 'https://safebooru.org/images/4394/2f1acd61128b4a68d03006190e474b40ee0fcbb7.jpg' },
  { manhwa: 'ORV', artist: 'vacation_town',  imageUrl: 'https://safebooru.org/images/4394/01cdb4bfe386eeeff12b09cec6ca696e4d0d1f61.jpg' },
  { manhwa: 'ORV', artist: 'vacation_town',  imageUrl: 'https://safebooru.org/images/4394/e10224a74c689b3193ffb2852b079a9bab1592cb.jpg' },
  { manhwa: 'ORV', artist: 'vacation_town',  imageUrl: 'https://safebooru.org/images/4394/b5e0c03b1513f93cd08c80603073973a14d214ac.jpg' },
  { manhwa: 'ORV', artist: 'vacation_town',  imageUrl: 'https://safebooru.org/images/4394/45119cd1342b404756795ab1eb41c1dc1747984d.jpg' },
  { manhwa: 'ORV', artist: 'milo59950',      imageUrl: 'https://safebooru.org/images/3882/853ad3f5e38c198a7297616f0d197aa28f7c4d7a.jpg' },
  { manhwa: 'ORV', artist: 'evie_baoxiao',   imageUrl: 'https://safebooru.org/images/1066/4c9eeb2a575cc90e7119bdd80fd6d5ff594a59f2.jpg' },
  { manhwa: 'ORV', artist: 'choung_choung',  imageUrl: 'https://safebooru.org/images/810/756e5577351a7166048f81e28c4808cdb587e92f.jpg' },
  { manhwa: 'ORV', artist: 'zco111',         imageUrl: 'https://safebooru.org/images/298/17fdeb192a40b6cb70ab114d75f676faea24a17e.jpg' },
  { manhwa: 'ORV', artist: 'yu_shiro_ki',    imageUrl: 'https://safebooru.org/images/42/391db53344f20e628adb51a157aa8c4c2d86a4ef.jpg' },
  { manhwa: 'ORV', artist: 'tawhirl',        imageUrl: 'https://safebooru.org/images/42/9534fbb77fe2e01215397f8161e4b01d3c3d6def.png' },
  // guomukaoya97, breathing742105 ORV
  { manhwa: 'ORV', artist: 'guomukaoya97',    imageUrl: 'https://safebooru.org/images/4393/15004a17b9b78c0648a67069e00fd44706acee94.jpg' },
  { manhwa: 'ORV', artist: 'guomukaoya97',    imageUrl: 'https://safebooru.org/images/4393/4459a7f4ec0694f1dc95145d14c78afb29451762.jpg' },
  { manhwa: 'ORV', artist: 'guomukaoya97',    imageUrl: 'https://safebooru.org/images/4393/a05ee828bd8b1de7f1505b91e109e2c0bd3021e9.jpg' },
  { manhwa: 'ORV', artist: 'breathing742105', imageUrl: 'https://safebooru.org/images/4393/94a10dee78bfb8c995c81815eea886750fac98d0.jpg' },
  { manhwa: 'ORV', artist: 'guomukaoya97',    imageUrl: 'https://safebooru.org/images/4393/edc7aa96de170506e5596902739efca2a0860904.jpg' },
  { manhwa: 'ORV', artist: 'guomukaoya97',    imageUrl: 'https://safebooru.org/images/4393/466af79c3472564ece4ea0cb8f90f7ddb9fa53cc.jpg' },
  // zero_q_0q, lumolyv ORV (page 4)
  { manhwa: 'ORV', artist: 'zero_q_0q', imageUrl: 'https://safebooru.org/images/1321/240857cc1cdae2063721932901537cbf9c152bd9.jpg' },
  { manhwa: 'ORV', artist: 'zero_q_0q', imageUrl: 'https://safebooru.org/images/1321/e11faad0ba493181f4aabb4192d93865abd239c4.jpg' },
  { manhwa: 'ORV', artist: 'lumolyv',   imageUrl: 'https://safebooru.org/images/1321/3c665e8ebc369a6f8f80c48940f3d825a4d926b0.jpg' },
  { manhwa: 'ORV', artist: 'lumolyv',   imageUrl: 'https://safebooru.org/images/1321/a97be2cc09666b122654a10ee122a1514f6b06b4.jpg' },
  { manhwa: 'ORV', artist: 'lumolyv',   imageUrl: 'https://safebooru.org/images/1321/60c1c93f232c95e70efca73db33125afec7e149b.jpg' },
  { manhwa: 'ORV', artist: 'lumolyv',   imageUrl: 'https://safebooru.org/images/1321/f7d9b7f72f439b394e97fe5e9b5053237ab0c585.jpg' },
  // sion_428 ORV (large batch)
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/c988d06c5c22b34d41fe93d624f20dd9d71a887d.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/9baa86e002b28464cd58124471d83f3f7e595c35.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/5716a1f0898211a9d26ca657ef4d316aca904927.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/63255bc2fdfb6b65bc9dc779c1d236f795d59e62.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/d8a0a43f44d6ca5939cce8e60f41788d0ecd68df.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/879c44b6ae9aefe1a2feefed1ace3a0c23d59370.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/ccdf77ad118aa863556deb6e2627e30f27608207.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/92858d9174b8cb652f32c753f62ef6bff3c18109.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/b1a5bdeca0e4582b161de6e4f6e67b964eceffa3.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/2d0ae99994afb0d00bc45bf84e997b2ecb13c9dd.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/005c0447ce0497203c932455f1ae6b2718684329.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/48ca655dfd8b2eb56629a02f653b21820f2480c3.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/6183dd9f84eefcee425a3562a545079fd0ed7917.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/d5f61a1d65c61eb1d3035d8d8321f591ef079f26.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/295449bbf0e88524f6f3baf96d226e290daef8f6.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/41380a7d601d556dd5cfa2ad5504073bbb3615d4.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/4274e81a858d585683925b8ed890f4778db84c1d.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/340fccdda13193ed8d63de0039d5b63bd8628add.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/00169de7cb891615d9678d5d654e623bae2d7c48.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/ac76f419963d10130722e76f66da520f8057bb18.jpg' },
  { manhwa: 'ORV', artist: 'sion_428', imageUrl: 'https://safebooru.org/images/1321/58f0e0f2ac5c461d7d64c3c73c785de93b093f95.jpg' },
  // typo_koneko, papercider (more), sion_428 mixed ORV
  { manhwa: 'ORV', artist: 'typo_koneko', imageUrl: 'https://safebooru.org/images/1321/3a7fabd09da38771123c524bc01650d37ea7e0a9.jpg' },
  { manhwa: 'ORV', artist: 'papercider',  imageUrl: 'https://safebooru.org/images/1321/67cd9bec113d9b90e404c0bf6c180e5add88fa89.png' },
  { manhwa: 'ORV', artist: 'sion_428',   imageUrl: 'https://safebooru.org/images/1321/de6d6581811ac3f4ea8b3195598770d7323ef761.jpg' },
  { manhwa: 'ORV', artist: 'papercider',  imageUrl: 'https://safebooru.org/images/1321/9aba7ade9657d3e88bfc996741090364f085eb71.jpg' },
  { manhwa: 'ORV', artist: 'papercider',  imageUrl: 'https://safebooru.org/images/1321/42eda1903d2ab436ab62ba0be9c942fb5febe771.jpg' },
  { manhwa: 'ORV', artist: 'papercider',  imageUrl: 'https://safebooru.org/images/1321/7b82ca055eb3c35e3e89cadabbf008c1924c1fc2.jpg' },
  { manhwa: 'ORV', artist: 'papercider',  imageUrl: 'https://safebooru.org/images/1321/63c7e63c162648be8d0a2466a54cd44c27ca7bde.jpg' },
  { manhwa: 'ORV', artist: 'papercider',  imageUrl: 'https://safebooru.org/images/1321/ebab7ccd0eedba31931bb1916cafdb8d6fdd0c2f.jpg' },
  { manhwa: 'ORV', artist: 'papercider',  imageUrl: 'https://safebooru.org/images/1321/b3faadc731315f127aa6f21cc3442ca87a5fff11.jpg' },
  // jpqaa5 ORV
  { manhwa: 'ORV', artist: 'jpqaa5', imageUrl: 'https://safebooru.org/images/1321/1cab8bbc4de1158208b336d2fd09ca94c3c758c8.jpg' },
  { manhwa: 'ORV', artist: 'jpqaa5', imageUrl: 'https://safebooru.org/images/1321/0cf6dddb6bd81e14b8fb7666ca7a1b76da34904a.jpg' },
  { manhwa: 'ORV', artist: 'papercider', imageUrl: 'https://safebooru.org/images/1321/235452106f8e0837eacafae78aba3d08aa710567.jpg' },
  { manhwa: 'ORV', artist: 'papercider', imageUrl: 'https://safebooru.org/images/1321/c0a93e02a576772fc7901a686b9c7fa67d760a02.png' },
  { manhwa: 'ORV', artist: 'papercider', imageUrl: 'https://safebooru.org/images/1321/880fea3f31c0c11e0d36e3d73ae14e4c00aad3a3.jpg' },
  { manhwa: 'ORV', artist: 'papercider', imageUrl: 'https://safebooru.org/images/1321/3f0cd74237f7d66d0187846593165b35426f893f.jpg' },
  { manhwa: 'ORV', artist: 'jpqaa5',    imageUrl: 'https://safebooru.org/images/1321/6a199662f400985d073629e7c238e3b08bfff642.jpg' },
  { manhwa: 'ORV', artist: 'jpqaa5',    imageUrl: 'https://safebooru.org/images/1321/e1b40026db7c07a4bc3ee33a88e82d32aea4384e.jpg' },
  // lumolyv ORV (page 5)
  { manhwa: 'ORV', artist: 'lumolyv', imageUrl: 'https://safebooru.org/images/1321/2ad4b4ddc6c3aae1921e09f9fd4e93fe1d483544.jpg' },
  { manhwa: 'ORV', artist: 'lumolyv', imageUrl: 'https://safebooru.org/images/1321/9fc92f34c5d68f64233aaf829fe9410839be9fe4.jpg' },
  { manhwa: 'ORV', artist: 'lumolyv', imageUrl: 'https://safebooru.org/images/1321/4819e29d0d4632124f841765c64a3023aaa90285.jpg' },
  { manhwa: 'ORV', artist: 'lumolyv', imageUrl: 'https://safebooru.org/images/1321/edc2ff7c3fdc8158a1638c8df3482c51a6d4c855.jpg' },
  { manhwa: 'ORV', artist: 'lumolyv', imageUrl: 'https://safebooru.org/images/1321/8a2d68f1ccc1646444634ea3d90c844772567a25.jpg' },
  { manhwa: 'ORV', artist: 'lumolyv', imageUrl: 'https://safebooru.org/images/1321/20968e4c26b440f82f2717b61d56752786e91356.jpg' },
  { manhwa: 'ORV', artist: 'lumolyv', imageUrl: 'https://safebooru.org/images/1321/9e7dfefb0c0d5b137768d098382429f2ae09a60e.jpg' },
  { manhwa: 'ORV', artist: 'lumolyv', imageUrl: 'https://safebooru.org/images/1321/a414585a2ba9a82333144c322d96016109c9f09c.jpg' },
  { manhwa: 'ORV', artist: 'lumolyv', imageUrl: 'https://safebooru.org/images/1321/958a2cdca90fd4caaa4bf044bfa7d6b5d43a8fe6.jpg' },
  // wangwanghan0723, eyesoffyou0003 ORV
  { manhwa: 'ORV', artist: 'wangwanghan0723', imageUrl: 'https://safebooru.org/images/1321/9f32defaeeb1fbf2243bc21384c003765c0abe29.png' },
  { manhwa: 'ORV', artist: 'eyesoffyou0003',  imageUrl: 'https://safebooru.org/images/1065/735e6209e078053b54c376f6778e597cfa147099.jpg' },
  { manhwa: 'ORV', artist: 'eyesoffyou0003',  imageUrl: 'https://safebooru.org/images/1065/05295a6d56a698d3e089349f339e4a8ca1b4f0d9.jpg' },
  // dalchi09, areuwuu ORV (page 5-6)
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/d9b6f1b6d451a71ebf6fc80391a6cc525a6c01b2.jpg' },
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/5cbc729fabf52ddc50386fb4fe0e0055ba4f5ce9.jpg' },
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/1b76acf7d19d53760a344f0361579cf2b97280a9.jpg' },
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/c0572b422e9eeecd360aec43bd3bb145636e821a.jpg' },
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/cfadf03d7ca35b4f996d8e22de36e2e9d8ed058d.jpg' },
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/f7a2e62c14e71aa1a6e26518866fcae374d519b6.jpg' },
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/cd899d49c3bb49ddf3243526f1028a80c87b0481.jpg' },
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/5f47ee86246802c2e4d4f8cd912689ae2966d6e8.jpg' },
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/17d7f63238c439a01ad2759df781cdf856113a42.jpg' },
  { manhwa: 'ORV', artist: 'areuwuu',  imageUrl: 'https://safebooru.org/images/1065/47964c0bf9533a61d0ac31b82823a2b10a0f636d.jpg' },
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/1bc60c89ac03aff18d7880df344a8518e326ceae.jpg' },
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/8380b60fc7ac3fb971bb1e2afb725e3b77991e21.jpg' },
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/ca8a62883998ade36a9faacc928f310b30f57d3b.jpg' },
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/9deb9a0946f173f7734c69385f4a1a9426cf976f.jpg' },
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/4618ea31369a5e45938c3d54e522bed1f476dc65.jpg' },
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/d6c66668eeb110f945c9d782c1051c17a55aadcd.jpg' },
  { manhwa: 'ORV', artist: 'dalchi09', imageUrl: 'https://safebooru.org/images/1065/a6cecc1d7dcf8cca1310718af7ae194171eb0136.jpg' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MANHWA_SEARCH: Record<string, string> = {
  ORV: 'Omniscient Reader',
  Lookism: 'Lookism',
}

function randomLikes(): number {
  const roll = Math.random()
  if (roll < 0.4) return Math.floor(Math.random() * 30) + 5
  if (roll < 0.75) return Math.floor(Math.random() * 120) + 30
  if (roll < 0.92) return Math.floor(Math.random() * 400) + 150
  return Math.floor(Math.random() * 1200) + 500
}

function randomDate(maxDaysAgo: number): Date {
  const ms = Math.random() * maxDaysAgo * 24 * 60 * 60 * 1000
  return new Date(Date.now() - ms)
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Starting fan art seed batch 2 (${FAN_ARTS.length} entries)...`)

  // Reuse or create curator user
  const curatorEmail = 'gallery.seed@manhwaverse.internal'
  let curator = await prisma.user.findFirst({ where: { email: curatorEmail } })

  if (!curator) {
    const now = new Date()
    curator = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: curatorEmail,
        username: 'mw_gallery',
        display_name: 'ManhwaVerse Gallery',
        is_seed: true,
        is_artist: true,
        updated_at: now,
      },
    })
    console.log(`Created curator user: ${curator.username}`)
  } else {
    console.log(`Using existing curator user: ${curator.username}`)
  }

  // Cache manhwa IDs
  const manhwaCache: Record<string, string | null> = {}
  for (const key of Object.keys(MANHWA_SEARCH)) {
    const manhwa = await prisma.manhwa.findFirst({
      where: { title_en: { contains: MANHWA_SEARCH[key], mode: 'insensitive' } },
      select: { id: true, title_en: true },
    })
    manhwaCache[key] = manhwa?.id ?? null
    console.log(`Manhwa "${key}" → ${manhwa ? manhwa.title_en : 'NOT FOUND'}`)
  }

  // Insert posts
  let inserted = 0
  let skipped = 0
  let duplicate = 0

  for (const entry of FAN_ARTS) {
    const manhwaId = manhwaCache[entry.manhwa]
    if (!manhwaId) {
      console.warn(`  SKIP (no manhwa): ${entry.manhwa} — ${entry.imageUrl}`)
      skipped++
      continue
    }

    const artist = ARTISTS[entry.artist]
    if (!artist) {
      console.warn(`  SKIP (unknown artist): ${entry.artist}`)
      skipped++
      continue
    }

    // Check for duplicate image URL
    const existing = await prisma.fanArtImage.findFirst({
      where: { image_url: entry.imageUrl },
    })
    if (existing) {
      duplicate++
      continue
    }

    const title = `${artist.displayName} — ${entry.manhwa} fan art`
    const tags = [entry.manhwa.toLowerCase().replace(/\s+/g, '_'), entry.artist]
    const createdAt = randomDate(180)

    try {
      const post = await prisma.fanArtPost.create({
        data: {
          id: randomUUID(),
          user_id: curator.id,
          manhwa_id: manhwaId,
          title,
          description: null,
          is_original: false,
          credit_name: artist.displayName,
          credit_url: artist.socialUrl,
          is_nsfw: false,
          tags,
          like_count: randomLikes(),
          comment_count: 0,
          view_count: Math.floor(Math.random() * 2000) + 50,
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
      if (inserted % 25 === 0) console.log(`  ${inserted} posts inserted...`)
    } catch (err) {
      console.error(`  ERROR inserting ${entry.imageUrl}:`, err)
      skipped++
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Duplicates skipped: ${duplicate}, Errors/skipped: ${skipped}`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
