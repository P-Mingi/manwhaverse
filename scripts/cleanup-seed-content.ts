// /scripts/cleanup-seed-content.ts
// Cleans up seed community content to look more human:
//   1. Deletes 80% of seed reviews (keeps short micro reviews)
//   2. Rewrites remaining reviews to sound more natural
//   3. Updates seed user usernames with realistic-looking handles
//
// Usage: npx tsx scripts/cleanup-seed-content.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Realistic username pool ───────────────────────────────────────────────

const REALISTIC_USERNAMES: string[] = [
  // First name + numbers (EN)
  'alex94', 'alex_97', 'alex2001', 'alex_m', 'its_alex',
  'sam_reads', 'sam94', 'sam_k', 'sams_tab',
  'jake94', 'jake_r', 'jakewatches', 'jake2002',
  'mike97', 'mike_j', 'mikey_reads', 'mikeee',
  'tom99', 'tom_b', 'tomcruise_no', 'tommy_reads',
  'emma97', 'emma_k', 'emma2003', 'emmanotbovary',
  'anna94', 'anna_m', 'annabanana', 'anna_reads',
  'kate99', 'kate_j', 'kateee', 'katereads',
  'lily2001', 'lily_r', 'lilypad', 'lil_reads',
  'max_94', 'max2000', 'maxpower_no', 'maxxy',
  'leo99', 'leo_b', 'leo2003', 'leoreads',
  'jay_reads', 'jay94', 'jay_k', 'jay2002',
  'ryan97', 'ryan_m', 'ryanair_lol', 'ryan2001',
  'matt99', 'matt_r', 'mattreads', 'matt2002',
  'lucas94', 'lucas_b', 'lucasss', 'lucas2001',
  'noah97', 'noah_k', 'noahreads', 'noah2003',
  'liam99', 'liam_m', 'liamreads', 'liam2002',
  'zoe_94', 'zoe_reads', 'zoe2001', 'zoeee',
  'mia_reads', 'mia97', 'mia2002', 'mia_k',
  'ava99', 'ava_r', 'avareads', 'ava2001',
  'ella94', 'ella_m', 'ellareads', 'ella2003',
  'nate97', 'nate_k', 'natereads', 'nate2001',
  'owen94', 'owen_r', 'owenreads', 'owen99',
  'evan97', 'evan_b', 'evanreads', 'evan2002',
  'kyle99', 'kyle_m', 'kylereads', 'kyle2001',
  'sean94', 'sean_r', 'seanreads', 'sean2003',
  'finn97', 'finn_k', 'finnreads', 'finn2001',
  'cole99', 'cole_b', 'colereads', 'cole2002',
  'drew94', 'drew_m', 'drewreads', 'drew97',
  'zach99', 'zach_r', 'zachreads', 'zach2001',
  'kai97', 'kai_reads', 'kai2002', 'kai_b',
  'ash94', 'ash_reads', 'ash2001', 'ash_m',
  'axel99', 'axel_r', 'axelreads', 'axel2002',
  'remy97', 'remy_k', 'remyreads', 'remy2001',
  'jax94', 'jax_reads', 'jax2001', 'jax_b',
  'ace99', 'ace_reads', 'ace2002', 'ace_m',
  'rio97', 'rio_reads', 'rio2001', 'rio_k',
  'quinn94', 'quinn_reads', 'quinn2002', 'quinn_r',
  'reed99', 'reed_reads', 'reed2001', 'reed_b',
  'cruz97', 'cruz_reads', 'cruz2002', 'cruz_m',
  'lane94', 'lane_reads', 'lane2001', 'lane_k',
  'tate99', 'tate_reads', 'tate2002', 'tate_r',
  'bram97', 'bram_reads', 'bram2001', 'bram_b',
  'dex94', 'dex_reads', 'dex2002', 'dex_m',
  'wolf99', 'wolf_reads', 'wolf2001', 'wolf_k',

  // First name + last initial (EN)
  'alex_s', 'alex_j', 'alex_p', 'alex_l',
  'chris_k', 'chris_m', 'chris_b', 'chris_r',
  'james_r', 'james_k', 'james_m', 'james_b',
  'david_l', 'david_m', 'david_k', 'david_r',
  'sarah_j', 'sarah_m', 'sarah_b', 'sarah_l',
  'jessica_k', 'jessica_m', 'jessica_r',
  'emily_k', 'emily_m', 'emily_r', 'emily_b',
  'sophie_k', 'sophie_m', 'sophie_r', 'sophie_b',

  // Casual/natural handles (EN)
  'its_emma', 'its_mia', 'its_leo', 'its_tom', 'its_sam',
  'its_jake', 'its_max', 'its_noah', 'its_ryan', 'its_kate',
  'justmike', 'justalex', 'justsam', 'justjake', 'justnoah',
  'notjustflex', 'notjakegyllenhaal', 'nottheathletics',
  '_alex_', '_mia_', '_emma_', '_tom_', '_leo_',
  'xalexxx', 'xemmax', 'xtomx', 'xsamx', 'xleox',
  'sleepyreader', 'tired_reader', 'lazybookworm', 'night_reader',
  'coffee_reads', 'tea_and_manga', 'reading_at_3am', 'bored_reader',
  '3am_reader', 'always_reading', 'cant_stop_reading', 'one_more_ch',
  'no_sleep_club', 'chapter_addict', 'insomniac_reads', 'dark_mode_reader',
  'phone_addict_reads', 'wifi_reader', 'commute_reads', 'toilet_reads',
  'weirdly_obsessed', 'just_vibing', 'average_joe_reads', 'regular_enjoyer',

  // Short/minimal (EN)
  'alx94', 'smth_reads', 'rndom_acc', 'jst_reading', 'basicreader',
  'plainreader', 'nobody_here', 'anon_reader', 'guest_reader',
  'user_9472', 'user_3847', 'user_7162', 'user_5523',
  'acc_n_reads', 'tmpaccount', 'justbrowsing_k',

  // Gen Z style (EN)
  'luvreading', 'readingg', 'bookluvr', 'mangazz', 'webtoonz',
  'pagegirl99', 'pageboy99', 'mangagirlll', 'mangaboyyyy',
  'readingismything', 'obsessedw_manga', 'cant_relate_lol',
  'thisismydumpster', 'notmymainaccount', 'throwawayleaks',
  'readingforever_fr', 'totallynotanalt',

  // French first names + numbers
  'thomas94', 'thomas_m', 'thomas2001', 'thomas_k', 'thomas97',
  'lucas_fr', 'lucas_d', 'lucas2002', 'lucasreads', 'lucas_v',
  'leo_fr', 'leo_d', 'leo_martin', 'leo2003', 'leo_bernard',
  'mathieu94', 'mathieu_k', 'mathieu2001', 'mathieu_r',
  'alex_fr', 'alexandre_m', 'alexandre94', 'alex_paris',
  'nicolas97', 'nico_reads', 'nico_m', 'nicolas2001',
  'pierre_d', 'pierre_m', 'pierre_fr', 'pierre2001', 'pierre99',
  'antoine94', 'antoine_r', 'antoinereads', 'antoine2002',
  'baptiste97', 'baptiste_m', 'baptiste_fr', 'baptiste2001',
  'julien94', 'julien_k', 'julienreads', 'julien2002',
  'maxime_fr', 'maxime_d', 'maxime2001', 'maxime97', 'maxime_r',
  'theo_fr', 'theo_reads', 'theo2003', 'theo_m', 'theo97',
  'hugo_d', 'hugo_fr', 'hugoreads', 'hugo2002', 'hugo_m',
  'romain94', 'romain_k', 'romainreads', 'romain2001',
  'clement97', 'clement_m', 'clementreads', 'clement_fr',
  'louis_d', 'louisreads', 'louis_fr', 'louis2002', 'louis97',
  'nathan_fr', 'nathan_m', 'nathanreads', 'nathan2001', 'nathan94',
  'paul_fr', 'paul_reads', 'paul_m', 'paul2002', 'paul97',
  'gabriel_fr', 'gabriel_m', 'gabrielreads', 'gabriel2001',
  'valentin94', 'valentin_m', 'valentinreads', 'valentin2002',
  'camille_fr', 'camille_d', 'camillereads', 'camille2001', 'camille_m',
  'margot_fr', 'margot_d', 'margotreads', 'margot2001', 'margot97',
  'pauline_fr', 'pauline_m', 'paulinereads', 'pauline2001',
  'marie_fr', 'marie_d', 'mariereads', 'marie2001', 'marie97',
  'emma_fr', 'emma_d', 'emmareads_fr', 'emma2002',
  'chloe_fr', 'chloe_d', 'chloereads', 'chloe2001', 'chloe97',
  'lea_fr', 'lea_d', 'leareads', 'lea2002', 'lea_m',
  'manon_fr', 'manon_d', 'manonreads', 'manon2001', 'manon97',
  'lucie_fr', 'lucie_d', 'luciereads', 'lucie2001',
  'alice_fr', 'alice_d', 'alicereads', 'alice2002', 'alice97',
  'jade_fr', 'jade_reads', 'jade_d', 'jade2001', 'jade_m',
  'eva_fr', 'eva_reads', 'eva_d', 'eva2001', 'eva97',
  'lena_fr', 'lena_reads', 'lena_d', 'lena2002',
  'zoe_fr', 'zoe_d', 'zoereads_fr', 'zoe2003',
  'clara_fr', 'clara_d', 'clarareads', 'clara2001', 'clara97',
  'elisa_fr', 'elisa_d', 'elisareads', 'elisa2002',
  'julie_fr', 'julie_d', 'juliereads', 'julie2001', 'julie97',
  'sophie_fr', 'sophie_d', 'sophiereads', 'sophie2002',
  'laura_fr', 'laura_d', 'laurareads', 'laura2001',
  'charlotte_fr', 'charlotte_d', 'charlottereads', 'charlotte97',
  'ines_fr', 'ines_reads', 'ines_d', 'ines2001',
  'nina_fr', 'nina_reads', 'nina_d', 'nina2002',

  // French casual handles
  'lecteur_fou', 'lecteurfr', 'lirefr', 'webtoon_fr',
  'bouquineur94', 'mangaparisien', 'bddigitale', 'toontoon_fr',
  'liseur_du_metro', 'lecture_nocturne', 'nuit_blanche_reads',
  'cafe_et_manga', 'the_et_webtoon', 'mec_qui_lit',
  'fille_qui_lit', 'lecteur_lambda', 'lecteur_du_dimanche',
  'accro_aux_chapitres', 'encore_un_chapitre', 'un_de_plus',
  'pagesfolles', 'lireouriire', 'lisonsensemble',
  'parisien_lit', 'lyonnais_lit', 'marseillais_lit',
  'bordelais_lit', 'nantais_lit', 'strasbourglit',
  'fan_de_webtoon', 'passionnemanga', 'addictlecture',

  // Common last-name-style handles
  'rj_reads', 'mk_reads', 'jb_reads', 'al_reads', 'sk_reads',
  'tm_reads', 'ch_reads', 'nb_reads', 'lk_reads', 'pr_reads',
  'vm_reads', 'dr_reads', 'fp_reads', 'gw_reads', 'hs_reads',

  // Hobby + number combos
  'reader_2001', 'reader_94', 'reader_99', 'reader_2003',
  'manga_fan_97', 'manga_fan_99', 'manga_fan_2001',
  'webtoon_99', 'webtoon_94', 'webtoon_2001',
  'bookworm_97', 'bookworm_99', 'bookworm_2001',
  'nightowl_reads', 'earlybird_reads', 'insomniac_99',

  // Adjective + noun combos
  'lazy_penguin', 'quick_fox', 'dark_wolf', 'silent_spark',
  'broken_pen', 'ocean_eyes', 'tired_fox', 'cloudy_moon',
  'dusty_pages', 'ink_fingers', 'late_night_k', 'early_morning_r',
  'digital_nomad_reads', 'random_human_99', 'generic_account',
  'basic_user_k', 'normal_person_r', 'typical_reader',

  // More EN names
  'eli_reads', 'eli_k', 'eli2001', 'eli94',
  'eli_m', 'elijah_r', 'elijah2001', 'elijah97',
  'caleb_reads', 'caleb_r', 'caleb2001', 'caleb97',
  'hunter_reads', 'hunter_r', 'hunter2001',
  'carter_reads', 'carter_r', 'carter97',
  'tyler_reads', 'tyler_r', 'tyler2001', 'tyler94',
  'dylan_reads', 'dylan_r', 'dylan2001',
  'derek_reads', 'derek_r', 'derek97',
  'marcus_reads', 'marcus_r', 'marcus2001', 'marcus94',
  'ethan_reads', 'ethan_r', 'ethan2001', 'ethan97',
  'aiden_reads', 'aiden_r', 'aiden2001',
  'mason_reads', 'mason_r', 'mason97',
  'logan_reads', 'logan_r', 'logan2001', 'logan94',
  'jackson_reads', 'jackson_r', 'jackson97',
  'oliver_reads', 'oliver_r', 'oliver2001',
  'henry_reads', 'henry_r', 'henry97', 'henry94',
  'ian_reads', 'ian_r', 'ian2001',
  'grace_reads', 'grace_r', 'grace2001', 'grace97',
  'chloe_reads', 'chloe_r', 'chloe2001',
  'harper_reads', 'harper_r', 'harper97',
  'riley_reads', 'riley_r', 'riley2001',
  'hazel_reads', 'hazel_r', 'hazel97',
  'ruby_reads', 'ruby_r', 'ruby2001',
  'scarlett_reads', 'scarlett_r', 'scarlett97',
  'violet_reads', 'violet_r', 'violet2001',
  'stella_reads', 'stella_r', 'stella97',
  'luna_reads', 'luna_r', 'luna2001', 'luna94',
  'willow_reads', 'willow_r', 'willow97',
  'nora_reads', 'nora_r', 'nora2001',
  'aurora_reads', 'aurora_r', 'aurora97',
  'ivy_reads', 'ivy_r', 'ivy2001',
  'ellie_reads', 'ellie_r', 'ellie97',
  'eleanor_reads', 'eleanor_r', 'eleanor2001',
  'naomi_reads', 'naomi_r', 'naomi97',
  'claire_reads', 'claire_r', 'claire2001',
  'audrey_reads', 'audrey_r', 'audrey97',
  'bella_reads', 'bella_r', 'bella2001',
  'maya_reads', 'maya_r', 'maya97', 'maya94',
  'leah_reads', 'leah_r', 'leah2001',
  'piper_reads', 'piper_r', 'piper97',
  'paisley_reads', 'paisley_r', 'paisley2001',

  // More French names
  'adrien_fr', 'adrien_m', 'adrien2001', 'adrien97',
  'elodie_fr', 'elodie_m', 'elodie2001', 'elodie97',
  'noemie_fr', 'noemie_m', 'noemie2001',
  'celine_fr', 'celine_m', 'celine97',
  'melanie_fr', 'melanie_m', 'melanie2001',
  'sandrine_fr', 'sandrine_m', 'sandrine97',
  'gregory_fr', 'gregory_m', 'gregory2001',
  'sebastien_fr', 'sebastien_m', 'sebastien97',
  'jerome_fr', 'jerome_m', 'jerome2001',
  'thierry_fr', 'thierry_m', 'thierry97',
  'xavier_fr', 'xavier_m', 'xavier2001',
  'yannick_fr', 'yannick_m', 'yannick97',
  'francois_fr', 'francois_m', 'francois2001',
  'renaud_fr', 'renaud_m', 'renaud97',
  'bertrand_fr', 'bertrand_m', 'bertrand2001',
  'christophe_fr', 'christophe_m', 'christophe97',
  'philippe_fr', 'philippe_m', 'philippe2001',
  'sylvain_fr', 'sylvain_m', 'sylvain97',
  'fabrice_fr', 'fabrice_m', 'fabrice2001',
  'cedric_fr', 'cedric_m', 'cedric97',
  'gautier_fr', 'gautier_m', 'gautier2001',
  'thibault_fr', 'thibault_m', 'thibault97',

  // Additional realistic singles
  'gg_reads', 'yy_reads', 'zz_reads', 'qq_reads', 'pp_reads',
  'aaa_reads', 'bbb_reads', 'ccc_reads', 'ddd_reads',
  'xoxo_reads', 'lol_reads', 'lmao_reads', 'ok_reads',
  'um_reads', 'idk_reads', 'ngl_reads', 'tbh_reads',
  'literallyme', 'thats_so_me', 'relatable_acc', 'mood_always',
  'same_lol', 'big_mood_reads', 'lowkey_obsessed', 'highkey_fan',

  // More EN names with creative twists
  'reeding_not_reading', 'technically_reading', 'not_addicted',
  'totally_fine_ok', 'just_one_more', 'five_more_chapters',
  'send_help_reads', 'plshelp_reads', 'helpimaddicted',
  'why_am_i_awake', 'its_3am_again', 'no_sleep_again',
  'send_more_chapters', 'need_more_content', 'morechaptersplease',
  'waiting_for_updates', 'weekly_suffering', 'hiatus_again',

  // More French casual
  'trop_accro', 'jesuis_perdu', 'aide_moi', 'encore_un',
  'juste_un_autre', 'pasla_peine_de_dormir', 'nuitlecture',
  'jamais_dodo', 'dodo_plus_tard', 'apres_ce_chapitre',
  'la_semaine_prochaine', 'fini_demain', 'on_verra',
  'flemme_dattendre', 'impatient_chapitre', 'attente_insupportable',

  // More realistic name variants
  'adriana_r', 'adriana_fr', 'adriana2001',
  'ibrahim_m', 'ibrahim_fr', 'ibrahim2001',
  'fatima_k', 'fatima_fr', 'fatima2001',
  'youssef_m', 'youssef_fr', 'youssef2001',
  'sofia_r', 'sofia_fr', 'sofia2001', 'sofia97',
  'dmitri_r', 'dmitri_fr', 'dmitri2001',
  'kenji_r', 'kenji_reads', 'kenji2001',
  'yuki_r', 'yuki_reads', 'yuki2001', 'yuki97',
  'hana_r', 'hana_reads', 'hana2001', 'hana97',
  'jae_reads', 'jae_r', 'jae2001', 'jae94',
  'seo_reads', 'seo_r', 'seo2001',
  'min_reads', 'min_r', 'min2001', 'min97',
  'jun_reads', 'jun_r', 'jun2001',
  'ha_reads', 'ha_r', 'ha2001',
  'kim_reads', 'kim_r', 'kim2001', 'kim94',
  'park_reads', 'park_r', 'park97',
  'lee_reads', 'lee_r', 'lee2001', 'lee94',
  'choi_reads', 'choi_r', 'choi97',
  'riku_reads', 'riku_r', 'riku2001',
  'miku_reads', 'miku_r', 'miku2001',
  'arya_reads', 'arya_r', 'arya2001', 'arya97',
  'nia_reads', 'nia_r', 'nia2001',
  'zara_reads', 'zara_r', 'zara2001', 'zara97',
  'leila_reads', 'leila_fr', 'leila2001',
  'omar_reads', 'omar_r', 'omar2001',
  'nour_reads', 'nour_fr', 'nour2001',
  'amir_reads', 'amir_r', 'amir2001',
  'daria_reads', 'daria_r', 'daria2001',
  'vera_reads', 'vera_r', 'vera2001', 'vera97',
  'anya_reads', 'anya_r', 'anya2001',
  'ivan_reads', 'ivan_r', 'ivan2001', 'ivan97',
  'boris_reads', 'boris_r', 'boris2001',
  'felix_reads', 'felix_r', 'felix2001', 'felix97',
  'felix_fr', 'felix_m', 'felix94',
  'oscar_reads', 'oscar_r', 'oscar2001', 'oscar_fr',
  'victor_reads', 'victor_r', 'victor2001', 'victor_fr', 'victor97',
  'arthur_reads', 'arthur_r', 'arthur2001', 'arthur_fr',
  'edouard_fr', 'edouard_m', 'edouard2001',
  'florian_fr', 'florian_m', 'florian2001', 'florian94',
  'florent_fr', 'florent_m', 'florent2001',
  'damien_fr', 'damien_m', 'damien2001', 'damien94',
  'kevin_fr', 'kevin_m', 'kevin2001', 'kevin97',
  'dylan_fr', 'dylan_m', 'dylan2001', 'dylan94',
  'samuel_fr', 'samuel_m', 'samuel2001', 'samuel97',
  'mathis_fr', 'mathis_m', 'mathis2001',
  'enzo_fr', 'enzo_m', 'enzo2001', 'enzo97',
  'tristan_fr', 'tristan_m', 'tristan2001',
  'alexis_fr', 'alexis_m', 'alexis2001', 'alexis97',
  'aurore_fr', 'aurore_m', 'aurore2001',
  'amandine_fr', 'amandine_m', 'amandine2001',
  'mathilde_fr', 'mathilde_m', 'mathilde2001', 'mathilde97',
  'amelie_fr', 'amelie_m', 'amelie2001',
  'audrey_fr', 'audrey_m', 'audrey2001', 'audrey97',
  'axelle_fr', 'axelle_m', 'axelle2001',
  'berenice_fr', 'berenice_m', 'berenice2001',
  'clemence_fr', 'clemence_m', 'clemence2001',
  'delphine_fr', 'delphine_m', 'delphine97',
  'elise_fr', 'elise_m', 'elise2001', 'elise97',
  'estelle_fr', 'estelle_m', 'estelle2001',
  'fanny_fr', 'fanny_m', 'fanny2001',
  'gaelle_fr', 'gaelle_m', 'gaelle2001',
  'helene_fr', 'helene_m', 'helene97',
  'isabelle_fr', 'isabelle_m', 'isabelle2001',
  'justine_fr', 'justine_m', 'justine2001', 'justine97',
]

