/* ================= CONFIG =================
   If you want to hand-edit REAL_TARGET_DATE below to test without
   ?preview=1, keep this EXACT format:
     'YYYY-MM-DDTHH:MM:SS+05:30'
   e.g. '2026-07-21T18:30:00+05:30' for July 21, 6:30 PM IST.
   Any other format (slashes, DD-MM-YYYY, missing the "T" or the
   timezone, etc.) can silently fail to parse in some browsers —
   the countdown then just sits frozen with no error shown. The check
   right below catches that and tells you in the console instead of
   leaving you stuck. */
const REAL_TARGET_DATE = new Date('2026-07-25T00:00:00+05:30'); // her birthday, midnight IST
const HER_NAME = "Harsha";

if(isNaN(REAL_TARGET_DATE.getTime())){
  console.error('%c⚠ REAL_TARGET_DATE did not parse — check the format in js/script.js. Falling back to "10 seconds from now" so you can still see the flow.', 'color:red;font-weight:bold;');
} else {
  console.log('%cTarget unlock time parsed as: ' + REAL_TARGET_DATE.toString(), 'color:#f0c869;');
}

/* --- PREVIEW / TEST MODE ---
   Open the site as index.html?preview=1 to fast-forward the countdown
   to ~12 seconds so you can check the whole flow without waiting for
   the real date. Send her the link WITHOUT ?preview=1.
   Add &visit=2 or &visit=3 to also preview how Buddy talks on her
   2nd / 3rd time opening the link, e.g. index.html?preview=1&visit=3

   This only reads the param fresh on each load — it does NOT stick
   around after you remove it, and it never overrides a real date
   you've hand-edited into REAL_TARGET_DATE above. */
const params = new URLSearchParams(window.location.search);
const isPreview = params.get('preview') === '1';
const SAFE_REAL_TARGET_DATE = isNaN(REAL_TARGET_DATE.getTime()) ? new Date(Date.now() + 10000) : REAL_TARGET_DATE;
const TARGET_DATE = isPreview ? new Date(Date.now() + 12000) : SAFE_REAL_TARGET_DATE;
if(isPreview){
  console.log('%cPREVIEW MODE — countdown fast-forwarded to ~12s. Remove ?preview=1 before sending the real link.', 'color:orange;font-weight:bold;');
}

/* Once it's genuinely past the unlock time (diff <= 0), every refresh
   replays the full "Access Granted" sequence again from scratch —
   so both of you can rewatch it any time, not just once. */

/* ================= BUG-SAFE TYPING =================
   The earlier per-character typing effect could split an emoji or a
   Marathi vowel-sign mid-character, which is what caused the
   occasional garbled text. Splitting only on whitespace guarantees we
   never cut a word, emoji, or combining character in half — on every
   browser, no exceptions. */
function toTypeChunks(str){
  return str.split(/(\s+)/).filter(c => c.length > 0);
}

/* ================= VISIT TRACKING =================
   She'll likely only open this 2-3 times before her birthday, so
   Buddy's "far from unlock" chatter is keyed to which visit this is,
   not to a day-count that rarely applies with a short lead time. */
let visitNum = 1;
try{
  const forcedVisit = parseInt(params.get('visit')||'', 10);
  if(isPreview && forcedVisit){
    visitNum = forcedVisit;
  } else {
    visitNum = parseInt(localStorage.getItem('harsha_site_visits')||'0') + 1;
    localStorage.setItem('harsha_site_visits', visitNum);
  }
}catch(e){}

function visitGreeting(n){
  const opts = [
    "okay, something's brewing here. come back closer to the day 👀",
    "back again already? I like that.",
    "third time checking, huh. can't blame you.",
    "alright, patience... it's actually close now.",
    "you again? at this point just wait for midnight 😄",
  ];
  return opts[Math.min(n-1, opts.length-1)];
}

/* ================= BACKGROUND STARS ================= */
(function initStars(){
  const wrap = document.getElementById('bg-stars');
  const count = window.innerWidth < 500 ? 45 : 70;
  for(let i=0;i<count;i++){
    const s = document.createElement('div');
    s.className='twinkle';
    const size = Math.random()*2.5+1;
    s.style.width = size+'px';
    s.style.height = size+'px';
    s.style.left = Math.random()*100+'%';
    s.style.top = Math.random()*100+'%';
    s.style.animationDelay = (Math.random()*4)+'s';
    s.style.animationDuration = (2.5+Math.random()*3)+'s';
    s.addEventListener('click', starClickEgg);
    s.addEventListener('touchstart', starClickEgg, {passive:true});
    wrap.appendChild(s);
  }
})();

/* ================= BUDDY ================= */
const buddyWrap = document.getElementById('buddy-wrap');
const buddyTextEl = document.getElementById('buddy-text');
let buddyBusy = false;

