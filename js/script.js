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
  
  card.addEventListener('click', (ev) => {
    // Stop propagation so clicking a card doesn't trigger global unflip
    ev.stopPropagation();
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

    // all cards flip and breathe uniformly
    if (idx === 3) { // third card: pop a silly meme overlay
      showMemeOverlay();
    }
  });
  
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






// Dance helpers
function startDancing(){ yesChar.classList.add('dance'); noChar.classList.add('dance'); }
function stopDancing(){ yesChar.classList.remove('dance'); noChar.classList.remove('dance'); }

// cooldown to avoid repeated evasion spam
let lastEvadeTime = 0;
const EVADE_COOLDOWN = 600;

// Open modal: position characters and start dancing
openBtn.addEventListener('click', () => {
  // unflip all cards when opening modal
  cards.forEach(card => {
    card.classList.remove('flipped', 'expanded');
    const inner = card.querySelector('.card-inner');
    inner.style.transform = '';
  });
  
  modal.setAttribute('aria-hidden', 'false');
  playChime();
  launchConfetti();
  // Wait for modal to render before positioning characters
  setTimeout(() => {
    const danceActions = modal.querySelector('.dance-actions');
    const b = danceActions.getBoundingClientRect();
    const centerX = Math.round(b.width/2 - 60);
    const bottomY = Math.round(b.height - 72);
    animateCharTo(yesChar, centerX - 90, bottomY);
    animateCharTo(noChar, centerX + 30, bottomY);
  }, 50);
  startDancing();
});

// Close modal
closeBtn.addEventListener('click', () => {
  modal.setAttribute('aria-hidden', 'true');
  stopDancing();
  yesChar.style.left=''; yesChar.style.top='';
  noChar.style.left=''; noChar.style.top='';
  // unflip any open cards
  cards.forEach(card => {
    card.classList.remove('flipped', 'expanded');
    const inner = card.querySelector('.card-inner');
    inner.style.transform = '';
  });
});

// Global click handler to unflip cards when clicking outside
document.addEventListener('click', (e) => {
  // don't unflip if clicking on the modal or a card
  if (modal.contains(e.target) || e.target.closest('.card')) return;
  cards.forEach(card => {
    if (card.classList.contains('flipped')) {
      card.classList.remove('flipped', 'expanded');
      const inner = card.querySelector('.card-inner');
      inner.style.transform = '';
    }
  });
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
  e.stopImmediatePropagation();
  playBlip();
  spawnHearts(modalContent, 6);
  lastEvadeTime = Date.now();
  spawnEvadeNo(Math.random()*Math.PI*2);
});

// Keyboard accessibility for characters
yesChar.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); yesChar.click(); }});
noChar.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); noChar.click(); }});

// Monitor pointer, move noChar away when cursor approaches, move yesChar to shield position
modalContent.addEventListener('mousemove', (e) => {
  // disable evasion while dancing (during initial animation)
  if (!yesChar.classList.contains('dance')) return;
  
  const pointer = { x: e.clientX, y: e.clientY };
  const nRect = noChar.getBoundingClientRect();
  const nCenter = { x: nRect.left + nRect.width/2, y: nRect.top + nRect.height/2 };
  const dx = pointer.x - nCenter.x, dy = pointer.y - nCenter.y;
  const dist = Math.hypot(dx,dy);
  const threshold = Math.max(70, nRect.width * 0.9);
  const now = Date.now();
  if (dist < threshold && (now - lastEvadeTime) > EVADE_COOLDOWN) {
    const angle = Math.atan2(dy, dx);
    spawnEvadeNo(angle + Math.PI * (0.6 + Math.random() * 0.6));
    playSwoosh();
    lastEvadeTime = now;

    // yesChar shields: move between pointer and noChar
    const danceActions = modal.querySelector('.dance-actions');
    const daBounds = danceActions.getBoundingClientRect();
    const nBounds = noChar.getBoundingClientRect();
    const shieldX = Math.round((pointer.x + nBounds.left + nBounds.width/2)/2 - daBounds.left - 60);
    const shieldY = Math.round(daBounds.height - 72);
    animateCharTo(yesChar, shieldX, shieldY);
    yesChar.classList.add('shield');
    yesChar.style.zIndex = '15';
    playHeroic();
    setTimeout(()=>{ yesChar.classList.remove('shield'); yesChar.style.zIndex = '10'; }, 700);
  }
});

function spawnEvadeNo(angle){
  const danceActions = modal.querySelector('.dance-actions');
  const bounds = danceActions.getBoundingClientRect();
  const padding = 25;
  const radius = Math.min(bounds.width, bounds.height) * 0.40;
  const cx = bounds.width / 2;
  const cy = bounds.height / 2;
  const tx = Math.max(padding, Math.min(bounds.width - 130, cx + Math.cos(angle) * radius - 55));
  const ty = Math.max(padding, Math.min(bounds.height - 100, cy + Math.sin(angle) * radius - 45));
  animateCharTo(noChar, Math.round(tx), Math.round(ty));
}

function animateCharTo(el, left, top){
  // left/top are dance-actions-relative coordinates
  el.style.position = 'absolute';
  el.style.left = left + 'px';
  el.style.top = top + 'px';
  el.style.visibility = 'visible';
  el.style.opacity = '1';
  el.style.display = 'flex';
  el.style.transition = 'left 600ms cubic-bezier(.16,.86,.24,1), top 600ms cubic-bezier(.16,.86,.24,1), transform 280ms';
}


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
    // volume for cute sounds (audible but not too loud)
    globalGain.gain.value = 0.08;
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