// ─── More human review templates ──────────────────────────────────────────

const HUMAN_REVIEWS_EN: Record<'high' | 'mid' | 'low', string[]> = {
  high: [
    'this is so good holy crap',
    'ok i was NOT ready for how good this is',
    'binged it all in one night no regrets',
    'genuinely one of the best things ive read in a while',
    'the art is insane. the story is insane. everything is insane',
    'lowkey one of my favorites now',
    'this deserves way more attention',
    'cant stop thinking about it honestly',
    'read it twice already and its still good',
    'the character development actually made me tear up lol',
    'finished at 3am and honestly worth it',
    'everyone needs to read this immediately',
    '10/10 would lose sleep again',
    'the story goes places i was NOT expecting',
    'genuinely brilliant. rare to say that',
    'can\'t believe i almost skipped this one',
    'the pacing is perfect, every chapter pulls you forward',
    'i keep recommending this to everyone around me',
    'one of those that sticks with you after finishing',
    'art + story + characters all fire. rare combo',
    'easily top 5 for me personally',
    'the ending was so satisfying i almost cried',
    'whoever made this understood the assignment completely',
    'i need a sequel NOW',
    'this is what i was looking for without knowing it',
    'characters feel so real it\'s almost uncomfortable',
    'the twists in this are genuinely unpredictable',
    'i recommend this even to people who don\'t read manhwa',
    'had to put my phone down and breathe a few times lol',
    'nothing i say will do this justice just go read it',
  ],
  mid: [
    'pretty solid tbh, enjoyed it more than expected',
    'good not great but definitely worth a read',
    'art is clean, story is ok, overall decent',
    'not bad at all. recommended for the genre',
    'took a few chapters to get into it but then i was hooked',
    'i\'ve read worse lol, actually enjoyed this',
    'solid 7/10 for me personally',
    'the art is the highlight for sure',
    'some chapters drag but the good parts are really good',
    'mc is a bit generic but the world is interesting',
    'would recommend if you have nothing else to read',
    'enjoyable read. didn\'t blow me away but solid',
    'does what it says on the tin',
    'some pacing issues but overall pretty good',
    'better than its reputation suggests imo',
    'good chill read. nothing stressful',
    'not life changing but entertaining',
    'worth starting at least. see if it grabs you',
    'mid but in a charming way',
    'the side characters are actually more interesting than the mc',
    'i liked it. not my fave but definitely ok',
    'good for a lazy afternoon read',
    'readable, enjoyable, forgettable. in a fine way',
    'competent story, great visuals',
    'nothing groundbreaking but enjoyable',
    'honestly more fun than it has any right to be',
    'solid entry in the genre. nothing more nothing less',
    'give it 10 chapters before judging',
    'it\'s fine. good even. just not exceptional',
    'has its moments, worth reading',
  ],
  low: [
    'dropped it, not for me',
    'meh. the hype made it sound better than it is',
    'decent start then lost me completely',
    'not great. wouldn\'t recommend unless you\'re really bored',
    'had potential. wasted it',
    'the art is nice but the story is just... there',
    'nothing new here if you\'ve read much of the genre',
    'got boring fast unfortunately',
    'too slow, moved on',
    'the mc makes decisions that made me want to scream',
    'i don\'t get the high ratings honestly',
    'overhyped. expected more',
    'generic plot + generic mc = generic manhwa',
    'couldn\'t make myself finish it',
    'started strong, ended weak',
    'not awful just really forgettable',
    'the pacing killed it for me',
    'fine if you have no standards lol (kidding but also kind of not)',
    'read it so you don\'t have to trust me on this one',
    'had one good arc then fell apart',
    'the villain is cardboard and the mc isn\'t much better',
    'there are better options in this genre',
    'not worth the time imo',
    'waited for it to get good. it didn\'t',
    'disappointing. can\'t say much else',
    'the writing clearly got lazier as it went on',
    'good concept, terrible execution',
    'the ending alone knocked it down two points',
    'some chapters felt like pure filler',
    'moved on after giving it a real chance. not my thing',
  ],
}