function say(text, speedPerChar=34){
  return new Promise(resolve=>{
    buddyWrap.style.display='flex';
    buddyBusy = true;
    buddyTextEl.textContent='';
    const chunks = toTypeChunks(text);
    let i=0;
    function step(){
      if(i>=chunks.length){ buddyBusy=false; resolve(); return; }
      const chunk = chunks[i];
      buddyTextEl.textContent += chunk;
      i++;
      const isWhitespace = chunk.trim()==='';
      const delay = isWhitespace ? 20 : Math.max(55, chunk.length*speedPerChar);
      setTimeout(step, delay);
    }
    step();
  });
}
function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function buddyBackspaceMoment(){
  await say("hmm...");
  await wait(700);
  await say("should I tell her now?");
  await wait(900);
  let cur = buddyTextEl.textContent;
  while(cur.length){ cur = cur.slice(0,-1); buddyTextEl.textContent = cur; await wait(26); }
  await wait(300);
  await say('"no..."');
  await wait(600);
  await say('"let\'s wait."');
}

/* Buddy's little in-scene reactions — this is what makes him feel like
   he's actually there with her, not just a countdown gimmick.
   Fires once per scene, quietly, without blocking that scene's own
   animation. */
const buddySceneLines = {
  'scene-reveal': `happy birthday From Birthday Buddy. I know it's just me here right now, but I really wanted to be the first one to say it From Kunal. 🎂`,
  'scene-timeline': `okay this next bit is a little embarrassing but here we go 😅`,
  'scene-scanner': `I made a whole scanner For You. mostly to roast you in प्रेमाने, Pan scanner ne khup kahi khar sangitl😜.`,
  'scene-achievements': `you've unlocked things you didn't even know were achievements 😂`,
  'scene-chat': `don't mind us, very normal and professional planning meeting 👀`,
  'scene-stars': `this part took me way longer to get right than I'll admit. hope it was worth it.`,
  'scene-wall': `no photos, I know. but I remember all of this anyway. 🤍`,
};
async function buddyReact(sceneId){
  const line = buddySceneLines[sceneId];
  if(!line || buddyBusy) return;
  await wait(400);
  if(!buddyBusy) await say(line);
}

/* ================= COUNTDOWN ================= */
const cdDays=document.getElementById('cd-days'), cdHours=document.getElementById('cd-hours'),
      cdMins=document.getElementById('cd-mins'), cdSecs=document.getElementById('cd-secs');

let unlocked = false;
let lastThreshold = null;

async function introSequence(){
  await wait(1500);
  if(unlocked) return;
  document.getElementById('lock-line2').style.opacity=1;
  await wait(1300);
  if(unlocked) return;
  document.getElementById('countdown-wrap').style.opacity=1;
  await wait(800);
  if(!isPreview && !unlocked){
    if(visitNum === 1){
      await buddyBackspaceMoment();
    } else {
      await say(visitGreeting(visitNum));
    }
  }
}
introSequence();

function pad(n){ return String(n).padStart(2,'0'); }

// Final-hour beats always apply (real urgency). Far from unlock, the
// message depends on which visit this is, since a 2-day lead time
// means the old "20 days / 10 days" messages would basically never show.
function thresholdMessage(msDiff){
  const days = msDiff/86400000;
  const hours = msDiff/3600000;

  if(hours <= 5 && hours > 0.5) return {key:'8m', en:"okay... this is actually happening."};
  if(hours*60 <= 30 && hours > 0) return {key:'4m', en:"I think she's come... 💓"};
  if(msDiff <= 60000) return {key:'last', en:"..."};

  if(days > 20) return {key:'1d', en:"you're early 😂 even I can't skip time."};
  if(days > 10) return {key:'12h', en:"we're getting closer..."};
  if(days > 5)  return {key:'1h',  en:"not gonna lie, I'm a little nervous."};

  return {key:'visit'+visitNum, en: visitGreeting(visitNum)};
}

function tick(){
  const now = new Date();
  const diff = TARGET_DATE - now;
  if(diff <= 0 && !unlocked){
    unlocked = true;
    doUnlock();
    return;
  }
  if(diff > 0){
    const d = Math.floor(diff/86400000);
    const h = Math.floor((diff%86400000)/3600000);
    const m = Math.floor((diff%3600000)/60000);
    const s = Math.floor((diff%60000)/1000);
    cdDays.textContent=pad(d); cdHours.textContent=pad(h); cdMins.textContent=pad(m); cdSecs.textContent=pad(s);

    const t = thresholdMessage(diff);
    if(t.key !== lastThreshold && !buddyBusy){
      lastThreshold = t.key;
      say(t.en);
    }
    if(diff < 60000){
      document.body.style.transition='background 2s';
      document.body.style.background = '#0a0203';
    }
  }
}
setInterval(tick, isPreview ? 300 : 1000);
tick();

