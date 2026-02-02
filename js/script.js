/* ---------------------------
   PERSONALIZATION
---------------------------- */
const NAME_TO = 'Ruchona';
const NAME_FROM = 'Fahim';

const nameToEl = document.getElementById('name-to');
const nameFromEl = document.getElementById('name-from');
if (nameToEl) nameToEl.textContent = NAME_TO;
if (nameFromEl) nameFromEl.textContent = NAME_FROM;

/* ---------------------------
   CARDS (flip + tilt + hearts)
   Fixes:
   - tilt disabled when flipped (prevents GPU/transform stacking freeze)
   - no scrollIntoView (prevents layout thrash)
   - no meme overlay on 3rd card
---------------------------- */
const cards = Array.from(document.querySelectorAll('.card'));

cards.forEach((card, i) => {
  setTimeout(() => card.classList.add('enter'), 90 * i);

  const inner = card.querySelector('.card-inner');
  if (!inner) return;

  card.addEventListener('click', (ev) => {
    ev.stopPropagation();

    const isFlipped = card.classList.toggle('flipped');
    card.classList.toggle('expanded', isFlipped);

    // lock to a clean flip transform when flipped
    inner.style.transform = isFlipped ? 'rotateY(180deg)' : '';

    spawnHearts(card, 8);
    playChime();
  });

  // tilt only if NOT flipped
  card.addEventListener('mousemove', (e) => {
    if (card.classList.contains('flipped')) return;

    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;

    inner.style.transform = `
      rotateY(${(x * 10).toFixed(2)}deg)
      rotateX(${(-y * 6).toFixed(2)}deg)
    `;
  });

  card.addEventListener('mouseleave', () => {
    if (!card.classList.contains('flipped')) inner.style.transform = '';
  });
});

// click outside closes flipped cards (but not inside modal)
document.addEventListener('click', (e) => {
  const modal = document.getElementById('proposal-modal');
  if (modal && modal.contains(e.target)) return;
  if (e.target.closest('.card')) return;

  cards.forEach(card => {
    if (!card.classList.contains('flipped')) return;
    card.classList.remove('flipped', 'expanded');
    const inner = card.querySelector('.card-inner');
    if (inner) inner.style.transform = '';
  });
});

function spawnHearts(container, count = 6) {
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const h = document.createElement('div');
    h.className = 'heart-particle';
    h.style.left = (Math.random() * 100) + '%';
    h.style.top = (50 + Math.random() * 40) + '%';
    container.appendChild(h);
    h.addEventListener('animationend', () => h.remove());
  }
}

/* ---------------------------
   MODAL + CHARACTERS + CELEBRATION GIF
---------------------------- */
const modal = document.getElementById('proposal-modal');
const modalContent = modal ? modal.querySelector('.modal-content') : null;
const openBtn = document.getElementById('open-proposal');
const closeBtn = document.getElementById('close-modal');
const yesChar = document.getElementById('say-yes');
const noChar = document.getElementById('say-no');

const celebrationWrap = modal ? modal.querySelector('.celebration') : null;
const celebrationGif = document.getElementById('celebration-gif');

function showCelebrationGif() {
  if (!celebrationWrap) return;
  celebrationWrap.classList.add('show');
  celebrationWrap.setAttribute('aria-hidden', 'false');

  // restart gif animation on repeat clicks (cheap trick that works)
  if (celebrationGif) {
    const src = celebrationGif.getAttribute('src');
    celebrationGif.setAttribute('src', '');
    celebrationGif.setAttribute('src', src);
  }
}

function hideCelebrationGif() {
  if (!celebrationWrap) return;
  celebrationWrap.classList.remove('show');
  celebrationWrap.setAttribute('aria-hidden', 'true');
}

function startDancing() {
  if (yesChar) yesChar.classList.add('dance');
  if (noChar) noChar.classList.add('dance');
}
function stopDancing() {
  if (yesChar) yesChar.classList.remove('dance', 'shield', 'save');
  if (noChar) noChar.classList.remove('dance');
}

let lastEvadeTime = 0;
const EVADE_COOLDOWN = 600;