const HUMAN_REVIEWS_FR: Record<'high' | 'mid' | 'low', string[]> = {
  high: [
    'franchement incroyable, je m\'attendais pas à ça',
    'j\'ai tout lu en deux jours, aucun regret',
    'l\'art est sublime et l\'histoire suit. rare combo',
    'je comprends enfin pourquoi tout le monde en parle',
    'ça m\'a tenu éveillé jusqu\'à 3h du mat, et j\'assume',
    'facilement dans mon top perso maintenant',
    'j\'avais pas prévu de tout lire ce soir. c\'est fait',
    'les persos sont tellement bien écrits ça fait peur',
    'je recommande à n\'importe qui franchement',
    'j\'ai failli pleurer à la fin et j\'assume',
    'les twists sont vraiment imprévisibles, bravo l\'auteur',
    'rare qu\'un manhwa soit aussi cohérent du début à la fin',
    'j\'en parle à tous mes amis depuis que j\'ai fini',
    'parfait de A à Z, pas grand chose à redire',
    'le développement du mc est satisfaisant comme rarement',
    'art somptueux + histoire solide + bons persos = chef d\'œuvre',
    'quelque chose de différent des autres dans le genre. j\'ai adoré',
    'j\'ai relu depuis le début juste après avoir fini',
    'ça fait exactement ce que j\'attendais et en mieux',
    'clairement sous-estimé. foncez',
    'j\'y ai passé une nuit blanche et j\'ai zero remords',
    'les antagonistes sont aussi bien écrits que le mc. incroyable',
    'le worldbuilding est fascinant, on s\'y perd vraiment',
    'je relirais ce truc encore et encore',
    'chaque arc est meilleur que le précédent. chapeau',
    'j\'ai souri, j\'ai pleuré, j\'ai crié. pas regretter',
    'impossible de lâcher une fois qu\'on commence',
    'meilleur manhwa que j\'ai lu depuis un moment',
    'les scènes de combat sont une claque visuelle',
    'si tu hésites, lis les 10 premiers chapitres. t\'arreteras plus',
  ],
  mid: [
    'pas mal du tout finalement',
    'bien sans être exceptionnel, mais franchement sympa',
    'l\'art rattrape une histoire un peu classique',
    'bonne lecture pour passer le temps',
    'j\'ai apprécié même si c\'est pas mon style habituel',
    'solide 7/10 de mon côté',
    'quelques longueurs mais globalement très lisible',
    'mc un peu générique mais l\'univers est cool',
    'ça m\'a occupé un week-end. objectif rempli',
    'mieux que ce à quoi je m\'attendais honnêtement',
    'les seconds rôles sont souvent plus intéressants que le mc',
    'bien construit même si sans grande surprise',
    'bonne ambiance, histoire convenable',
    'ça se lit facilement, c\'est déjà ça',
    'pas révolutionnaire mais fait bien son boulot',
    'le rythme est ok, quelques chapitres creux mais c\'est rattrapé',
    'je recommanderais aux fans du genre',
    'donne sa chance, les 5 premiers chapitres valent le coup',
    'divertissant sans plus, ce qui est déjà bien',
    'c\'est honnête. pas de fausse promesse dans cette lecture',
    'meilleur que sa réputation imo',
    'les combats sont bien chorégraphiés au moins',
    'plutôt bon dans l\'ensemble, juste un peu oubliable',
    'le style est propre même si l\'histoire est classique',
    'sympa pour une lecture tranquille',
    'dans la moyenne haute du genre',
    'bien pour se détendre sans trop réfléchir',
    'à lire si t\'as du temps, pas prioritaire sinon',
    'correct partout, excellent nulle part',
    'j\'en garde un bon souvenir même si c\'est pas mon fave',
  ],
  low: [
    'abandonné au bout de quelques chapitres, pas pour moi',
    'le hype était pas mérité à mon avis',
    'pas terrible. j\'y ai cru au début',
    'l\'histoire part dans tous les sens',
    'mc insupportable, j\'ai arrêté',
    'trop générique pour se démarquer',
    'le potentiel est là mais l\'exécution déçoit',
    'j\'ai pas compris les bonnes notes franchement',
    'ennuyeux assez vite malheureusement',
    'j\'ai tout lu par principe. erreur',
    'l\'art sauve la mise mais c\'est tout',
    'trop de remplissage, trop peu de substance',
    'bonne idée de départ, exécution bof',
    'les antagonistes sont en carton, ça se voit',
    'j\'ai perdu ma motivation vers le milieu',
    'y\'a mieux dans le genre pour le même effort',
    'déçu. les critiques m\'avaient donné trop d\'attentes',
    'prévisible de bout en bout',
    'le mc prend des décisions incompréhensibles',
    'commencé avec enthousiasme, fini avec soulagement',
    'pas mauvais juste vraiment quelconque',
    'le rythme est catastrophique sur les 30 premiers chapitres',
    'j\'ai skippé des chapitres entiers sans rien rater',
    'une bonne idée gâchée par une écriture paresseuse',
    'l\'auteur a clairement perdu le fil en cours de route',
    'pas recommandé si t\'as d\'autres options',
    'je comprends pas comment c\'est aussi bien noté',
    'correctement dessiné, mal écrit. dommage',
    'abandonné, j\'ai pas regretté',
    'fais comme moi : lis les avis d\'abord',
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function getTier(score: number): 'high' | 'mid' | 'low' {
  if (score >= 8) return 'high'
  if (score >= 6) return 'mid'
  return 'low'
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('🧹 Seed Content Cleanup\n')

  // ── Step 1: Delete 80% of seed reviews (keep short/micro) ──────────────

  console.log('Step 1: Cleaning up reviews...')

  const allReviews = await prisma.review.findMany({
    where: { user: { is_seed: true } },
    select: { id: true, is_micro: true, score: true },
    orderBy: { created_at: 'asc' },
  })

  console.log(`  Found ${allReviews.length} seed reviews total`)

  // Separate long and micro
  const longReviews = allReviews.filter((r) => !r.is_micro)
  const microReviews = allReviews.filter((r) => r.is_micro)

  console.log(`  Micro: ${microReviews.length}, Long: ${longReviews.length}`)

  // Delete all long reviews
  const longIds = longReviews.map((r) => r.id)
  if (longIds.length > 0) {
    await prisma.review.deleteMany({ where: { id: { in: longIds } } })
    console.log(`  Deleted ${longIds.length} long reviews`)
  }

  // Delete 78% of micro reviews (randomly)
  const shuffledMicro = shuffle(microReviews)
  const deleteCount = Math.floor(shuffledMicro.length * 0.78)
  const microToDelete = shuffledMicro.slice(0, deleteCount).map((r) => r.id)

  if (microToDelete.length > 0) {
    // Delete in batches of 500
    for (let i = 0; i < microToDelete.length; i += 500) {
      await prisma.review.deleteMany({
        where: { id: { in: microToDelete.slice(i, i + 500) } },
      })
    }
    console.log(`  Deleted ${microToDelete.length} micro reviews (78%)`)
  }

  const kept = shuffledMicro.slice(deleteCount)
  console.log(`  Kept ${kept.length} micro reviews`)
  console.log(
    `  Total deleted: ${longIds.length + microToDelete.length} / ${allReviews.length} (${Math.round(((longIds.length + microToDelete.length) / allReviews.length) * 100)}%)`,
  )

  // ── Step 2: Rewrite remaining reviews to sound more human ──────────────

  console.log('\nStep 2: Humanizing remaining reviews...')

  const remainingReviews = await prisma.review.findMany({
    where: { user: { is_seed: true } },
    select: { id: true, score: true, user: { select: { locale: true } } },
  })

  let updated = 0
  const BATCH = 100

  for (let i = 0; i < remainingReviews.length; i += BATCH) {
    const batch = remainingReviews.slice(i, i + BATCH)

    await Promise.all(
      batch.map((review) => {
        const locale = review.user?.locale ?? 'en'
        const tier = getTier(review.score ?? 5)
        const pool =
          locale === 'fr' ? HUMAN_REVIEWS_FR[tier] : HUMAN_REVIEWS_EN[tier]
        const newContent = pickRandom(pool)

        return prisma.review.update({
          where: { id: review.id },
          data: { content: newContent },
        })
      }),
    )

    updated += batch.length
    if (updated % 500 === 0 || updated === remainingReviews.length) {
      process.stdout.write(`\r  Updated ${updated} / ${remainingReviews.length} reviews`)
    }
  }

  console.log(`\n  Done — ${updated} reviews rewritten`)

  // ── Step 3: Update seed user usernames ────────────────────────────────

  console.log('\nStep 3: Updating usernames...')

  const seedUsers = await prisma.user.findMany({
    where: { is_seed: true },
    select: { id: true, username: true },
    orderBy: { created_at: 'asc' },
  })

  console.log(`  Found ${seedUsers.length} seed users`)

  if (REALISTIC_USERNAMES.length < seedUsers.length) {
    console.warn(
      `  ⚠ Only ${REALISTIC_USERNAMES.length} unique usernames — some users may keep old names`,
    )
  }

  const shuffledNames = shuffle(REALISTIC_USERNAMES)
  const usedNames = new Set<string>()

  // Add suffix number if we run out of unique names
  function getUniqueName(index: number): string {
    if (index < shuffledNames.length) {
      const candidate = shuffledNames[index]!
      if (!usedNames.has(candidate)) {
        usedNames.add(candidate)
        return candidate
      }
    }
    // Fallback: use original with suffix
    const base = `user_${1000 + index}`
    usedNames.add(base)
    return base
  }

  let usernameUpdated = 0

  for (let i = 0; i < seedUsers.length; i += BATCH) {
    const batch = seedUsers.slice(i, i + BATCH)

    await Promise.all(
      batch.map((user, batchIdx) => {
        const newUsername = getUniqueName(i + batchIdx)
        return prisma.user.update({
          where: { id: user.id },
          data: { username: newUsername },
        })
      }),
    )

    usernameUpdated += batch.length
    if (usernameUpdated % 200 === 0 || usernameUpdated === seedUsers.length) {
      process.stdout.write(`\r  Updated ${usernameUpdated} / ${seedUsers.length} usernames`)
    }
  }

  console.log(`\n  Done — ${usernameUpdated} usernames updated`)

  console.log('\n✅ Cleanup complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