/* ================= UNLOCK SEQUENCE (with blackout + Access Granted) =================
   This always plays in full whenever it's genuinely past her unlock
   time — including on a refresh — so the moment is rewatchable any
   time, not just once. */
async function doUnlock(){
  buddyWrap.style.display='none';
  stopIdleWatch();

  const blackout = document.getElementById('blackout');
  const agText = document.getElementById('ag-text');
  blackout.style.pointerEvents = 'auto';
  blackout.style.opacity = '1';
  await wait(isPreview ? 500 : 2200); // silence

  agText.style.opacity = '1';
  await wait(isPreview ? 400 : 1500);
  agText.style.opacity = '0';
  await wait(400);

  document.getElementById('scene-lock').classList.remove('active');
  const unlockScene = document.getElementById('scene-unlock');
  unlockScene.classList.add('active');

  blackout.style.opacity = '0';
  await wait(600);
  blackout.style.pointerEvents = 'none';

  const list = document.getElementById('unlock-list');
  list.innerHTML = ''; // clear in case this is a rewatch
  const lines = [
    ["Checking date...", "✔ verified"],
    ["Checking birthday...", "✔ today"],
    ["Searching...", null],
    ["Searching...", null],
    ["Searching...", `✔ ${HER_NAME} found ❤️`],
    ["Checking smile...", "100%, as always"],
    ["Checking heart...", "overflowing with kindness"],
    ["Checking chaos level...", "████████████ high, as expected 😂"],
    ["Permission request...", `Kunal wants to enter. accept?`],
    ["Access...", "denied 😏"],
    ["...just kidding.", "✔ access granted"],
    ["Opening secret universe...", null],
  ];
  for(const [a,b] of lines){
    const div = document.createElement('div');
    div.className='check-line';
    div.innerHTML = `<span class="pending">⏳</span> <span class="check-text"></span><span class="ok"></span>`;
    list.appendChild(div);
    await wait(30);
    div.classList.add('show');
    list.scrollTop = list.scrollHeight;
    const textEl = div.querySelector('.check-text');
    const chunks = toTypeChunks(a);
    for(const c of chunks){
      textEl.textContent += c;
      await wait(isPreview ? 12 : (c.trim()==='' ? 20 : 42));
    }
    await wait(isPreview ? 150 : 480);
    const pend = div.querySelector('.pending');
    if(pend) pend.textContent = '✔';
    if(b){
      div.querySelector('.ok').textContent = ' ' + b;
    }
    list.scrollTop = list.scrollHeight;
    await wait(isPreview ? 220 : 850);
  }
  await wait(900);
  unlockScene.classList.add('leaving');
  await wait(550);
  unlockScene.classList.remove('active','leaving');

  document.getElementById('scene-reveal').classList.add('active');
  triggerSceneLogic('scene-reveal');
  launchConfetti();
  buildProgressDots();
}

/* ================= NAV ================= */
const sceneOrder = ['scene-reveal','scene-timeline','scene-scanner','scene-achievements','scene-chat','scene-gift','scene-letter','scene-stars','scene-wall','scene-final'];
let sceneIndex = 0;

function buildProgressDots(){
  const wrap = document.getElementById('progress-dots');
  wrap.innerHTML = '';
  sceneOrder.forEach((id,i)=>{
    const d = document.createElement('div');
    d.className = 'dot' + (i===0 ? ' done' : '');
    wrap.appendChild(d);
  });
  wrap.style.display = 'flex';
}
function updateProgressDots(){
  const dots = document.querySelectorAll('#progress-dots .dot');
  dots.forEach((d,i)=>{ d.classList.toggle('done', i<=sceneIndex); });
}

function goNext(){
  const current = document.getElementById(sceneOrder[sceneIndex]);
  current.classList.add('leaving');
  setTimeout(()=>{
    current.classList.remove('active','leaving');
    sceneIndex++;
    updateProgressDots();
    if(sceneIndex>=sceneOrder.length){
      document.getElementById('progress-dots').style.display='none';
      return;
    }
    const next = document.getElementById(sceneOrder[sceneIndex]);
    next.classList.add('active');
    next.scrollIntoView({behavior:'smooth'});
    triggerSceneLogic(sceneOrder[sceneIndex]);
  }, 550);
}

function triggerSceneLogic(id){
  buddyReact(id);
  if(id==='scene-reveal') runReveal();
  if(id==='scene-timeline') runTimeline();
  if(id==='scene-scanner') runScanner();
  if(id==='scene-achievements') runAchievements();
  if(id==='scene-chat') runChat();
  if(id==='scene-letter') runLetter();
  if(id==='scene-stars') runStarRoom();
  if(id==='scene-wall') runWall();
  if(id==='scene-final') runFinal();
}

