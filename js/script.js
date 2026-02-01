// Personalize names here
const NAME_TO = 'Ruchona Aziz';
const NAME_FROM = 'Fahim';
document.getElementById('name-to').textContent = NAME_TO;
document.getElementById('name-from').textContent = NAME_FROM;

// Card behaviors: entry, tilt, flip + heart particles and some playful card actions
const cards = Array.from(document.querySelectorAll('.card'));
cards.forEach((card, i) => {
  // entry animation
  setTimeout(() => card.classList.add('enter'), 90 * i);

  // tilt effect
  const inner = card.querySelector('.card-inner');
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
    const y = (e.clientY - r.top) / r.height - 0.5;
    const rotateY = (x * 10).toFixed(2);
    const rotateX = (-y * 6).toFixed(2);
    const isFlipped = card.classList.contains('flipped');
    inner.style.transform = `${isFlipped ? 'rotateY(180deg)' : ''} rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    // keep the flip state if flipped
    const isFlipped = card.classList.contains('flipped');
    inner.style.transform = isFlipped ? 'rotateY(180deg)' : '';
  });

  // flip + hearts — flip and expand when flipped
  // keeps breathing animation when not flipped
  card.addEventListener('click', (ev) => {
    const idx = Number(card.getAttribute('data-index')) || 0;
    card.classList.toggle('flipped');
    // expand when flipped
    if (card.classList.contains('flipped')) {
      card.classList.add('expanded');
      // bring into view a bit
      card.scrollIntoView({behavior: 'smooth', block: 'center'});
    } else {
      card.classList.remove('expanded');
    }
    spawnHearts(card, 8);
    playChime();

    // special behaviors per card
    if (idx === 2) { // second card: try to dodge you a bit when interacted
      dodgeCard(card);
    }
    if (idx === 3) { // third card: pop a silly meme overlay
      showMemeOverlay();
    }
  });

  // make one card try to dodge when the cursor gets close (distance-based)
  if (card.getAttribute('data-index') === '2') {
    let last = 0;
    card.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - last < 420) return;
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const d = Math.hypot(dx,dy);
      if (d < Math.max(120, r.width * 0.9)){
        evadingMoveCard(card);
        playSwoosh();
        last = now;
      }
    });
  }
});

function spawnHearts(card, count = 6) {
  for (let i = 0; i < count; i++) {
    const h = document.createElement('div');
    h.className = 'heart-particle';
    const left = Math.random() * 100;
    const top = 50 + Math.random() * 40;
    h.style.left = left + '%';
    h.style.top = top + '%';
    card.appendChild(h);
    h.addEventListener('animationend', () => h.remove());
  }
}

function dodgeCard(card) {
  // quick hop to a nearby position
  card.style.transition = 'transform 260ms cubic-bezier(.25,.9,.3,1)';
  card.style.transform = `translate(${(Math.random()*120-60).toFixed(0)}px, ${(Math.random()*40-20).toFixed(0)}px)`;
  setTimeout(()=>{ card.style.transform = ''; }, 480);
}
function evadingMoveCard(card) {
  const parent = card.parentElement;
  const pRect = parent.getBoundingClientRect();
  // small random translate staying within visible area
  const tx = (Math.random()* (pRect.width*0.5) - pRect.width*0.25).toFixed(0);
  const ty = (Math.random()* 40 - 20).toFixed(0);
  card.style.transition = 'transform 320ms cubic-bezier(.2,.85,.3,1)';
  card.style.transform = `translate(${tx}px, ${ty}px) scale(1.02)`;
  setTimeout(()=>{ card.style.transform = ''; }, 600);
}

// Modal and character behavior
const modal = document.getElementById('proposal-modal');
const modalContent = modal.querySelector('.modal-content');
const openBtn = document.getElementById('open-proposal');
const closeBtn = document.getElementById('close-modal');
const yesChar = document.getElementById('say-yes');
const noChar = document.getElementById('say-no');

// Dancing characters
function startDancing(){ yesChar.classList.add('dance'); noChar.classList.add('dance'); }
function stopDancing(){ yesChar.classList.remove('dance'); noChar.classList.remove('dance'); }


// Dancing characters
function startDancing(){ yesChar.classList.add('dance'); noChar.classList.add('dance'); }
function stopDancing(){ yesChar.classList.remove('dance'); noChar.classList.remove('dance'); }

// Open modal: reset positions, start dancing
openBtn.addEventListener('click', () => {
  modal.setAttribute('aria-hidden', 'false');
  playChime();
  launchConfetti();
  // Place characters absolutely inside the modal so they can animate and evade
  const bounds = modalContent.getBoundingClientRect();
  // coordinates relative to modalContent
  const centerX = Math.round(bounds.width/2 - 55);
  const bottomY = Math.round(bounds.height - 88);
  // set absolute positions
  animateCharTo(yesChar, centerX - 80, bottomY);
  animateCharTo(noChar, centerX + 20, bottomY);
  // start dancing animation
  startDancing();
});

closeBtn.addEventListener('click', () => { 
  modal.setAttribute('aria-hidden', 'true');
  stopDancing();
});

// Yes character click
});

// Yes character click
yesChar.addEventListener('click', () => {
  document.querySelector('.proposal-text').textContent = `Yes! 💖`;
  stopConfettiAfter(5000);
  playTwinkle();
  yesChar.classList.add('shield','save');
  playHeroic();
  setTimeout(()=>{ yesChar.classList.remove('shield'); }, 1400);
  setTimeout(()=>{ yesChar.classList.remove('save'); }, 1600);
});

// No character click (evasive)
noChar.addEventListener('click', (e) => {
  e.preventDefault(); e.stopPropagation();
  playBlip();
  spawnHearts(modalContent, 6);
  spawnEvadeNo(Math.random()*Math.PI*2);
});

// Monitor pointer near No character
// Dancing characters: yesChar and noChar (yes shields, no evades unselectable)
const yesChar = document.getElementById('say-yes');
const noChar = document.getElementById('say-no');
// cooldown to avoid repeated evasion spam
let lastEvadeTime = 0;
const EVADE_COOLDOWN = 700; // ms
// initial dance
function startDancing(){ yesChar.classList.add('dance'); noChar.classList.add('dance'); }
function stopDancing(){ yesChar.classList.remove('dance'); noChar.classList.remove('dance'); }

// place characters inside modal actions when modal opens
openBtn.addEventListener('click', () => {
  modal.setAttribute('aria-hidden', 'false');
  playChime();
  launchConfetti();
  // position the characters
  const b = modalContent.getBoundingClientRect();
  const centerX = Math.round(b.width/2 - 60);
  animateCharTo(yesChar, centerX - 90, Math.round(b.height - 72));
  animateCharTo(noChar, centerX + 30, Math.round(b.height - 72));
  startDancing();
});

// yes behavior (selecting Yes)
yesChar.addEventListener('click', () => {
  document.querySelector('.proposal-text').textContent = `Yes! 💖`;
  stopConfettiAfter(5000);
  playTwinkle();
  // victory save animation + heroic sound
  yesChar.classList.add('shield','save');
  playHeroic();
  setTimeout(()=>{ yesChar.classList.remove('shield'); }, 1400);
  setTimeout(()=>{ yesChar.classList.remove('save'); }, 1600);
});

// No character click (evasive)
noChar.addEventListener('click', (e) => {
  e.preventDefault(); e.stopPropagation();
  playBlip();
// No is intentionally unselectable; clicks cause it to dodge further
noChar.addEventListener('click', (e) => {
  e.preventDefault(); e.stopPropagation();
  playBlip();
  // dramatic dodge and brief pulse
  spawnHearts(modalContent, 6);
  spawnEvadeNo(Math.random()*Math.PI*2);
});

// Monitor pointer near No character
// Monitor pointer, move noChar away when cursor approaches, move yesChar to shield position
modalContent.addEventListener('mousemove', (e) => {
  const pointer = { x: e.clientX, y: e.clientY };
  const nRect = noChar.getBoundingClientRect();
  const nCenter = { x: nRect.left + nRect.width/2, y: nRect.top + nRect.height/2 };
  const dx = pointer.x - nCenter.x, dy = pointer.y - nCenter.y;
  const dist = Math.hypot(dx,dy);
  const threshold = Math.max(90, nRect.width * 1.1);
  const now = Date.now();
  if (dist < threshold && (now - lastEvadeTime) > EVADE_COOLDOWN) {
    const angle = Math.atan2(dy, dx);
    spawnEvadeNo(angle + Math.PI * (0.6 + Math.random() * 0.6));
    playSwoosh();
    lastEvadeTime = now;

    // yesChar shields: move between pointer and noChar
    const modalBounds = modalContent.getBoundingClientRect();
    const shieldX = Math.round((pointer.x + nCenter.x)/2 - modalBounds.left - 60);
    const shieldY = Math.round(modalBounds.height - 72);
    animateCharTo(yesChar, shieldX, shieldY);
    yesChar.classList.add('shield','save');
    playHeroic();
    setTimeout(()=>{ yesChar.classList.remove('shield'); }, 700);
    setTimeout(()=>{ yesChar.classList.remove('save'); }, 1000);
  }
});

function spawnEvadeNo(angle){
  const bounds = modalContent.getBoundingClientRect();
  const padding = 18; const radius = Math.min(bounds.width,bounds.height) * 0.45 + 60;
  const cx = bounds.left + bounds.width/2; const cy = bounds.top + bounds.height/2;
  const tx = Math.max(padding, Math.min(bounds.width - 100, (cx + Math.cos(angle) * radius) - bounds.left));
  const ty = Math.max(padding, Math.min(bounds.height - 68, (cy + Math.sin(angle) * radius) - bounds.top));
  animateCharTo(noChar, Math.round(tx), Math.round(ty));
}

function animateCharTo(el, left, top){
  el.style.position = 'absolute';
  el.style.left = left + 'px';
  el.style.top = top + 'px';
  el.style.transition = 'left 360ms cubic-bezier(.16,.86,.24,1), top 360ms cubic-bezier(.16,.86,.24,1), transform 220ms';
}
}

function animateCharTo(el, left, top){
  el.style.position = 'absolute';
  el.style.left = left + 'px';
  el.style.top = top + 'px';
  el.style.transition = 'left 360ms cubic-bezier(.16,.86,.24,1), top 360ms cubic-bezier(.16,.86,.24,1), transform 220ms';
}
}

function animateCharTo(el, left, top){
  // left/top are modal-content-relative coordinates
  el.style.position = 'absolute';
  el.style.left = left + 'px';
  el.style.top = top + 'px';
  el.style.transition = 'left 360ms cubic-bezier(.16,.86,.24,1), top 360ms cubic-bezier(.16,.86,.24,1), transform 220ms';
}

// When modal closes, stop dancing and reset positions
closeBtn.addEventListener('click', ()=>{ stopDancing(); yesChar.style.left=''; yesChar.style.top=''; noChar.style.left=''; noChar.style.top=''; });

// confetti canvas (kept from earlier implementation)
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let confettiPieces = [];
function resizeCanvas(){canvas.width = innerWidth; canvas.height = innerHeight}
addEventListener('resize', resizeCanvas); resizeCanvas();
function launchConfetti(){ confettiPieces = []; for(let i=0;i<120;i++){confettiPieces.push({x:Math.random()*canvas.width,y:Math.random()*-canvas.height/2,vy:2+Math.random()*5, size:4+Math.random()*8, color:`hsl(${Math.random()*60+300},70%,65%)`, rot:Math.random()*360, vr:Math.random()*6-3 })}
  runConfetti();}
let confettiRunning = false;
function runConfetti(){ if(confettiRunning) return; confettiRunning = true; (function frame(){ ctx.clearRect(0,0,canvas.width,canvas.height); confettiPieces.forEach(p=>{ p.x += Math.sin(p.rot)*0.7; p.y += p.vy; p.rot += p.vr; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180); ctx.fillStyle = p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6); ctx.restore(); }); confettiPieces = confettiPieces.filter(p=>p.y < canvas.height+50); if(confettiPieces.length>0){ requestAnimationFrame(frame) } else { confettiRunning = false } })() }
function stopConfettiAfter(ms){ setTimeout(()=>{ confettiPieces = [] }, ms) }

// Meme overlay: show an image from assets/meme1.svg if available or use emoji fallback
let memeOverlay = null;
function showMemeOverlay(){
  if (!memeOverlay) {
    memeOverlay = document.createElement('div');
    memeOverlay.id = 'meme-overlay';
    memeOverlay.className = 'meme-overlay';
    memeOverlay.innerHTML = `<div class='meme-card'><img src='assets/meme1.svg' alt='meme' onerror="this.closest('.meme-overlay').classList.add('no-img')"></div>`;
    memeOverlay.addEventListener('click', () => { memeOverlay.style.opacity = 0; setTimeout(()=>memeOverlay.remove(),300); memeOverlay = null; playTwinkle(); });
    document.body.appendChild(memeOverlay);
  }
}

// Simple WebAudio helpers for SFX
let audioCtx, globalGain;
function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    globalGain = audioCtx.createGain();
    // softer overall volume for subtle / cute sounds
    globalGain.gain.value = 0.03;
    globalGain.connect(audioCtx.destination);
  }
}

function playBlip(){
  ensureAudio();
  const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'triangle';
  o.frequency.value = 880;
  o.connect(g); g.connect(globalGain);
  g.gain.setValueAtTime(0.0005, now);
  g.gain.linearRampToValueAtTime(0.028, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  o.start(now); o.stop(now + 0.12);
}

function playChime(){
  ensureAudio();
  const now = audioCtx.currentTime;
  // gentle two-note chime
  const o1 = audioCtx.createOscillator(); const g1 = audioCtx.createGain();
  const o2 = audioCtx.createOscillator(); const g2 = audioCtx.createGain();
  o1.type = 'sine'; o1.frequency.value = 540; o1.connect(g1); g1.connect(globalGain);
  o2.type = 'sine'; o2.frequency.value = 720; o2.connect(g2); g2.connect(globalGain);
  g1.gain.setValueAtTime(0.0002, now); g2.gain.setValueAtTime(0.00015, now);
  g1.gain.linearRampToValueAtTime(0.03, now + 0.02); g2.gain.linearRampToValueAtTime(0.02, now + 0.02);
  g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.6); g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
  o1.start(now); o2.start(now + 0.03);
  o1.stop(now + 0.6); o2.stop(now + 0.64);
}

function playTwinkle(){
  ensureAudio();
  const now = audioCtx.currentTime;
  const freqs = [780, 920, 1020];
  freqs.forEach((f,i)=>{
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(globalGain);
    g.gain.setValueAtTime(0.0001, now + i*0.06);
    g.gain.linearRampToValueAtTime(0.02, now + i*0.06 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + i*0.06 + 0.24);
    o.start(now + i*0.06); o.stop(now + i*0.06 + 0.28);
  });
}

function playSwoosh(){
  ensureAudio();
  const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
  o.type = 'triangle'; o.frequency.setValueAtTime(900, now); o.frequency.exponentialRampToValueAtTime(480, now + 0.18);
  o.connect(g); g.connect(globalGain);
  g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(0.02, now + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  o.start(now); o.stop(now + 0.24);
}

// Gentle 'heroic' save — soft layered sine chord
function playHeroic(){
  ensureAudio();
  const now = audioCtx.currentTime;
  const freqs = [520, 660, 840];
  freqs.forEach((f,i)=>{
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f, now + i*0.03); o.connect(g); g.connect(globalGain);
    g.gain.setValueAtTime(0.0001, now + i*0.03);
    g.gain.linearRampToValueAtTime(0.04, now + i*0.03 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, now + i*0.03 + 0.36);
    o.start(now + i*0.03); o.stop(now + i*0.03 + 0.4);
  });
}
// Heroic 'save' SFX used by Yes when shielding/clicked
function playHeroic(){ ensureAudio(); const now = audioCtx.currentTime; const freqs = [660,880,1050]; freqs.forEach((f,i)=>{ const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(f, now + i*0.04); o.connect(g); g.connect(globalGain); g.gain.setValueAtTime(0.0001, now + i*0.04); g.gain.linearRampToValueAtTime(0.12, now + i*0.04 + 0.025); g.gain.exponentialRampToValueAtTime(0.0001, now + i*0.04 + 0.26); o.start(now + i*0.04); o.stop(now + i*0.04 + 0.28); }); }
// Accessibility: close modal with Escape
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ modal.setAttribute('aria-hidden','true'); }});

// Small UX: confirm prompt when leaving without answering
window.addEventListener('beforeunload', (e)=>{ e.returnValue = ""; });
