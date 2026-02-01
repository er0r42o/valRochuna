// Personalize names here
const NAME_TO = 'Leila';
const NAME_FROM = 'Fahim';
document.getElementById('name-to').textContent = NAME_TO;
document.getElementById('name-from').textContent = NAME_FROM;

// Card flip behavior
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
});

// Modal
const modal = document.getElementById('proposal-modal');
document.getElementById('open-proposal').addEventListener('click', () => {
  modal.setAttribute('aria-hidden', 'false');
  playMelody();
  launchConfetti();
});
document.getElementById('close-modal').addEventListener('click', () => modal.setAttribute('aria-hidden', 'true'));

// Yes/No buttons
document.getElementById('say-yes').addEventListener('click', () => {
  document.querySelector('.proposal-text').textContent = `Yes! 💖`; 
  stopConfettiAfter(5000);
});

// Simple confetti
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

// Simple generated melody via Web Audio API
let audioCtx, oscillator, gainNode, musicPlaying=false;
function ensureAudio(){ if(!audioCtx){ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); gainNode = audioCtx.createGain(); gainNode.gain.value = 0.06; gainNode.connect(audioCtx.destination); }}
function playMelody(){ ensureAudio(); if(musicPlaying) return; musicPlaying = true; const notes=[440,554,660,880,660,554,440]; let t = audioCtx.currentTime; notes.forEach((n,i)=>{ let o = audioCtx.createOscillator(); o.type='sine'; o.frequency.value = n; o.connect(gainNode); o.start(t + i*0.25); o.stop(t + i*0.25 + 0.22); }); }
document.getElementById('toggle-music').addEventListener('click', ()=>{ if(!audioCtx || audioCtx.state==='suspended'){ ensureAudio(); audioCtx.resume().then(()=>{ musicPlaying = false; playMelody(); document.getElementById('toggle-music').textContent='Playing ♪'}) } else { document.getElementById('toggle-music').textContent='Play music ♪'; musicPlaying=false; }});

// Accessibility: close modal with Escape
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ modal.setAttribute('aria-hidden','true') } });

// Small UX: confirm prompt when leaving without answering
window.addEventListener('beforeunload', (e)=>{ e.returnValue = ""; });