/* ================= REVEAL ================= */
async function runReveal(){
  const el = document.getElementById('reveal-quote');
  el.textContent = '';
  const text = `"Today isn't just another date. It's the day someone really amazing came into this world."`;
  const chunks = toTypeChunks(text);
  for(const c of chunks){ el.textContent += c; await wait(c.trim()==='' ? 20 : 90); }
}

/* ================= TIMELINE ================= */
async function runTimeline(){
  const nodes = document.querySelectorAll('.tl-node');
  const fill = document.getElementById('tl-fill');
  const total = nodes.length;
  let done = 0;
  for(const it of nodes){
    it.classList.add('show');
    done++;
    fill.style.height = (done/total*100)+'%';
    await wait(950);
  }
}

/* ================= SCANNER ================= */
async function runScanner(){
  const data = [
    {label:'Sweetness', pct:100, result:'off the charts, honestly 😍'},
    {label:'Patience', pct:35, result:'error 😂'},
    {label:'Overthinking', pct:100, result:'system overloaded 😮'},
    {label:'Misunderstanding detector', pct:100, result:'maximum level detected 😂'},
    {label:'Chaos creation ability', pct:92, result:'suspiciously high 😅'},
    {label:'Fear level', pct:15, result:"everyone else fears her. except one person. 😁"},
  ];
  const rows = document.getElementById('scan-rows');
  for(const d of data){
    const row = document.createElement('div');
    row.className='scan-row';
    row.innerHTML = `<div class="scan-label"><span>${d.label}...</span><span class="pct">0%</span></div>
      <div class="scan-bar-bg"><div class="scan-bar-fill"></div></div>
      <div class="scan-result">${d.result}</div>`;
    rows.appendChild(row);
    await wait(150);
    const fillEl = row.querySelector('.scan-bar-fill');
    const pctEl = row.querySelector('.pct');
    fillEl.style.width = d.pct+'%';
    const steps = 20;
    for(let s=1;s<=steps;s++){
      pctEl.textContent = Math.round(d.pct*s/steps)+'%';
      await wait(1350/steps);
    }
    row.querySelector('.scan-result').classList.add('show');
    await wait(500);
  }
  await wait(300);
  const verdict = document.getElementById('scan-verdict');
  verdict.innerHTML = `<b>Diagnosis:</b> chaotic, occasionally confused, and genuinely one of the good ones. 🏅`;
  verdict.classList.add('show');
  await wait(600);
  document.getElementById('scan-next').style.display='inline-block';
}

/* ================= ACHIEVEMENTS ================= */
async function runAchievements(){
  const list = [
    ['🧠','Professional overthinker','common'],
    ['🍯','Sweetest human alive','rare'],
    ['🌪️','Chaos manager','common'],
    ['👂','Certified good listener','rare'],
    ['🐌','Replies whenever she feels like it','common'],
    ['🎮','Best Friendship DLC unlocked','legendary'],
  ];
  const grid = document.getElementById('ach-grid');
  const fill = document.getElementById('ach-progress-fill');
  const counter = document.getElementById('ach-counter');
  let unlockedCount = 0;
  for(const [icon,label,rarity] of list){
    const div = document.createElement('div');
    div.className='ach' + (rarity==='legendary' ? ' legendary' : '');
    div.innerHTML = `<span class="badge">${icon}</span>${label}<span class="rarity">${rarity}</span>`;
    grid.appendChild(div);
    await wait(90);
    div.classList.add('show');
    unlockedCount++;
    fill.style.width = (unlockedCount/list.length*100)+'%';
    counter.textContent = `${unlockedCount} / ${list.length} unlocked`;
    await wait(520);
  }
}

/* ================= FAKE CHAT (messenger-style, with typing indicator) ================= */
async function runChat(){
  const lines = [
    ['buddy', `okay so today's ${HER_NAME}'s birthday.`],
    ['system', 'should we make her smile?'],
    ['buddy', 'obviously.'],
    ['system', 'budget?'],
    ['buddy', "unlimited."],
    ['system', 'time spent on this?'],
    ['buddy', 'more than I\'d like to admit.'],
    ['system', 'Tila thoda त्रास deu yaka? just for fun.'],
    ['buddy', 'absolutely, yithech tar khari maja yeyil 😂.'],
    ['system', 'worth it?'],
    ['buddy', 'yes.'],
  ];
  const names = {buddy:'🤖 Buddy', system:'⚙️ System'};
  const wrap = document.getElementById('chat-wrap');
  let lastWho = null;
  for(const [who,text] of lines){
    if(who !== lastWho){
      const label = document.createElement('div');
      label.className = 'sender-label ' + who;
      label.textContent = names[who];
      wrap.appendChild(label);
      await wait(60);
      label.classList.add('show');
      lastWho = who;
    }
    const typing = document.createElement('div');
    typing.className = 'msg typing ' + who;
    typing.innerHTML = '<span></span><span></span><span></span>';
    wrap.appendChild(typing);
    typing.classList.add('show');
    await wait(550);
    typing.remove();

    const div = document.createElement('div');
    div.className = 'msg '+who;
    div.textContent = text;
    wrap.appendChild(div);
    await wait(60);
    div.classList.add('show');
    await wait(500);
  }
  document.getElementById('chat-next').style.display='inline-block';
}

