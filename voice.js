/* =====================================================================
 *  voice.js — voiced bridge radio for the Big Tray 巴丹號 Bataan (battle layer, not engine).
 *
 *  Plays audio/<lang>/odessa/sNN_NN_<role>.wav (lang = en | yue | ja) for each storyboard shot.
 *  Odessa has no comms clock, so lines run in order: each shot's lines join one running queue as the
 *  shot begins, each plays after the previous ends, and a late line may spill a little into the next
 *  shot's camera move. Timing is read from the engine's own progress bar, so play / pause / chapter
 *  jumps all follow the tour without touching any engine file.
 *
 *  Lines marked radio get a Web Audio band-pass (~300–3400 Hz) in code. Missing files are skipped
 *  silently (the subtitle still shows). Subtitles are always 繁中 + English. Audio starts on the
 *  first pointerdown (browser autoplay policy). Voice button: EN → 粵 → 日 → OFF.
 * ===================================================================== */
(function () {
  "use strict";
  // [speaker, 中文, English, voice role, radio?] — one array per storyboard shot, in script order
  const LINES = [
    [  // act 1
      ["通訊", "截獲自護基地通訊……礦石運輸照常進行。", "Intercepted Zeon base traffic… ore shipments running as normal.", "comms"],
      ["艦長", "讓他們再挖幾天吧。", "Let them dig a few more days.", "captain"],
    ],
    [  // act 2
      ["航海", "巴丹號，已過華沙。全軍南下。", "Bataan past Warsaw. Whole army turning south.", "helm"],
      ["戰車隊長", "六一式第三中隊，跟緊大地戰艦！", "Type 61 Third Company, stay tight on the land battleship!", "tank", 1],
      ["艦長", "下一站，黑海。", "Next stop, the Black Sea.", "captain"],
    ],
    [  // act 3
      ["轟炸機隊", "基輔第一轟炸大隊，投彈開始！", "Kyiv First Bomber Wing — bombs away!", "bomber", 1],
      ["雷達", "安卡拉砲兵彈著，基地外圍。", "Ankara artillery impacting on the base perimeter.", "sensors"],
      ["自護基地", "防空隊！東面！快！", "Flak teams! East side! Move!", "zeonbase", 1],
    ],
    [  // act 4
      ["雷達", "白色基地方向，高速反應三個——是新型！", "Three fast contacts near White Base — a new type!", "sensors"],
      ["通訊", "補給機隊遭到攻擊！", "Supply flight under attack!", "comms"],
      ["通訊", "……梅迪亞運輸機，失去聯絡。", "…Medea transport — contact lost.", "comms"],
      ["艦長", "……全體，向她致敬。", "…All hands, salute her.", "captain"],
    ],
    [  // act 5
      ["通訊", "司令部急電：艾倫將軍的部隊……原地未動。", "Urgent from HQ: General Elran's troops… haven't moved.", "comms"],
      ["艦長", "叛徒？", "A traitor?", "captain"],
      ["通訊", "陰謀已揭穿。命令：全軍湧入缺口！", "Plot uncovered. Orders: everyone into the gap!", "comms"],
    ],
    [  // act 6
      ["艦長", "主砲，齊射！", "Main guns — full salvo!", "captain"],
      ["戰車隊長", "防線破了！衝啊！", "The line's broken! Go, go!", "tank", 1],
      ["雷達", "自護防線……正在崩潰。", "Zeon's line… is collapsing.", "sensors"],
    ],
    [  // act 7
      ["雷達", "基地方向，大型艦起飛——贊西巴爾級！", "Large ship lifting off the base — Zanzibar class!", "sensors"],
      ["雷達", "……飛彈發射！單發，高拋物線。", "…Missile launch! Single, high arc.", "sensors"],
      ["通訊", "輻射特徵確認——是核彈！", "Radiation signature confirmed — it's a nuke!", "comms"],
      ["艦長", "南極條約……他們瘋了。", "The Antarctic Treaty… they've lost their minds.", "captain"],
    ],
    [  // act 8
      ["雷達", "一架 MS……正在追飛彈！", "One mobile suit… chasing the missile!", "sensors"],
      ["通訊", "是白色基地的高達！", "It's White Base's Gundam!", "comms"],
      ["雷達", "……飛彈信號消失。沒有核爆。", "…Missile signal gone. No detonation.", "sensors"],
      ["艦長", "……幹得好，小子。", "…Well done, kid.", "captain"],
    ],
    [  // act 9
      ["雷達", "基地多處發射——是 HLV！", "Multiple launches from the base — HLVs!", "sensors"],
      ["砲術", "射程不夠！攔不住！", "Out of range! Can't stop them!", "fire"],
      ["艦長", "……讓他們上去吧。仗還沒打完。", "…Let them go. This war isn't over.", "captain"],
    ],
    [  // act 10
      ["通訊", "敖德薩基地，升起白旗。", "Odessa base is flying the white flag.", "comms"],
      ["艦長", "歐洲……光復了。", "Europe… is free.", "captain"],
      ["通訊", "司令部命令：準備進軍宇宙。", "Orders from HQ: prepare for space.", "comms"],
    ],
  ];
  const ROLE_EN = { captain: "CAPTAIN", comms: "COMMS", sensors: "RADAR", helm: "HELM", fire: "GUNNERY",
    tank: "TANK LEAD", bomber: "BOMBER LEAD", zeonbase: "ZEON BASE · INTERCEPT" };
  const LANGS = ["en", "yue", "ja", "off"];
  const LABEL = { en: "VOICE EN", yue: "語音 粵", ja: "音声 日", off: "VOICE OFF" };
  const KEY = "odessa.voiceLang";
  // one running queue across the tour (timings tuned against the real clip lengths in all three languages):
  // a shot's lines join the queue START s into the shot, play GAP s apart, and a late line may still start up to
  // SPILL s into the next shot's camera move rather than being dropped.
  const START = 0.4, GAP = 0.3, SPILL = 2.2;
  const TWEEN = 2.4;                           // must match the engine's CFG.TWEEN
  const pad = n => String(n).padStart(2, "0");

  let lang = "en";
  try { const s = localStorage.getItem(KEY); if (LANGS.includes(s)) lang = s; } catch (e) {}
  const D = window.BATTLE_DATA, N = D.storyboard.length;
  const missing = new Set();
  let AC = null, dry = null, wet = null, el = null;

  function initAudio() {
    if (AC) { AC.resume(); return; }
    const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return;
    AC = new Ctx();
    el = new Audio(); el.preload = "auto";
    const src = AC.createMediaElementSource(el);
    dry = AC.createGain(); wet = AC.createGain();
    const hp = AC.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 300; hp.Q.value = 0.7;
    const lp = AC.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3400; lp.Q.value = 0.7;
    const sh = AC.createWaveShaper(), c = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; c[i] = Math.tanh(2.2 * x) / Math.tanh(2.2); }
    sh.curve = c; sh.oversample = "2x";
    src.connect(dry).connect(AC.destination);
    src.connect(hp).connect(lp).connect(sh).connect(wet).connect(AC.destination);
    el.addEventListener("ended", () => { if (cur) cur.audioDone = true; });
    el.addEventListener("error", () => { if (cur) { missing.add(cur.url); cur.audioDone = true; cur.minEnd = cur.read; } });
    AC.resume();
  }
  addEventListener("pointerdown", initAudio, { once: true, capture: true });

  /* ---- subtitle box (painted here so index.html stays battle-agnostic) ---- */
  const css = document.createElement("style");
  css.textContent =
    "#vo-sub{position:fixed;z-index:6;left:50%;top:64px;transform:translateX(-50%);max-width:min(620px,calc(100vw - 32px));" +
    "padding:7px 14px 8px;border-left:2px solid var(--accent,#d8c08a);background:rgba(6,8,12,.62);backdrop-filter:blur(3px);" +
    "opacity:0;transition:opacity .25s;pointer-events:none;text-align:left}" +
    "#vo-sub.on{opacity:1}" +
    "#vo-sub .w{display:block;font-family:var(--mono);font-size:9.5px;letter-spacing:2px;color:var(--accent,#d8c08a)}" +
    "#vo-sub .z{display:block;font-family:var(--font-display);font-size:15px;color:#f6efda;margin-top:2px}" +
    "#vo-sub .e{display:block;font-family:var(--mono);font-size:11px;font-style:italic;color:#ded4b8;margin-top:2px}" +
    "#vo-sub.radio .w::after{content:' · RADIO';opacity:.7}" +
    "#voice-btn{margin-left:6px}#voice-btn.off{opacity:.5}";
  document.head.appendChild(css);
  const sub = document.createElement("div"); sub.id = "vo-sub";
  sub.innerHTML = '<span class="w"></span><span class="z"></span><span class="e"></span>';
  document.body.appendChild(sub);

  const btn = document.getElementById("voice-btn");
  const paint = () => { if (!btn) return; btn.textContent = LABEL[lang]; btn.classList.toggle("off", lang === "off"); };
  if (btn) btn.addEventListener("click", () => {
    lang = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    if (el) el.pause(); if (cur) cur.audioDone = true;
    paint();
  });
  paint();

  /* ---- the line scheduler, clocked by the engine's progress bar ---- */
  const bar = document.querySelector("#prog > i"), playBtn = document.getElementById("play"), resumeEl = document.getElementById("resume");
  const CUM = [0]; D.storyboard.forEach((sh, i) => CUM.push(CUM[i] + TWEEN + sh.hold));
  let shot = -1, queue = [], free = 0, cur = null, lastT = -1, wasRunning = false;

  function show(line) {
    sub.querySelector(".w").textContent = line[0] + "  " + (ROLE_EN[line[3]] || "");
    sub.querySelector(".z").textContent = line[1];
    sub.querySelector(".e").textContent = line[2];
    sub.classList.toggle("radio", line[4] === 1);
    sub.classList.add("on");
  }
  function finish() { if (el) el.pause(); sub.classList.remove("on"); cur = null; }
  function enqueue(i, T) {   // shot i's lines, playable from START s into the shot until SPILL s into the next one
    (LINES[i] || []).forEach((line, k) => queue.push({ i, k, line, from: CUM[i] + START, until: CUM[i + 1] + SPILL }));
  }
  function reset(i, T) { finish(); queue = []; free = T; shot = i; if (i < N) enqueue(i, T); }

  function start(q, T) {
    const url = `audio/${lang}/odessa/s${pad(q.i + 1)}_${pad(q.k + 1)}_${q.line[3]}.wav`;
    // subtitle-only reading time when there is no audio (off, missing, or not yet unlocked)
    const read = T + Math.max(2.4, q.line[2].length * 0.065);
    cur = { minEnd: read, read, url, audioDone: true };
    show(q.line);
    if (lang !== "off" && AC && !missing.has(url)) {
      cur.audioDone = false; cur.minEnd = T + 1.2;
      const now = AC.currentTime, radio = q.line[4] === 1;
      dry.gain.setValueAtTime(radio ? 0 : 1, now); wet.gain.setValueAtTime(radio ? 1.25 : 0, now);
      el.src = url; el.play().catch(() => { if (cur) { cur.audioDone = true; cur.minEnd = cur.read; } });
    }
  }

  function tick() {
    requestAnimationFrame(tick);
    if (!bar || !D) return;
    const f = parseFloat(bar.style.width) / 100 * N;
    const running = playBtn && playBtn.textContent === "⏸" && !(resumeEl && resumeEl.classList.contains("show"));
    if (running !== wasRunning) { wasRunning = running; if (el && cur && !cur.audioDone) { if (running) el.play().catch(() => {}); else el.pause(); } }
    if (!(f >= 0)) return;
    const i = Math.min(Math.floor(f), N), T = f >= N ? CUM[N] : CUM[i] + (f - i) * (TWEEN + D.storyboard[i].hold);
    const jumped = T < lastT - 0.05 || T > lastT + 1.5;          // a chapter jump or restart, not normal playback
    lastT = T;
    if (jumped) reset(i, T);
    else if (i !== shot) { shot = i; if (i < N) enqueue(i, T); }  // natural advance: the playing line carries over
    if (cur && cur.audioDone && T >= cur.minEnd) { finish(); free = T + GAP; }
    while (queue.length && T >= queue[0].until) queue.shift();    // too late to start: drop
    if (!cur && running && queue.length && T >= free && T >= queue[0].from) start(queue.shift(), T);
  }
  requestAnimationFrame(tick);
})();