if (openBtn && modal) {
  openBtn.addEventListener('click', () => {
    // reset cards when modal opens
    cards.forEach(card => {
      card.classList.remove('flipped', 'expanded');
      const inner = card.querySelector('.card-inner');
      if (inner) inner.style.transform = '';
    });

    hideCelebrationGif();

    modal.setAttribute('aria-hidden', 'false');
    playChime();
    launchConfetti();

    setTimeout(() => {
      const danceActions = modal.querySelector('.dance-actions');
      if (!danceActions || !yesChar || !noChar) return;

      const b = danceActions.getBoundingClientRect();
      const centerX = Math.round(b.width / 2 - 60);
      const bottomY = Math.round(b.height - 72);

      animateCharTo(yesChar, centerX - 90, bottomY);
      animateCharTo(noChar, centerX + 30, bottomY);
    }, 50);

    startDancing();
  });
}

if (closeBtn && modal) {
  closeBtn.addEventListener('click', () => {
    modal.setAttribute('aria-hidden', 'true');
    stopDancing();
    hideCelebrationGif();

    if (yesChar) { yesChar.style.left = ''; yesChar.style.top = ''; }
    if (noChar) { noChar.style.left = ''; noChar.style.top = ''; }

    // reset cards too
    cards.forEach(card => {
      card.classList.remove('flipped', 'expanded');
      const inner = card.querySelector('.card-inner');
      if (inner) inner.style.transform = '';
    });
  });
}

// YES click -> confetti + show gif inside modal (no overlay)
if (yesChar) {
  yesChar.addEventListener('click', () => {
    const proposalText = document.querySelector('.proposal-text');
    if (proposalText) proposalText.textContent = `Yes! 💖`;

    showCelebrationGif();

    launchConfetti();
    runConfetti();
    stopConfettiAfter(8000);

    playTwinkle();
    yesChar.classList.add('shield', 'save');
    playHeroic();
    setTimeout(() => yesChar.classList.remove('shield'), 900);
    setTimeout(() => yesChar.classList.remove('save'), 1200);
  });

  yesChar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      yesChar.click();
    }
  });
}

// NO click (evasive)
if (noChar) {
  noChar.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    playBlip();
    if (modalContent) spawnHearts(modalContent, 6);

    lastEvadeTime = Date.now();
    spawnEvadeNo(Math.random() * Math.PI * 2);
  });

  noChar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      noChar.click();
    }
  });
}

// Evasion on cursor proximity
if (modalContent && modal && yesChar && noChar) {
  modalContent.addEventListener('mousemove', (e) => {
    if (!yesChar.classList.contains('dance')) return;

    const pointerX = e.clientX;
    const pointerY = e.clientY;

    const nRect = noChar.getBoundingClientRect();
    const nCenterX = nRect.left + nRect.width / 2;
    const nCenterY = nRect.top + nRect.height / 2;

    const dx = pointerX - nCenterX;
    const dy = pointerY - nCenterY;
    const dist = Math.hypot(dx, dy);

    const threshold = Math.max(70, nRect.width * 0.9);
    const now = Date.now();

    if (dist < threshold && (now - lastEvadeTime) > EVADE_COOLDOWN) {
      const angle = Math.atan2(dy, dx);
      spawnEvadeNo(angle + Math.PI * (0.6 + Math.random() * 0.6));
      playSwoosh();
      lastEvadeTime = now;

      // yes shields between pointer and no
      const danceActions = modal.querySelector('.dance-actions');
      if (!danceActions) return;

      const daBounds = danceActions.getBoundingClientRect();
      const shieldX = Math.round(((pointerX + nCenterX) / 2) - daBounds.left - 60);
      const shieldY = Math.round(daBounds.height - 72);

      animateCharTo(yesChar, shieldX, shieldY);
      yesChar.classList.add('shield');
      yesChar.style.zIndex = '15';
      playHeroic();
      setTimeout(() => {
        yesChar.classList.remove('shield');
        yesChar.style.zIndex = '10';
      }, 650);
    }
  });
}

function spawnEvadeNo(angle) {
  if (!modal || !noChar) return;

  const danceActions = modal.querySelector('.dance-actions');
  if (!danceActions) return;

  const bounds = danceActions.getBoundingClientRect();
  const padding = 25;
  const radius = Math.min(bounds.width, bounds.height) * 1.2;

  const cx = bounds.width / 2;
  const cy = bounds.height / 2;

  const tx = Math.max(
    padding,
    Math.min(bounds.width - 130, cx + Math.cos(angle) * radius - 55)
  );

  const ty = Math.max(
    padding,
    Math.min(bounds.height - 100, cy + Math.sin(angle) * radius - 45)
  );

  animateCharTo(noChar, Math.round(tx), Math.round(ty));
}