/* ================= GIFT (with a cute dodge prank + sparkle burst) ================= */
let giftTaps = 0;
let dodgesLeft = 3;
const giftHintLines = [
  "not that easy 😏",
  "Thoda try kar.",
  "not yet!",
  "okay okay, for real this time"
];

function spawnSparkles(x,y){
  for(let i=0;i<14;i++){
    const s = document.createElement('div');
    s.className='sparkle';
    s.textContent = ['✨','⭐','💛'][Math.floor(Math.random()*3)];
    s.style.left = x+'px'; s.style.top = y+'px';
    const angle = Math.random()*Math.PI*2;
    const dist = 60+Math.random()*70;
    s.style.setProperty('--dx', Math.cos(angle)*dist+'px');
    s.style.setProperty('--dy', Math.sin(angle)*dist+'px');
    document.body.appendChild(s);
    setTimeout(()=>s.remove(), 850);
  }
}

function initGiftDodge(){
  const box = document.getElementById('gift-box');
  const zone = document.getElementById('gift-zone');
  const hint = document.getElementById('gift-hint');

  function dodge(){
    const zr = zone.getBoundingClientRect();
    const maxX = Math.max(0, zr.width - 90);
    const maxY = Math.max(0, zr.height - 90);
    const nx = Math.random()*maxX - maxX/2;
    const ny = Math.random()*maxY - maxY/2;
    box.style.position='relative';
    box.style.left = nx+'px';
    box.style.top = ny+'px';
  }

  function handleTap(e){
    if(dodgesLeft > 0){
      e.preventDefault();
      dodgesLeft--;
      dodge();
      box.classList.add('shake');
      setTimeout(()=>box.classList.remove('shake'), 400);
      hint.textContent = giftHintLines[3-dodgesLeft-1] || "okay fine, take it";
      return;
    }
    const r = box.getBoundingClientRect();
    spawnSparkles(r.left+r.width/2, r.top+r.height/2);
    tapGiftReal();
  }
  box.addEventListener('click', handleTap);
  box.addEventListener('touchend', handleTap, {passive:false});
}
initGiftDodge();

function tapGiftReal(){
  giftTaps++;
  const box = document.getElementById('gift-box');
  const hint = document.getElementById('gift-hint');
  box.classList.add('shake');
  setTimeout(()=>box.classList.remove('shake'), 400);
  if(giftTaps===1){ hint.textContent='the ribbon glows...'; box.textContent='🎁✨'; }
  else if(giftTaps===2){ hint.textContent='it shakes a little...'; }
  else{
    hint.textContent='everything freezes... golden light spills out...';
    box.textContent='💫';
    setTimeout(()=>{
      const giftScene = document.getElementById('scene-gift');
      giftScene.classList.add('leaving');
      setTimeout(()=>{
        giftScene.classList.remove('active','leaving');
        sceneIndex = sceneOrder.indexOf('scene-letter');
        updateProgressDots();
        document.getElementById('scene-letter').classList.add('active');
        triggerSceneLogic('scene-letter');
      }, 550);
    }, 1300);
  }
}

/* ================= LETTER =================
   Typed word-by-word (never mid-character) so this never garbles,
   on any device. Buddy stays quiet during the letter itself, and
   speaks once, softly, right after — this part isn't supposed to be
   a joke. */
