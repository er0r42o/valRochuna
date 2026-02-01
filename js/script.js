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

  // flip + hearts
  card.addEventListener('click', (ev) => {
    const idx = Number(card.getAttribute('data-index')) || 0;
    card.classList.toggle('flipped');
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

  // make one card try to dodge on hover (like maybe-later)
  if (card.getAttribute('data-index') === '2') {
    card.addEventListener('mouseenter', () => {
      const willEvade = Math.random() < 0.55;
      if (willEvade) {
        evadingMoveCard(card);
        playBlip();
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

// Modal and playful maybe-later button behavior
const modal = document.getElementById('proposal-modal');
const modalContent = modal.querySelector('.modal-content');
const openBtn = document.getElementById('open-proposal');
const closeBtn = document.getElementById('close-modal');
const yesBtn = document.getElementById('say-yes');
const noBtn = document.getElementById('say-no');
let evadeCount = 0;
let maxEvades = 6;

openBtn.addEventListener('click', () => {
  modal.setAttribute('aria-hidden', 'false');
  playChime();
  launchConfetti();
});
closeBtn.addEventListener('click', () => modal.setAttribute('aria-hidden', 'true'));

yesBtn.addEventListener('click', () => {
  document.querySelector('.proposal-text').textContent = `Yes! 💖`;
  stopConfettiAfter(5000);
  playTwinkle();
});

noBtn.addEventListener('mouseenter', (e) => {
  if (evadeCount >= maxEvades) return; // stop evading after being persistent
  moveNoButtonRandom();
  noBtn.classList.add('evade');
  setTimeout(() => noBtn.classList.remove('evade'), 300);
  playBlip();
  evadeCount++;
});

noBtn.addEventListener('click', () => {
  // playful response when caught
  if (evadeCount >= maxEvades) {
    noBtn.textContent = 'Okay, maybe later 😊';
    spawnHearts(modalContent, 10);
    playTwinkle();
  } else {
    // small blip
    playBlip();
    moveNoButtonRandom();
  }
});

function moveNoButtonRandom() {
  const bounds = modalContent.getBoundingClientRect();
  // keep within - button size approx 80x36
  const padding = 20;
  const left = Math.max(padding, Math.random() * (bounds.width - 120));
  const top = Math.max(10, Math.random() * (bounds.height - 60));
  noBtn.style.left = `${left}px`;
  noBtn.style.top = `${top}px`;
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
function ensureAudio() { if(!audioCtx){ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); globalGain = audioCtx.createGain(); globalGain.gain.value = 0.06; globalGain.connect(audioCtx.destination); }}
function playBlip(){ ensureAudio(); const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.type='sine'; o.frequency.value = 880; o.connect(g); g.connect(globalGain); g.gain.setValueAtTime(0.001, audioCtx.currentTime); g.gain.linearRampToValueAtTime(0.09, audioCtx.currentTime+0.02); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+0.22); o.start(); o.stop(audioCtx.currentTime+0.22); }
function playChime(){ ensureAudio(); const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.type='triangle'; o.frequency.value = 520; o.connect(g); g.connect(globalGain); g.gain.setValueAtTime(0.001, audioCtx.currentTime); g.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime+0.01); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+0.6); o.start(); o.stop(audioCtx.currentTime+0.6); }
function playTwinkle(){ ensureAudio(); const now = audioCtx.currentTime; for(let i=0;i<3;i++){ const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.type='sine'; o.frequency.value = 880 + i*120; o.connect(g); g.connect(globalGain); g.gain.setValueAtTime(0.0001, now + i*0.08); g.gain.linearRampToValueAtTime(0.07, now + i*0.08 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + i*0.08 + 0.26); o.start(now + i*0.08); o.stop(now + i*0.08 + 0.28); }
}

// Accessibility: close modal with Escape
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ modal.setAttribute('aria-hidden','true'); }});

// Small UX: confirm prompt when leaving without answering
window.addEventListener('beforeunload', (e)=>{ e.returnValue = ""; });
