/* =====================================================================
 *  data.js: オデッサ作戦 · THE BATTLE OF ODESSA (U.C. 0079).
 *  A self-playing 3D documentary.
 *  ---------------------------------------------------------------------
 *  A FICTIONAL battle from "Mobile Suit Gundam" (機動戰士高達, Sunrise, 1979),
 *  set 6–9 November Universal Century 0079, during the One Year War. The
 *  Earth Federation Forces, under General Revil, launch the largest ground
 *  offensive of the war to retake Zeon's Black Sea mining operations at
 *  Odessa. This is a documentary-style reconstruction of the canon — NOT
 *  a depiction of any real-world conflict. Odessa is a real, populated
 *  Ukrainian city currently under threat; this piece is a fan tribute to
 *  a 1979 anime set over present-day satellite imagery. See notes.caveats.
 *
 *  Faithfulness over invention: every depicted force, commander and beat
 *  traces to the cited Gundam canon (see notes.sources); adaptation
 *  variants and supplementary figures are disclosed via canon-confidence
 *  chips in narration_en. The engine is never edited.
 *
 *  Bilingual slots: `_zh` = Traditional Chinese (primary), `_en` = English.
 * ===================================================================== */
window.BATTLE_DATA = (function () {

  /* -- the two sides. `eff` = Earth Federation Forces (attacker, blue);
   *    `zeon` = Principality of Zeon (defender, red). role drives the engine's
   *    attacker/defender behaviour (front/retreat colour, strength bars, gradient). -- */
  const factions = {
    eff:  { main:0x3b6fd8, glow:0x6f9bff, dim:0x1f3a78, css:"#3b6fd8", name_zh:"地球聯邦軍", name_en:"Earth Federation Forces", role:"attacker", maxStrength:3000, defaultFlag:"eff" },
    zeon: { main:0xcf2a2a, glow:0xff6a55, dim:0x7a1717, css:"#cf2a2a", name_zh:"自護公國軍", name_en:"Principality of Zeon",     role:"defender",  maxStrength:3000, defaultFlag:"zeon" },
  };

  /* -- the map box: real Odessa / Black Sea north coast (WGS84).
   *    meta.vexag pinned to 2.0 — the terrain north of Odessa is flat steppe;
   *    the default auto-exaggeration would read as spiky. -- */
  const meta = {
    geo:{ minLng:30.30, maxLng:31.30, minLat:46.15, maxLat:46.90, Z:12 },
    dayMin:6, dayMax:9.9, year:79, month:11, lastDay:9,
    vexag:2.0,
    title:"オデッサ作戦", subtitle:"機動戰士高達 · 一年戰爭 · Battle of Odessa · U.C.0079",
    theme:{
      grade:{ filter:"sepia(0.22) saturate(0.88) contrast(1.06) brightness(0.97)", vignette:0.46, grain:0.048 },
    },
  };

  /* -- ui: bilingual Traditional Chinese / English interface pack. -- */
  const ui = {
    boot:{ dem:"載入地形高程 (DEM)…", imagery:"載入衛星影像…", terrain:"建構地形…", music:"載入配樂…", starting:"啟動中…" },
    frontLine:{ zh:"戰線", en:"Front line" },
    strengthUnit:"", endLabel:"終", sceneLabel:"U.C.00{year}.{month}.{day}",
    notesCaveatsHeader:"說明與限制 Caveats", notesSourcesHeader:"資料來源 Sources",
    langToggle:{ both:"中·EN", zh:"中", en:"EN" },
    notesBtn:"ⓘ 註記 Notes", notesHeader:"註記與資料來源 NOTES & SOURCES", resume:"▶ 繼續導覽 Resume",
    hint:{ autoplay:"自動播放中 Auto-playing", drag:"拖曳可自由視角（會暫停導覽）Drag to free-look" },
    legend:{ symbolsHeader:"圖例 Symbols", flagsHeader:"勢力旗幟 Flags",
      advance:"進攻 Advance", hq:"司令部 HQ", infantry:"機動戰士 Mobile Suit", air:"空中 Air", navy:"海上 Naval", artillery:"火砲 Artillery", contact:"接敵 In contact", strength:"戰力 Strength",
      movement:"移動 Movement", combat:"交戰・火力 Combat", lost:"損失・撤退 Lost" },
    disclaimer:"虛構戰役（機動戰士高達, U.C.0079），重現於真實的黑海北岸地形之上。本片為一九七九年動畫之愛好者致敬作品，與現實中的敖德薩衝突毫無關聯。"
      +"<br>Fictional battle (Mobile Suit Gundam, U.C. 0079) rendered over the real Black Sea coast. A fan tribute to a 1979 anime — not a depiction of, or commentary on, the current conflict in the real Odessa, Ukraine."
      +"<br>Imagery © EOX Sentinel-2 cloudless 2016 (CC BY 4.0, s2maps.eu) · elevation SRTM courtesy USGS",
  };

  /* -- intro: the opening title card — a wide Black Sea establisher. -- */
  const intro = {
    title_zh:"オデッサ作戦", title_en:"Battle of Odessa",
    sub_zh:"機動戰士高達 · 一年戰爭 · U.C.0079.11.06–09", sub_en:"Mobile Suit Gundam · One Year War · U.C. 0079",
    cam:{ lng:30.72, lat:46.48, dist:2200, az:0, el:52 },
  };

  /* -- outro: the closing pull-back over the liberated coast. -- */
  const outro = {
    title_zh:"敖德薩光復", title_en:"Odessa Liberated",
    narration_zh:"敖德薩光復，自護撤出歐洲。一年戰爭的重心自此轉向太空。這是一場虛構的戰役，謹依《機動戰士高達》設定重現。",
    narration_en:"Odessa is liberated. Zeon withdraws from Europe. The war's centre of gravity shifts from Earth to space. This is a fictional battle, reconstructed faithfully to Mobile Suit Gundam canon.",
    cam:{ lng:30.72, lat:46.52, dist:2400, az:0, el:50, orbit:1.0, tween:3.6 },
  };

  /* -- flagLegend: the flag swatches in the legend. -- */
  const flagLegend = [
    { flag:"eff",  zh:"地球聯邦軍", en:"Earth Federation Forces", faction:"eff"  },
    { flag:"zeon", zh:"自護公國軍", en:"Principality of Zeon",     faction:"zeon" },
  ];

  /* -- geography: real named places on the Black Sea north coast. -- */
  const geography = {
    regions: [
      { name_zh:"黑海", name_en:"Black Sea", type:"region", lng:31.00, lat:46.22 },
    ],
    points: [
      { name_zh:"敖德薩", name_en:"Odessa", type:"fort", lng:30.738, lat:46.482 },
      { name_zh:"敖德薩礦業基地", name_en:"M'Quve's Mining Base", type:"fort", lng:30.72, lat:46.50 },
      { name_zh:"波格里博夫卡", name_en:"Pohrebyshche staging", type:"town", lng:30.50, lat:46.68 },
    ],
    lines: [
      { name_zh:"聯邦突破線", name_en:"EFF Breakthrough", color:"#5b8def",
        path:[[30.40,46.80],[30.55,46.72],[30.70,46.65],[30.85,46.62],[31.00,46.60]] },
    ],
  };

  /* -- units: EFF (attacker, blue) and Zeon (defender, red). -- */
  const units = [
    // ---- EARTH FEDERATION (attacker) ----
    { id:"eff_bigtray", faction:"eff", kind:"command", flag:"eff", cf:false,
      name_zh:"巴坦號大地作戰艦（雷比爾將軍）", name_en:"Big Tray Bataan — Gen. Revil",
      type:"Land battleship HQ",
      track:[ {d:6,   lng:30.42, lat:46.82, s:2800, st:"march"},
              {d:7.5, lng:30.58, lat:46.72, s:2800, st:"march"},
              {d:9,   lng:30.72, lat:46.62, s:2800, st:"hold"} ] },

    { id:"eff_whitebase", faction:"eff", kind:"air", flag:"eff", cf:true,
      name_zh:"白色基地（SCV-70）", name_en:"White Base (SCV-70)",
      type:"Assault carrier",
      track:[ {d:6.5, lng:30.48, lat:46.78, s:900, st:"march"},
              {d:7.5, lng:30.62, lat:46.68, s:900, st:"hold"},
              {d:8.5, lng:30.68, lat:46.58, s:860, st:"hold"},
              {d:9,   lng:30.68, lat:46.58, s:860, st:"hold"} ] },

    { id:"eff_gundam", faction:"eff", kind:"infantry", flag:"eff", cf:true,
      name_zh:"高達（阿寶）", name_en:"RX-78-2 Gundam (Amuro)",
      type:"Mobile Suit",
      track:[ {d:7.5, lng:30.62, lat:46.68, s:720, st:"hold"},
              {d:8.0, lng:30.65, lat:46.60, s:720, st:"attack"},
              {d:8.4, lng:30.70, lat:46.54, s:720, st:"attack"},
              {d:8.6, lng:30.72, lat:46.52, s:700, st:"attack"},
              {d:9.0, lng:30.72, lat:46.52, s:700, st:"hold"} ] },

    { id:"eff_armour", faction:"eff", kind:"infantry", flag:"eff", cf:true,
      name_zh:"第三軍裝甲縱隊", name_en:"3rd Army armour columns",
      type:"Armoured infantry",
      track:[ {d:6,   lng:30.38, lat:46.84, s:2600, st:"march"},
              {d:7,   lng:30.52, lat:46.76, s:2400, st:"march"},
              {d:8,   lng:30.65, lat:46.68, s:2200, st:"attack"},
              {d:9,   lng:30.78, lat:46.60, s:2000, st:"attack"} ] },

    { id:"eff_bombers", faction:"eff", kind:"air", flag:"eff", cf:true,
      name_zh:"聯邦轟炸機群（基輔／索菲亞／伊斯坦堡）", name_en:"EFF bomber wings (Kyiv / Sofia / Istanbul)",
      type:"Air bomber group",
      track:[ {d:6.5, lng:30.52, lat:46.86, s:800, st:"march"},
              {d:7.5, lng:30.70, lat:46.72, s:700, st:"attack"},
              {d:9,   lng:30.72, lat:46.60, s:600, st:"attack"} ] },

    { id:"eff_matilda", faction:"eff", kind:"air", flag:"eff", cf:true,
      name_zh:"瑪蒂爾達的美地亞補給機", name_en:"Matilda's Medea resupply",
      type:"Transport",
      track:[ {d:7.2, lng:30.58, lat:46.74, s:400, st:"march"},
              {d:7.5, lng:30.65, lat:46.66, s:400, st:"hold"},
              {d:7.8, lng:30.65, lat:46.66, s:0,   st:"dead"} ] },

    { id:"eff_ankara", faction:"eff", kind:"artillery", flag:"eff", cf:true,
      name_zh:"安卡拉炮擊線", name_en:"Ankara bombardment (across the sea)",
      type:"Artillery (off-map)",
      track:[ {d:6, lng:30.80, lat:46.20, s:600, st:"hold"},
              {d:9, lng:30.80, lat:46.20, s:600, st:"hold"} ] },

    // ---- PRINCIPALITY OF ZEON (defender) ----
    { id:"zeon_mquve", faction:"zeon", kind:"command", flag:"zeon", cf:false,
      name_zh:"敖德薩礦業基地（姆奎夫）", name_en:"Odessa Mining Base — M'Quve",
      type:"Fortress HQ",
      track:[ {d:6,   lng:30.72, lat:46.50, s:2200, st:"hold"},
              {d:8.8, lng:30.72, lat:46.50, s:800,  st:"hold"},
              {d:9,   lng:30.72, lat:46.52, s:0,    st:"retreat"} ] },

    { id:"zeon_tritars", faction:"zeon", kind:"infantry", flag:"zeon", cf:true,
      name_zh:"黑色三連星（蓋亞・歐爾鐵嘉・馬修）MS-09 德姆", name_en:"Black Tri-Stars (Gaia/Ortega/Mash) — MS-09 Dom",
      type:"Elite Mobile Suit",
      track:[ {d:7,   lng:30.68, lat:46.58, s:600, st:"hold"},
              {d:7.5, lng:30.65, lat:46.65, s:600, st:"attack"},
              {d:7.8, lng:30.65, lat:46.66, s:300, st:"attack"},
              {d:7.9, lng:30.65, lat:46.66, s:0,   st:"dead"} ] },

    { id:"zeon_ms_line", faction:"zeon", kind:"infantry", flag:"zeon", cf:true,
      name_zh:"薩克II（陸戰型）・古夫防禦線", name_en:"Zaku II (ground) / Gouf defensive line",
      type:"Mobile Suit",
      track:[ {d:6,   lng:30.70, lat:46.65, s:1800, st:"hold"},
              {d:8,   lng:30.68, lat:46.63, s:1200, st:"hold"},
              {d:9,   lng:30.66, lat:46.60, s:400,  st:"retreat"} ] },

    { id:"zeon_armour", faction:"zeon", kind:"infantry", flag:"zeon", cf:true,
      name_zh:"馬哲拉・阿達克戰車隊", name_en:"Magella Attack tanks",
      type:"Armour",
      track:[ {d:6,   lng:30.72, lat:46.60, s:1200, st:"hold"},
              {d:8,   lng:30.70, lat:46.58, s:800,  st:"hold"},
              {d:9,   lng:30.68, lat:46.56, s:300,  st:"retreat"} ] },

    { id:"zeon_nuke", faction:"zeon", kind:"air", flag:"zeon", cf:true,
      name_zh:"核子飛彈（破壞南極條約）", name_en:"Nuclear missile (Antarctic Treaty violation)",
      type:"Ballistic missile",
      track:[ {d:8.8, lng:30.72, lat:46.50, s:200, st:"march"},
              {d:8.9, lng:30.72, lat:46.80, s:200, st:"march"},
              {d:9.0, lng:30.72, lat:46.80, s:0,   st:"dead"} ] },

    { id:"zeon_hlv", faction:"zeon", kind:"air", flag:"zeon", cf:true,
      name_zh:"重型運載火箭（自護礦石撤往太空）", name_en:"HLV ore lifters (escape to space)",
      type:"Heavy launch vehicle",
      track:[ {d:8.8, lng:30.74, lat:46.52, s:400, st:"march"},
              {d:9.2, lng:30.74, lat:47.00, s:400, st:"march"} ] },

    { id:"zeon_zanzibar", faction:"zeon", kind:"air", flag:"zeon", cf:true,
      name_zh:"贊西巴爾級巡洋艦（姆奎夫出逃）", name_en:"Zanzibar-class cruiser — M'Quve's escape",
      type:"Mobile cruiser",
      track:[ {d:8.9, lng:30.72, lat:46.50, s:500, st:"retreat"},
              {d:9.3, lng:30.80, lat:46.80, s:500, st:"retreat"} ] },
  ];

  /* -- arrows: dated movement annotations. -- */
  const arrows = [
    { f:"eff",  from:[30.38,46.86], to:[30.62,46.70], d:6.5, kind:"attack",  label:"聯邦推進 EFF advance" },
    { f:"eff",  from:[30.55,46.86], to:[30.72,46.68], d:7.0, kind:"attack",  label:"空中打擊 Air strikes" },
    { f:"zeon", from:[30.68,46.58], to:[30.64,46.66], d:7.5, kind:"attack",  label:"黑色三連星夜襲 Tri-Stars night attack" },
    { f:"eff",  from:[30.62,46.68], to:[30.70,46.54], d:8.0, kind:"attack",  label:"突入弱點 Strike the gap" },
    { f:"eff",  from:[30.65,46.68], to:[30.78,46.62], d:8.2, kind:"attack",  label:"裝甲突破 Armour breakthrough" },
    { f:"zeon", from:[30.72,46.50], to:[30.80,46.80], d:8.9, kind:"retreat", label:"撤退 Withdrawal" },
  ];

  /* -- fronts: dated front-line polylines. -- */
  const fronts = [
    { d:6,   path:[[30.38,46.82],[30.55,46.74],[30.72,46.70],[30.88,46.66],[31.05,46.62]] },
    { d:7.5, path:[[30.48,46.80],[30.62,46.72],[30.78,46.66],[30.94,46.62]] },
    { d:9,   path:[[30.60,46.76],[30.72,46.66],[30.88,46.62],[31.04,46.58]] },
  ];

  /* -- weather: flat steppe, autumn. Night in scene 4. -- */
  const weather = [
    { d:6,   night:0.10, fog:0.15, rain:0.05, smoke:0.05, zh:"秋日陰天",  en:"Autumn overcast" },
    { d:7,   night:0.0,  fog:0.10, rain:0.0,  smoke:0.10, zh:"砲煙瀰漫",  en:"Battle smoke" },
    { d:7.4, night:0.85, fog:0.20, rain:0.05, smoke:0.15, zh:"夜間・硝煙", en:"Night, smoke" },
    { d:8,   night:0.0,  fog:0.12, rain:0.0,  smoke:0.20, zh:"突破・硝煙", en:"Breakthrough smoke" },
    { d:9,   night:0.04, fog:0.10, rain:0.0,  smoke:0.12, zh:"微光・勝利", en:"Dawn, victory" },
  ];

  /* -- hotspots: combat FX. -- */
  const hotspots = [
    { a:6.5, b:7.2,  kind:"artillery",  lng:30.72, lat:46.50, i:0.6 },
    { a:7.0, b:7.5,  kind:"air",        lng:30.70, lat:46.62, i:0.5 },
    { a:7.5, b:7.9,  kind:"firefight",  lng:30.65, lat:46.66, i:0.8 },
    { a:7.6, b:7.85, kind:"explosion",  lng:30.65, lat:46.66, i:0.7 },
    { a:8.0, b:8.5,  kind:"firefight",  lng:30.70, lat:46.60, i:0.7 },
    { a:8.0, b:8.6,  kind:"artillery",  lng:30.74, lat:46.58, i:0.6 },
    { a:8.4, b:8.7,  kind:"firefight",  lng:30.72, lat:46.54, i:0.7 },
    { a:8.8, b:9.0,  kind:"explosion",  lng:30.72, lat:46.82, i:0.9 },
  ];

  /* -- storyboard: 10 shots, 6–9 Nov U.C. 0079. -- */
  const storyboard = [
    // 1. Prelude — wide Black Sea establisher.
    { day:6.0, hold:9, cam:{lng:30.72, lat:46.52, dist:2000, az:5, el:50, orbit:0.8},
      title_zh:"序幕：礦山與大海", title_en:"Prelude — The Mine and the Sea",
      dateLabel:"U.C. 0079.11.06",
      narration_zh:"黑海北岸，自護公國軍在此控制礦業基地已逾一年。加爾馬・薩比死後，聯邦備妥了反攻。",
      narration_en:'<span class="cc canon">CANON</span> Zeon has held the Black Sea mining operations since the First Landing. After Garma Zabi\'s death, the Earth Federation prepares its first great counteroffensive.',
      side:"zeon", focus:["zeon_mquve"], commanders:[{zh:"姆奎夫",en:"M'Quve"}] },

    // 2. EFF advance — off-box establisher, arrow into frame.
    { day:6.5, hold:8, cam:{lng:30.52, lat:46.80, dist:1600, az:-15, el:46, orbit:0.7},
      title_zh:"聯邦挺進", title_en:"The Federation Advances",
      dateLabel:"U.C. 0079.11.06",
      narration_zh:"雷比爾將軍的第三軍從英格蘭出發，渡過海峽，於華沙匯合，向南直驅黑海。",
      narration_en:'<span class="cc staging">STAGING</span> General Revil\'s 3rd Army departs Southampton, crosses the Channel, rendezvous at Warsaw, and drives south. The Big Tray land battleship <em>Bataan</em> leads the column.',
      side:"eff", focus:["eff_bigtray","eff_armour"], commanders:[{zh:"雷比爾將軍",en:"Gen. Revil"}] },

    // 3. Air war opens.
    { day:7.0, hold:9, cam:{lng:30.70, lat:46.64, dist:1400, az:40, el:44, orbit:0.7},
      title_zh:"空中戰火", title_en:"The Air War Opens",
      dateLabel:"U.C. 0079.11.07",
      narration_zh:"聯邦轟炸機群從基輔、索菲亞、伊斯坦堡出擊；安卡拉的砲兵跨越黑海持續轟炸基地外圍。",
      narration_en:'<span class="cc supp">SUPPLEMENTARY</span> Federation bomber wings sortie from Kyiv, Sofia and Istanbul. Artillery fires from Ankara across the sea without pause. The mining base perimeter is hammered.',
      side:"eff", focus:["eff_bombers","eff_ankara"], commanders:[] },

    // 4. Night attack — the Black Tri-Stars, Matilda's death.
    { day:7.5, hold:11, cam:{lng:30.65, lat:46.66, dist:700, az:120, el:36, orbit:1.2},
      title_zh:"夜襲：黑色三連星", title_en:"Night Attack — The Black Tri-Stars",
      dateLabel:"U.C. 0079.11.07 · 夜 Night",
      narration_zh:"夜幕中，黑色三連星駕駛最新型MS-09德姆伏擊補給中的白色基地。瑪蒂爾達少尉駕機衝撞歐爾鐵嘉的德姆——她陣亡了。",
      narration_en:'<span class="cc canon">CANON</span> The Black Tri-Stars — Gaia, Ortega and Mash — in their new MS-09 Doms ambush the resupplying White Base. Lt. Matilda Ajan rams her Medea into Ortega\'s Dom and is killed. <span class="cc variant">VARIANT</span> The Origin compresses this sequence.',
      side:"zeon", focus:["zeon_tritars","eff_matilda","eff_whitebase"],
      commanders:[{zh:"蓋亞・歐爾鐵嘉・馬修",en:"Black Tri-Stars"}] },

    // 5. Betrayal foiled — Elran.
    { day:8.0, hold:8, cam:{lng:30.62, lat:46.70, dist:1100, az:-30, el:42, orbit:0.8},
      title_zh:"叛徒的奸計", title_en:"The Traitor Unmasked",
      dateLabel:"U.C. 0079.11.08",
      narration_zh:"聯邦內部潛伏著叛徒——艾倫將軍企圖按兵不動，讓防線出現缺口。阿寶揭穿陰謀，聯邦軍毫無保留地湧入那道本該空無一人的弱點。",
      narration_en:'<span class="cc canon">CANON</span> A traitor inside the Federation, General Elran, means to hold his troops back. The sabotage is uncovered. The Federation pours into the gap that should have been defended.',
      side:"eff", focus:["eff_gundam","eff_armour"], commanders:[{zh:"阿寶・尼爾",en:"Amuro Ray"}] },

    // 6. The breakthrough — 9 Nov combined-arms assault.
    { day:8.3, hold:10, cam:{lng:30.70, lat:46.62, dist:900, az:70, el:38, orbit:1.0},
      title_zh:"鋼鐵洪流", title_en:"The Breakthrough",
      dateLabel:"U.C. 0079.11.09",
      narration_zh:"11月9日，聯邦在空地協同下突破了自護最後一道防線——坦克、大地戰艦與空中支援橫掃草原。",
      narration_en:'<span class="cc canon">CANON</span> On 9 November the Federation breaks the last Zeon defensive line in a combined-arms assault across the steppe — armour, land battleships and air. <span class="cc variant">VARIANT</span> MS IGLOO depicts a Kursk-scale mechanised slaughter.',
      side:"eff", focus:["eff_bigtray","eff_armour","eff_gundam"], commanders:[{zh:"雷比爾將軍",en:"Gen. Revil"}] },

    // 7. M'Quve's nuke.
    { day:8.8, hold:9, cam:{lng:30.72, lat:46.52, dist:600, az:180, el:34, orbit:1.1},
      title_zh:"核子威脅", title_en:"M'Quve's Trump Card",
      dateLabel:"U.C. 0079.11.09",
      narration_zh:"走投無路的姆奎夫乘贊西巴爾級巡洋艦出逃，並發射了一枚核子飛彈——公然違反南極條約。",
      narration_en:'<span class="cc canon">CANON</span> Cornered, M\'Quve flees in a Zanzibar-class cruiser and launches a single nuclear missile — breaking the Antarctic Treaty. <span class="cc variant">VARIANT</span> In The Origin, M\'Quve refuses the order to nuke Earth\'s cities.',
      side:"zeon", focus:["zeon_mquve","zeon_zanzibar","zeon_nuke"],
      commanders:[{zh:"姆奎夫",en:"M'Quve"}] },

    // 8. The intercept — Amuro cuts the warhead.
    { day:8.9, hold:10, cam:{lng:30.72, lat:46.70, dist:500, az:200, el:30, orbit:2.0},
      title_zh:"光束劍截擊", title_en:"The Intercept",
      dateLabel:"U.C. 0079.11.09",
      narration_zh:"阿寶的高達衝向核彈，以光束劍劈斷彈頭。核爆消弭於高空之中。",
      narration_en:'<span class="cc canon">CANON</span> Amuro\'s Gundam intercepts the warhead and cuts it from the sky with a beam saber. The strike is averted at altitude.',
      side:"eff", focus:["eff_gundam","zeon_nuke"],
      commanders:[{zh:"阿寶・尼爾",en:"Amuro Ray"}] },

    // 9. Zeon's escape — HLVs climb out.
    { day:9.0, hold:8, cam:{lng:30.74, lat:46.56, dist:1000, az:10, el:40, orbit:0.8},
      title_zh:"自護撤往太空", title_en:"Zeon's Escape",
      dateLabel:"U.C. 0079.11.09",
      narration_zh:"自護將敖德薩礦石以重型運載火箭運往太空，比聯邦所能阻止的多出許多——這是追擊行動的失敗。",
      narration_en:'<span class="cc supp">SUPPLEMENTARY</span> Zeon lifts Odessa\'s ore to space by HLV. Far more forces escape orbit than the Federation could stop — a follow-up failure. MS IGLOO shows the pods being picked off in orbit.',
      side:"zeon", focus:["zeon_hlv"], commanders:[] },

    // 10. Aftermath — slow pull-back over liberated coast.
    { day:9.5, hold:12, cam:{lng:30.72, lat:46.52, dist:2000, az:8, el:50, orbit:1.0},
      title_zh:"光復後的大地", title_en:"Aftermath",
      dateLabel:"U.C. 0079.11.09",
      narration_zh:"敖德薩光復，自護被驅出歐洲。一年戰爭的主戰場由大地轉向太空。",
      narration_en:'<span class="cc canon">CANON</span> Odessa is liberated. Zeon is driven from Europe. The One Year War\'s centre of gravity shifts from Earth to space — the Battle of Solomon lies ahead.',
      side:"eff", focus:["eff_bigtray","eff_armour"], commanders:[{zh:"雷比爾將軍",en:"Gen. Revil"}] },
  ];

  /* -- notes: REQUIRED. summary + caveats[] + sources. -- */
  const notes = {
    summary:"「オデッサ作戦（敖德薩作戰）」是動畫《機動戰士高達》（Sunrise, 1979）中的虛構戰役，發生於宇宙世紀（U.C.）0079年11月6–9日一年戰爭期間。地球聯邦軍由雷比爾將軍率領，對自護公國軍在黑海北岸（敖德薩）的採礦基地發動大規模反攻，是一年戰爭中最大規模的陸上作戰，以聯邦全面勝利告終。本片為依據作品設定、重現於真實衛星地形之上的紀錄片式重構，並非真實歷史，亦與現實中的敖德薩毫無關聯。"
      +" The 'Battle of Odessa' (Operation Odessa) is a fictional engagement from Mobile Suit Gundam (Sunrise, 1979), the largest ground battle of the One Year War: the Earth Federation under Revil retakes Zeon's Black Sea mining base, 6–9 Nov U.C. 0079. This is a documentary-style reconstruction over real terrain, not real history.",
    caveats:[
      "虛構戰役：所有部隊、事件與人物均出自《機動戰士高達》（Sunrise, 1979），並非真實歷史。 Fictional battle: all forces, events and characters are from Mobile Suit Gundam (Sunrise, 1979).",
      "敖德薩是真實的烏克蘭城市，目前正處於戰爭威脅之下。本片謹為對一九七九年動畫的致敬，呈現架空的U.C.0079戰場重構，與現實中的敖德薩衝突毫無關聯，請勿混淆。 Odessa is a real Ukrainian city currently under threat of war. This piece is strictly a fan tribute to a 1979 anime; it is not a depiction of, allusion to, or commentary on the current conflict.",
      "地形與衛星影像為現今實景（EOX Sentinel-2 / SRTM），與作品設定的U.C.0079地貌未必相符。 Terrain and imagery are present-day real-world data and need not match the U.C. 0079 setting.",
      "電視動畫主要依據：日本播映第22–25話。Toonami/TVmaze版因略去第15話，同一集數對應第21–24話，需留意。 TV canon: Japanese broadcast eps 22–25. Toonami numbering omits ep 15, reading 21–24 there.",
      "雷比爾的進軍路線（南安普頓→多佛→華沙→敖德薩）、空軍基地（基輔/索菲亞/伊斯坦堡）及安卡拉炮擊線，出自作戰說明/Gundam Wiki，非電視畫面直接呈現，標記為SUPPLEMENTARY。本片之地圖座標為自行設定（STAGING）。 Revil's route, the named air bases and Ankara bombardment come from operational/wiki accounts, not on-screen TV canon — tagged SUPPLEMENTARY. Map coordinates here are STAGING.",
      "黑色三連星、瑪蒂爾達陣亡等橋段，於電視動畫（TV）、劇場版及《THE ORIGIN》各有不同描繪，以VARIANT標記。 The Tri-Stars and Matilda's death are depicted differently across TV, the movie and The Origin — tagged VARIANT.",
      "兵力數字（如聯邦投入約370萬兵力）出自設定資料集（Entertainment Bible 39）；均為示意數值，非電視畫面呈現，標記為SUPPLEMENTARY。 Troop figures from Entertainment Bible 39 are illustrative (SUPPLEMENTARY).",
      "旗幟為一年戰爭時期虛構徽記（自護紅底金徽；聯邦金徽藍底），皆為架空符號，非任何真實世界的違禁標誌。 Emblems are the One-Year-War fictional insignia; both are fictional, not any real-world prohibited symbol.",
    ],
    sources:"主要依據 Primary canon: 《機動戰士高達》電視動畫（日本播映第22話《姆奎夫的陷阱》、第23話《瑪蒂爾達中尉的救援》、第24話《黑色三連星》、第25話《敖德薩作戰》，Sunrise, 1979）。 Other canon: 《機動戰士高達：THE ORIGIN》漫畫/OVA（Yasuhiko, Sunrise）— 敖德薩弧；《機動戰士高達 MS IGLOO 2：重力戰線》；Netflix ONA《復仇安魂曲》（確認敖德薩為現實城市）。 References: Gundam Wiki (Battle of Odessa, Operation Odessa, M'Quve, Black Tri-Stars, White Base, Matilda Ajan); Wikipedia (Mobile Suit Gundam, One Year War, Operation Odessa); Entertainment Bible 39 (illustrative figures, SUPPLEMENTARY). Imagery: Sentinel-2 cloudless 2016 © EOX IT Services GmbH (s2maps.eu, CC BY 4.0, modified Copernicus Sentinel data). Terrain: AWS Terrain Tiles (Mapzen Terrarium / SRTM, courtesy USGS).",
  };

  return { meta, factions, ui, intro, outro, flagLegend, geography, units, arrows, fronts, weather, hotspots, storyboard, notes };
})();