async function runLetter(){
  const text = `Dear ${HER_NAME},
Happy Birthday! 🎉❤️
First of all...
I hope you're smiling right now.
If you're not...
then mission failed already. 😂

I was thinking about what gift I could give you.
A chocolate? It'll finish in a day.
A teddy? It'll just sit in a corner.
So I thought...
Why not build something that's made only for you?
And that's how this whole little website happened.

It's funny, isn't it?
We've actually known each other for around two years...
but somehow our real friendship only started a couple of months ago.
Life is weird like that.
Sometimes the best friendships don't begin on day one.
They just happen at the right time.

One thing I've noticed about you...
You're one of the sweetest people I've met.
You care about people.
Sometimes... maybe a little too much. 😅
You even take tension for things that aren't yours.
And yes...
you also have an incredible talent for misunderstanding what I say.
I don't know how you do it...
but somehow you always manage. 😂
And let's not forget one very important fact...
Everyone is apparently scared of you.
At least that's what I keep saying. 😭
I still don't know if it's true...
but teasing you about it is way too much fun.
Now, jokes aside...

There's something I genuinely want to tell you.
I really hope this year brings you lots of happiness.
Not just today.
Not just this year.
But throughout your life.
I hope you get everything you've been quietly wishing for.
I hope you smile more than you overthink.
I hope difficult days become easier.
And I hope you always have people around you who remind you how valuable you are.
Thank you for being such a kind and sweet friend.
Even if we don't talk much in college...
our chats have made this friendship really special.
I'm glad we became friends.

Now...
khup emotional houn gel 🤧.
Go eat cake 🎂.
Aani mala visru nko, mala pan lagel cake .
(Yes, that's a legal requirement. 🍰😂)
Once again...
Happy Birthday, Harsha.
Keep smiling.
Keep being the wonderfully chaotic, calm, sweet person that you are.
The world genuinely needs more people like you.
❤️

From the guy who spent days building an entire website...
just to make you smile.
— Kunal 💜`;
  const el = document.getElementById('letter-paper');
  el.textContent='';
  const chunks = toTypeChunks(text);
  const speedPerChar = isPreview ? 3 : 20;
  for(const c of chunks){
    el.textContent += c;
    const delay = c.trim()==='' ? (isPreview?4:22) : Math.max(30, c.length*speedPerChar);
    await wait(delay);
  }
  await wait(600);
  if(!buddyBusy) await say("...yeah. I meant every word of that. 💛");
  document.getElementById('letter-next').style.display='inline-block';
}

/* ================= STAR ROOM ================= */
function textPoints(text, fontPx, w, h){
  const off = document.createElement('canvas');
  off.width=w; off.height=h;
  const ctx = off.getContext('2d');
  ctx.fillStyle='#fff';
  ctx.font = `700 ${fontPx}px 'Baloo 2', sans-serif`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(text, w/2, h/2);
  const data = ctx.getImageData(0,0,w,h).data;
  const pts = [];
  const step = 5;
  for(let y=0;y<h;y+=step){
    for(let x=0;x<w;x+=step){
      const idx = (y*w+x)*4+3;
      if(data[idx] > 120) pts.push({x,y});
    }
  }
  return pts;
}

async function runStarRoom(){
  const canvas = document.getElementById('star-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const words = [
    {text:'HAPPY', size:56},
    {text:'BIRTHDAY', size:40},
    {text:HER_NAME.toUpperCase(), size:60},
    {text:'FROM KUNAL <3', size:50},
  ];
  for(const w of words){
    ctx.clearRect(0,0,W,H);
    const pts = textPoints(w.text, w.size, W, H).sort(()=>Math.random()-0.5);
    for(const p of pts){
      ctx.beginPath();
      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,4);
      g.addColorStop(0,'#f0c869'); g.addColorStop(1,'rgba(240,200,105,0)');
      ctx.fillStyle=g;
      ctx.arc(p.x,p.y,3,0,Math.PI*2);
      ctx.fill();
      if(Math.random()<0.15) await wait(isPreview ? 0 : 2);
    }
    await wait(isPreview ? 550 : 1700);
  }

  const ambient = Array.from({length:55}, ()=>({
    x: Math.random()*W, y: Math.random()*H,
    r: 0.8 + Math.random()*1.6,
    phase: Math.random()*Math.PI*2
  }));
  let ambientRunning = true;
  const shootStar = { active:false, x:-20, y:40+Math.random()*60 };

  function drawAmbient(t){
    if(!ambientRunning) return;
    ctx.clearRect(0,0,W,H);
    ambient.forEach(p=>{
      const tw = 0.4 + 0.6*Math.abs(Math.sin(t/1400 + p.phase));
      ctx.beginPath();
      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
      g.addColorStop(0, `rgba(240,200,105,${0.8*tw})`);
      g.addColorStop(1, 'rgba(240,200,105,0)');
      ctx.fillStyle = g;
      ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2);
      ctx.fill();
    });
    if(shootStar.active){
      ctx.strokeStyle='rgba(255,255,255,0.9)';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(shootStar.x, shootStar.y); ctx.lineTo(shootStar.x-46, shootStar.y-18);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle='#fff3e6';
      ctx.arc(shootStar.x, shootStar.y, 3, 0, Math.PI*2);
      ctx.fill();
      shootStar.x += 5; shootStar.y += 1.7;
      if(shootStar.x > W+50) shootStar.active = false;
    }
    requestAnimationFrame(drawAmbient);
  }
  requestAnimationFrame(drawAmbient);

  await wait(500);
  shootStar.active = true;

  await wait(1600);
  const caption = document.getElementById('star-caption');
  caption.textContent = '✨ made under these stars, just for you';
  caption.classList.add('show');
  await wait(1200);
  document.getElementById('stars-next').style.display='inline-block';

  const stopWatcher = setInterval(()=>{
    if(!document.getElementById('scene-stars').classList.contains('active')){
      ambientRunning = false;
      clearInterval(stopWatcher);
    }
  }, 1000);
}