function animateCharTo(el, left, top) {
  if (!el) return;
  el.style.position = 'absolute';
  el.style.left = left + 'px';
  el.style.top = top + 'px';
  el.style.visibility = 'visible';
  el.style.opacity = '1';
  el.style.display = 'flex';
  el.style.transition =
    'left 420ms cubic-bezier(.16,.86,.24,1), top 420ms cubic-bezier(.16,.86,.24,1), transform 180ms';
}

/* ---------------------------
   CONFETTI
---------------------------- */
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let confettiPieces = [];
let confettiRunning = false;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener('resize', resizeCanvas);
resizeCanvas();

function launchConfetti() {
  if (!canvas || !ctx) return;
  confettiPieces = [];
  for (let i = 0; i < 120; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height / 2,
      vy: 2 + Math.random() * 5,
      size: 4 + Math.random() * 8,
      color: `hsl(${Math.random() * 60 + 300},70%,65%)`,
      rot: Math.random() * 360,
      vr: Math.random() * 6 - 3
    });
  }
  runConfetti();
}

function runConfetti() {
  if (!canvas || !ctx) return;
  if (confettiRunning) return;
  confettiRunning = true;

  (function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiPieces.forEach(p => {
      p.x += Math.sin(p.rot) * 0.7;
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    confettiPieces = confettiPieces.filter(p => p.y < canvas.height + 50);

    if (confettiPieces.length > 0) requestAnimationFrame(frame);
    else confettiRunning = false;
  })();
}

function stopConfettiAfter(ms) {
  setTimeout(() => { confettiPieces = []; }, ms);
}

/* ---------------------------
   AUDIO SFX (single definitions)
---------------------------- */
let audioCtx, globalGain;
function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    globalGain = audioCtx.createGain();
    globalGain.gain.value = 0.08;
    globalGain.connect(audioCtx.destination);
  }
}

function playBlip() {
  ensureAudio();
  const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'triangle';
  o.frequency.value = 880;
  o.connect(g);
  g.connect(globalGain);

  g.gain.setValueAtTime(0.0005, now);
  g.gain.linearRampToValueAtTime(0.028, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  o.start(now);
  o.stop(now + 0.12);
}

function playChime() {
  ensureAudio();
  const now = audioCtx.currentTime;
  const o1 = audioCtx.createOscillator();
  const g1 = audioCtx.createGain();
  const o2 = audioCtx.createOscillator();
  const g2 = audioCtx.createGain();

  o1.type = 'sine'; o1.frequency.value = 540;
  o2.type = 'sine'; o2.frequency.value = 720;

  o1.connect(g1); g1.connect(globalGain);
  o2.connect(g2); g2.connect(globalGain);

  g1.gain.setValueAtTime(0.0002, now);
  g2.gain.setValueAtTime(0.00015, now);

  g1.gain.linearRampToValueAtTime(0.03, now + 0.02);
  g2.gain.linearRampToValueAtTime(0.02, now + 0.02);

  g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
  g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

  o1.start(now);
  o2.start(now + 0.03);
  o1.stop(now + 0.6);
  o2.stop(now + 0.64);
}

function playTwinkle() {
  ensureAudio();
  const now = audioCtx.currentTime;
  const freqs = [780, 920, 1020];

  freqs.forEach((f, i) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    o.connect(g);
    g.connect(globalGain);

    const t = now + i * 0.06;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.02, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);

    o.start(t);
    o.stop(t + 0.28);
  });
}

function playSwoosh() {
  ensureAudio();
  const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();

  o.type = 'triangle';
  o.frequency.setValueAtTime(900, now);
  o.frequency.exponentialRampToValueAtTime(480, now + 0.18);

  o.connect(g);
  g.connect(globalGain);

  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(0.02, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  o.start(now);
  o.stop(now + 0.24);
}

function playHeroic() {
  ensureAudio();
  const now = audioCtx.currentTime;
  const freqs = [660, 880, 1050];

  freqs.forEach((f, i) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sawtooth';
    const t = now + i * 0.04;
    o.frequency.setValueAtTime(f, t);

    o.connect(g);
    g.connect(globalGain);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.025);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);

    o.start(t);
    o.stop(t + 0.28);
  });
}

/* ---------------------------
   ESC to close modal
---------------------------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal) {
    modal.setAttribute('aria-hidden', 'true');
    stopDancing();
    hideCelebrationGif();
  }
});