/* ================= MEMORY WALL ================= */
async function runWall(){
  const cards = [
    ['📍','We both met in college'],
    ['💬','the chats got longer than the lectures'],
    ['😂','the professional misunderstanding moments'],
    ['🌱','only Few months of actually being close'],
    ['🤍','one of the sweetest people I know'],
  ];
  const grid = document.getElementById('wall-grid');
  for(const [icon,cap] of cards){
    const div = document.createElement('div');
    div.className='polaroid';
    div.style.setProperty('--rot', (Math.random()*10-5)+'deg');
    div.innerHTML = `<div class="cap">${icon}</div>${cap}`;
    grid.appendChild(div);
    await wait(90);
    div.classList.add('show');
    await wait(500);
  }
}

/* ================= FINAL ================= */
function startFinalHearts(){
  const wrap = document.getElementById('final-hearts');
  const hearts = ['❤️','💛','✨'];
  setInterval(()=>{
    const h = document.createElement('div');
    h.className='final-heart';
    h.textContent = hearts[Math.floor(Math.random()*hearts.length)];
    h.style.left = (5+Math.random()*90)+'%';
    h.style.setProperty('--dx', (Math.random()*60-30)+'px');
    h.style.animationDuration = (5+Math.random()*3)+'s';
    wrap.appendChild(h);
    setTimeout(()=>h.remove(), 8000);
  }, 700);
}

async function runFinal(){
  startFinalHearts();
  const lines = [
    '"Hi Website banvanya maghe ekach Karan hota."',
    '"Tula kahitari Different gift den, I hope tula Avdl asel."',
    '"Aani tuzya chehrya var jar thodi pan smile aali asel tar hi website succesesfull jhali."',
    `happy birthday, ${HER_NAME}. वाढदिवसाच्या खूप खूप हार्दिक शुभेच्छा. 🎂`,
  ];
  const wrap = document.getElementById('final-lines');
  for(let i=0;i<lines.length;i++){
    if(i>0){
      const div = document.createElement('div');
      div.className='final-line';
      div.style.color = 'var(--gold)';
      div.style.fontSize = '.9rem';
      div.style.margin = '4px 0 14px';
      div.textContent = '✦';
      wrap.appendChild(div);
      await wait(30);
      div.classList.add('show');
      await wait(isPreview ? 250 : 700);
    }
    const div = document.createElement('div');
    div.className='final-line';
    div.textContent = lines[i];
    wrap.appendChild(div);
    await wait(120);
    div.classList.add('show');
    await wait(isPreview ? 550 : 1900);
  }
  await wait(500);
  document.getElementById('final-sign').style.opacity = 1;
  await wait(isPreview ? 800 : 1800);
  if(!buddyBusy) await say("that's everything I had for you. I'm really glad I got to be the one doing this. happy birthday. 💛");
}

/* ================= CONFETTI ================= */
function launchConfetti(){
  const canvas = document.getElementById('fx-canvas');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const colors = ['#f0c869','#e8607a','#9c1c2e','#fff3e6'];
  const pieces = Array.from({length:60}, ()=>({
    x: Math.random()*canvas.width, y: -20-Math.random()*200,
    r: 3+Math.random()*4, c: colors[Math.floor(Math.random()*colors.length)],
    vy: 1+Math.random()*2.5, vx: -1+Math.random()*2, rot: Math.random()*360
  }));
  let frame=0;
  const iv = setInterval(()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{
      p.y += p.vy; p.x += p.vx; p.rot += 4;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle = p.c; ctx.fillRect(-p.r,-p.r,p.r*2,p.r*2); ctx.restore();
    });
    frame++;
    if(frame>260){ clearInterval(iv); ctx.clearRect(0,0,canvas.width,canvas.height); }
  }, 16);
}

/* ================= MUSIC (soft generated ambient pad, no external file) ================= */
let audioCtx=null, musicOn=false, padNodes=[], padMasterGain=null;

function startPad(){
  padMasterGain = audioCtx.createGain();
  padMasterGain.gain.value = 0;
  padMasterGain.connect(audioCtx.destination);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 850;
  filter.Q.value = 0.3;
  filter.connect(padMasterGain);

  const delay = audioCtx.createDelay();
  delay.delayTime.value = 0.4;
  const feedback = audioCtx.createGain();
  feedback.gain.value = 0.22;
  delay.connect(feedback);
  feedback.connect(delay);
  filter.connect(delay);
  delay.connect(padMasterGain);

  const freqs = [130.81, 164.81, 196.00, 261.63];
  freqs.forEach((f)=>{
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = f;
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = f;
    osc2.detune.value = 7;
    const noteGain = audioCtx.createGain();
    noteGain.gain.value = 0.05;
    osc1.connect(noteGain); osc2.connect(noteGain);
    noteGain.connect(filter);
    osc1.start(); osc2.start();
    padNodes.push(osc1, osc2);
  });

  const lfo = audioCtx.createOscillator();
  lfo.frequency.value = 0.1;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0.025;
  lfo.connect(lfoGain);
  lfoGain.connect(padMasterGain.gain);
  lfo.start();
  padNodes.push(lfo);

  const now = audioCtx.currentTime;
  padMasterGain.gain.setValueAtTime(0, now);
  padMasterGain.gain.linearRampToValueAtTime(0.055, now + 3);
}

function stopPad(){
  if(padMasterGain){
    const now = audioCtx.currentTime;
    padMasterGain.gain.cancelScheduledValues(now);
    padMasterGain.gain.setValueAtTime(padMasterGain.gain.value, now);
    padMasterGain.gain.linearRampToValueAtTime(0, now + 1.4);
  }
  const nodesToStop = padNodes.slice();
  padNodes = [];
  setTimeout(()=>{ nodesToStop.forEach(n=>{ try{ n.stop(); }catch(e){} }); }, 1500);
}

function toggleMusic(){
  if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state === 'suspended') audioCtx.resume();
  if(!musicOn){
    musicOn = true;
    document.getElementById('music-toggle').textContent='🔊';
    startPad();
  } else {
    musicOn = false;
    document.getElementById('music-toggle').textContent='🔈';
    stopPad();
  }
}
document.getElementById('music-toggle').addEventListener('click', toggleMusic);

/* ================= EASTER EGGS (trimmed down to ones she'll actually see) ================= */
document.getElementById('moon-egg').addEventListener('click', async ()=>{
  if(!buddyBusy) await say(`the moon also wishes you happy birthday. 🌙`);
});

let countdownTaps = 0;
let countdownTapCooldown = false;
document.getElementById('countdown-tap-zone').addEventListener('click', async ()=>{
  if(unlocked || countdownTapCooldown) return;
  countdownTaps++;
  if(countdownTaps>=3 && !buddyBusy){
    countdownTaps = 0;
    countdownTapCooldown = true;
    await say("tapping it won't make it go faster. 😄 nice try though.");
    setTimeout(()=>{ countdownTapCooldown = false; }, 4000);
  }
});

let starClicks = 0;
function starClickEgg(){
  starClicks++;
  if(starClicks===6){
    starClicks = 0;
    const canvas = document.getElementById('fx-canvas');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    let sx=-20, sy=Math.random()*200+40;
    const shoot = setInterval(()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.strokeStyle='rgba(240,200,105,0.9)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx-50,sy-20); ctx.stroke();
      sx+=16; sy+=4;
      if(sx>canvas.width+50) clearInterval(shoot);
    }, 30);
  }
}

let hasWelcomedBack = false;
document.addEventListener('visibilitychange', async ()=>{
  if(document.visibilityState === 'visible' && !hasWelcomedBack && !unlocked && document.getElementById('scene-lock').classList.contains('active')){
    hasWelcomedBack = true;
    await wait(600);
    if(!buddyBusy) await say("welcome back. 👋");
  }
});

let idleTimer=null;
let idleWatchActive = true;
function stopIdleWatch(){
  idleWatchActive = false;
  clearTimeout(idleTimer);
  ['mousemove','keydown','click','scroll','touchstart'].forEach(ev=>document.removeEventListener(ev, resetIdle));
}
function resetIdle(){
  if(!idleWatchActive || unlocked) return;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(async ()=>{
    if(!buddyBusy && !unlocked){
      await say("still here?");
      await wait(1000);
      await say("good...");
      await wait(900);
      await say("some surprises are worth taking your time with.");
    }
  }, 45000);
}
['mousemove','keydown','click','scroll','touchstart'].forEach(ev=>document.addEventListener(ev, resetIdle));
resetIdle();

window.addEventListener('resize', ()=>{
  const c = document.getElementById('fx-canvas');
  c.width = window.innerWidth; c.height = window.innerHeight;
});
