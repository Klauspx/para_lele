/* =========================================================
   CONFIGURAÇÕES — TROQUE AQUI
========================================================= */
const CONFIG = {
  // Data e hora em que o relacionamento começou (usada no contador)
  startDate: new Date('2024-01-01T00:00:00'), // TROQUE AQUI a data

  heroTitle: 'Feliz 02 meses gata! ❤️',              // TROQUE AQUI
  heroSubtitle: 'Eu não sou bom em escrever texto mas espero que esse site represente meu amor por você.', // TROQUE AQUI

  // Frases que aparecem espalhadas pelo site
  floatingPhrases: [
    'Você é meu lugar favorito.',
    'Meu coração sempre encontra você.',
    'Você transformou minha vida.',
    'Cada dia ao seu lado vale a pena.',
    'Meu amor por você cresce todos os dias.'
  ],

  // Texto de cada cartinha — TROQUE AQUI
  letters: [
    'Quando estou ao seu lado, todos os meus problemas desaparecem...',
    'Você nem faz ideia de quantos sorrisos eu já dei só de pensar em você...',
    'Eu te conheci sem saber que ia te amar...',
    'Por mais que eu esteja distante, estarei com você!'
  ]
};

/* =========================================================
   UTIL
========================================================= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   LOADER
========================================================= */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = $('#loader');
    if (loader) loader.classList.add('hide');
    startHeroSequence();
  }, 900);
});

/* =========================================================
   CURSOR CUSTOMIZADO + PARTÍCULAS AO MOVER
========================================================= */
(function customCursor(){
  if (window.matchMedia('(max-width: 780px)').matches) return;
  const dot = $('#cursorDot');
  const glow = $('#cursorGlow');
  let mx = 0, my = 0, gx = 0, gy = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    spawnCursorParticle(mx, my);
  });

  function raf(){
    gx += (mx - gx) * 0.15;
    gy += (my - gy) * 0.15;
    glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
    requestAnimationFrame(raf);
  }
  raf();

  $$('button, a, .polaroid, .envelope, [data-tilt]').forEach(el => {
    el.addEventListener('mouseenter', () => glow.classList.add('hover'));
    el.addEventListener('mouseleave', () => glow.classList.remove('hover'));
  });

  let lastParticle = 0;
  function spawnCursorParticle(x, y){
    const now = performance.now();
    if (now - lastParticle < 55 || prefersReducedMotion) return;
    lastParticle = now;
    const p = document.createElement('div');
    const isHeart = Math.random() < 0.25;
    p.textContent = isHeart ? '♥' : '✦';
    p.style.cssText = `
      position:fixed; left:${x}px; top:${y}px; pointer-events:none; z-index:9997;
      font-size:${isHeart ? 10 : 6}px; color:${isHeart ? '#FF8FB1' : '#F0C987'};
      transform:translate(-50%,-50%);`;
    document.body.appendChild(p);
    gsap.to(p, {
      y: y - 30 - Math.random()*20, x: x + (Math.random()*30-15),
      opacity:0, duration: 1, ease:'power1.out',
      onComplete:()=>p.remove()
    });
  }
})();

/* =========================================================
   BOTÕES MAGNÉTICOS
========================================================= */
$$('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width/2;
    const y = e.clientY - r.top - r.height/2;
    gsap.to(btn, { x: x*0.35, y: y*0.35, duration:.4, ease:'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x:0, y:0, duration:.5, ease:'elastic.out(1,0.4)' });
  });
});

/* =========================================================
   FUNDO VIVO — partículas, estrelas, corações, pétalas, vaga-lumes
========================================================= */
(function livingBackground(){
  const canvas = $('#bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const TYPES = ['star','heart','petal','firefly','butterfly','balloon'];
  const COUNT = prefersReducedMotion ? 0 : (window.innerWidth < 700 ? 55 : 110);

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = document.documentElement.scrollHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function pickType(){
    const r = Math.random();
    if(r < 0.32) return 'star';
    if(r < 0.52) return 'firefly';
    if(r < 0.68) return 'heart';
    if(r < 0.84) return 'petal';
    if(r < 0.93) return 'butterfly';
    return 'balloon';
  }

  function makeParticle(){
    const type = pickType();
    return {
      type,
      x: Math.random()*w,
      y: Math.random()*h,
      size: type==='petal' ? 6+Math.random()*6 : type==='butterfly' ? 14+Math.random()*6 : type==='balloon' ? 18+Math.random()*8 : 2+Math.random()*3,
      speedY: type==='balloon' ? 0.25+Math.random()*0.25 : 0.15 + Math.random()*0.35,
      speedX: type==='butterfly' ? (Math.random()-0.5)*0.6 : (Math.random()-0.5)*0.3,
      drift: Math.random()*Math.PI*2,
      alpha: 0.3 + Math.random()*0.5,
      hue: type==='heart' ? '255,143,177' : type==='firefly' ? '240,201,135' : type==='petal' ? '255,214,230' : '255,255,255'
    };
  }
  for(let i=0;i<COUNT;i++) particles.push(makeParticle());

  let mouseX = w/2, mouseY = h/2;
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY + window.scrollY; });

  function drawParticle(p){
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
    if(p.type === 'heart'){
      ctx.translate(p.x, p.y);
      ctx.font = `${p.size*4}px serif`;
      ctx.fillText('❤', 0, 0);
    } else if(p.type === 'star'){
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.shadowBlur = 8; ctx.shadowColor = 'white';
      ctx.fill();
    } else if(p.type === 'petal'){
      ctx.translate(p.x, p.y);
      ctx.rotate(p.drift);
      ctx.beginPath();
      ctx.ellipse(0,0,p.size,p.size/2,0,0,Math.PI*2);
      ctx.fill();
    } else if(p.type === 'butterfly'){
      ctx.translate(p.x, p.y);
      const flap = Math.sin(p.drift*4);
    } else if(p.type === 'butterfly'){
    const flap = Math.sin(p.drift * 5);

    ctx.translate(
        p.x,
        p.y + flap * 3
    );

    ctx.rotate(flap * 0.2);

    ctx.font = `${p.size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🦋', 0, 0);
    } else if(p.type === 'balloon'){
      ctx.translate(p.x, p.y);
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🎈', 0, 0);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.shadowBlur = 12; ctx.shadowColor = 'rgb(240,201,135)';
      ctx.fill();
    }
    ctx.restore();
  }

  function tick(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p => {
      p.drift += p.type === 'butterfly' ? 0.04 : 0.01;
      p.y -= p.speedY;
      const sway = p.type === 'butterfly' ? 1.1 : 0.2;
      p.x += p.speedX + Math.sin(p.drift)*sway;

      // reagir sutilmente ao mouse (brilho acompanhando o cursor)
      const dx = p.x - mouseX, dy = p.y - mouseY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < 120){
        p.x += dx/dist * 0.6;
        p.y += dy/dist * 0.6;
      }

      if(p.y < -20){ p.y = h + 20; p.x = Math.random()*w; }
      if(p.x < -20) p.x = w+20;
      if(p.x > w+20) p.x = -20;

      drawParticle(p);
    });
    requestAnimationFrame(tick);
  }
  if(!prefersReducedMotion) tick();
})();

/* =========================================================
   HERO — texto letra por letra + Snoopy interativo
========================================================= */
function splitToChars(el, text){
  el.innerHTML = '';
  [...text].forEach(ch => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    el.appendChild(span);
  });
}

function startHeroSequence(){
  const titleEl = $('#heroTitle');
  const subtitleEl = $('#heroSubtitle');
  if (titleEl) splitToChars(titleEl, CONFIG.heroTitle);
  if (subtitleEl) subtitleEl.textContent = CONFIG.heroSubtitle;

  const tl = gsap.timeline({ defaults:{ ease:'power3.out' } });
  tl.from('.hero-snoopy', { y:-40, opacity:0, duration:1 })
    .from('.eyebrow', { opacity:0, y:10, duration:.6 }, '-=0.4')
    .from('.hero-title .char', { opacity:0, y:20, duration:.5, stagger:0.035 }, '-=0.2')
    .to('.hero-subtitle', { opacity:1, duration:.8 }, '-=0.2')
    .to('.hero-content .btn-primary', { opacity:1, duration:.8 }, '-=0.4');
}

// Snoopy do hero: ao clicar, joga corações
const heroSnoopy = $('.hero-snoopy');
if (heroSnoopy) heroSnoopy.addEventListener('click', (e) => burstHearts(e.currentTarget));

function burstHearts(originEl){
  const rect = originEl.getBoundingClientRect();
  for(let i=0;i<14;i++){
    const h = document.createElement('div');
    h.textContent = '❤';
    h.style.cssText = `
      position:fixed; left:${rect.left+rect.width/2}px; top:${rect.top+rect.height/2}px;
      font-size:${10+Math.random()*14}px; color:#FF8FB1; pointer-events:none; z-index:9997;`;
    document.body.appendChild(h);
    gsap.to(h, {
      x: (Math.random()-0.5)*260,
      y: -100 - Math.random()*140,
      rotation: (Math.random()-0.5)*90,
      opacity:0, duration:1.2+Math.random()*0.6, ease:'power2.out',
      onComplete:() => h.remove()
    });
  }
}

/* =========================================================
   WOODSTOCK ATRAVESSANDO A TELA OCASIONALMENTE
========================================================= */
(function woodstockCross(){
  const el = $('#woodstockFly');
  if (!el) return;
  function fly(){
    if(prefersReducedMotion){ return; }
    const topPos = 10 + Math.random()*60;
    el.style.top = topPos + '%';
    gsap.fromTo(el, { left:'-120px', opacity:0 }, {
      left: '110vw', opacity:1, duration: 7, ease:'sine.inOut',
      onStart:()=> gsap.to(el,{opacity:1,duration:1}),
      onComplete:()=> el.style.opacity = 0
    });
  }
  setInterval(fly, 18000);
  setTimeout(fly, 6000);
})();

/* =========================================================
   SNOOPY CORRENDO — atravessa a parte de baixo da tela
   com um pequeno saltito e deixa patinhas para trás
========================================================= */
(function snoopyRunning(){
  const el = $('#snoopyRun');
  if(!el || prefersReducedMotion) return;

  function spawnPawPrint(x, y){
    const paw = document.createElement('div');
    paw.className = 'paw-print';
    paw.textContent = '🐾';
    paw.style.left = x + 'px';
    paw.style.top = y + 'px';
    document.body.appendChild(paw);
    gsap.to(paw, { opacity:0, duration:1.4, ease:'power1.out', onComplete:()=>paw.remove() });
  }

  function run(){
    const goingRight = Math.random() > 0.5;
    const bottomPos = 3 + Math.random()*8; // % da tela
    el.style.bottom = bottomPos + '%';
    gsap.set(el, { scaleX: goingRight ? 1 : -1, y: 0 });

    const startX = goingRight ? -100 : window.innerWidth + 100;
    const endX = goingRight ? window.innerWidth + 100 : -100;
    el.style.left = startX + 'px';
    gsap.set(el, { opacity: 1 });

    const tl = gsap.timeline({
      onComplete: () => { el.style.opacity = 0; }
    });
    tl.to(el, {
      left: endX, duration: 5.5, ease: 'power1.inOut',
      onUpdate: function(){
        // saltitos + patinhas ao longo do caminho
      }
    });
    // saltito (bounce) contínuo enquanto corre
    gsap.to(el, { y: -16, duration: 0.22, ease:'sine.inOut', yoyo:true, repeat: 24 });

    // deixa patinhas de tempos em tempos
    let steps = 0;
    const pawTimer = setInterval(() => {
      const rect = el.getBoundingClientRect();
      spawnPawPrint(rect.left + rect.width/2, rect.top + rect.height - 6);
      steps++;
      if(steps > 9) clearInterval(pawTimer);
    }, 480);
  }

  setTimeout(run, 3000);
  setInterval(run, 22000);
})();

/* =========================================================
   BORBOLETAS E BALÕES ESPECIAIS — pequenos toques fofos
   que cruzam a tela ocasionalmente (além dos do fundo vivo)
========================================================= */
(function cuteExtras(){
  if(prefersReducedMotion) return;

  function floatButterfly(){
    const b = document.createElement('div');
    b.className = 'butterfly';
    b.textContent = '🦋';
    const startY = window.scrollY + 60 + Math.random()*(window.innerHeight-120);
    b.style.left = '-30px';
    b.style.top = startY + 'px';
    document.body.appendChild(b);
    const tl = gsap.timeline({ onComplete: () => b.remove() });
    tl.to(b, {
      x: window.innerWidth + 60,
      y: '+=' + (Math.random()>0.5 ? 80 : -80),
      duration: 9, ease:'sine.inOut'
    });
    gsap.to(b, { rotation: 12, duration:.4, yoyo:true, repeat:22, ease:'sine.inOut' });
  }

  function floatBalloon(){
    const b = document.createElement('div');
    b.className = 'balloon';
    b.textContent = '🎈';
    const startX = Math.random()*window.innerWidth;
    b.style.left = startX + 'px';
    b.style.top = (window.scrollY + window.innerHeight + 40) + 'px';
    document.body.appendChild(b);
    gsap.to(b, {
      y: '-=' + (window.innerHeight + 200),
      x: '+=' + ((Math.random()-0.5)*140),
      rotation: (Math.random()-0.5)*20,
      duration: 10, ease:'sine.inOut',
      onComplete: () => b.remove()
    });
  }

  setInterval(floatButterfly, 14000);
  setInterval(floatBalloon, 20000);
  setTimeout(floatButterfly, 4000);
  setTimeout(floatBalloon, 9000);
})();

/* =========================================================
   EASTER EGG — Snoopy escondido aparece aleatoriamente
========================================================= */
(function easterEgg(){
  const egg = $('#easterEgg');
  if (!egg) return;
  function show(){
    const x = Math.random()*(window.innerWidth-60);
    const y = window.scrollY + Math.random()*window.innerHeight*0.7 + 100;
    egg.style.left = x+'px'; egg.style.top = y+'px';
    gsap.to(egg, { opacity:1, duration:.6 });
    setTimeout(()=> gsap.to(egg,{ opacity:0, duration:.6 }), 4000);
  }
  egg.addEventListener('click', () => { burstHearts(egg); gsap.to(egg,{opacity:0,duration:.4}); });
  setInterval(show, 25000);
})();

/* =========================================================
   MÚSICA
========================================================= */
(function musicPlayer(){
  const btn = $('#musicBtn');
  const audio = $('#bg-music');
  const notesWrap = $('#musicNotes');
  if (!btn || !audio) return;
  let playing = false;

  btn.addEventListener('click', () => {
    playing = !playing;
    if(playing){
      audio.play().catch(()=>{});
      btn.classList.add('playing');
      document.body.classList.add('music-on');
      spawnNotes();
    } else {
      audio.pause();
      btn.classList.remove('playing');
      document.body.classList.remove('music-on');
    }
  });

  let noteInterval;
  function spawnNotes(){
    clearInterval(noteInterval);
    if (!notesWrap) return;
    noteInterval = setInterval(() => {
      if(!playing) return;
      const n = document.createElement('span');
      n.textContent = ['♪','♫','♬'][Math.floor(Math.random()*3)];
      n.style.cssText = `position:absolute; left:${Math.random()*20}px; bottom:0; color:#FF8FB1; font-size:16px;`;
      notesWrap.appendChild(n);
      gsap.to(n, { y:-60-Math.random()*30, x:(Math.random()-0.5)*40, opacity:0, duration:1.6, onComplete:()=>n.remove() });
    }, 500);
  }
})();

/* =========================================================
   SCROLL REVEALS (GSAP + ScrollTrigger)
========================================================= */
gsap.utils.toArray('.envelope').forEach((el,i) => {
  gsap.from(el, {
    scrollTrigger:{ trigger: el, start:'top 92%' },
    y: 40, opacity:0, duration:.7, delay:i*0.1, ease:'power3.out'
  });
});

/* =========================================================
   GALERIA — lightbox (só ativa se houver fotos na página)
========================================================= */
(function gallery(){
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxClose = $('#lightboxClose');
  if (!lightbox || !lightboxImg) return;
  $$('.polaroid[data-full]').forEach(btn => {
    btn.addEventListener('click', () => {
      lightboxImg.src = btn.dataset.full;
      lightbox.classList.add('open');
    });
  });
  if (lightboxClose) lightboxClose.addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox.addEventListener('click', e => { if(e.target === lightbox) lightbox.classList.remove('open'); });
})();

/* =========================================================
   CARTINHAS — envelopes animados
========================================================= */
(function letters(){
  const modal = $('#letterModal');
  const text = $('#letterText');
  const closeBtn = $('#letterClose');
  if (!modal || !text) return;
  $$('.envelope').forEach(env => {
    env.addEventListener('click', () => {
      const idx = parseInt(env.dataset.letter,10) - 1;
      text.textContent = CONFIG.letters[idx] || 'Escrever aqui…';
      modal.classList.add('open');
    });
  });
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if(e.target === modal) modal.classList.remove('open'); });
})();

/* =========================================================
   CÉU ESTRELADO — clique nas estrelas forma um coração
========================================================= */
(function starrySky(){
  const canvas = $('#skyCanvas');
  const wrap = $('.sky-wrap');
  if (!canvas || !wrap) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let heartFormed = false;

  function resize(){
    canvas.width = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
    buildStars();
  }
  window.addEventListener('resize', resize);

  function heartPoint(t){
    // parametric heart curve
    const x = 16*Math.pow(Math.sin(t),3);
    const y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
    return { x, y };
  }

  function buildStars(){
    stars = [];
    const total = 46;
    for(let i=0;i<total;i++){
      stars.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        r: 1.5+Math.random()*2,
        target: null,
        lit: false,
        twinkle: Math.random()*Math.PI*2
      });
    }
    // pre-compute heart target positions for a subset
    const scale = Math.min(canvas.width, canvas.height)/34;
    const cx = canvas.width/2, cy = canvas.height/2 - 10;
    for(let i=0;i<total;i++){
      const t = (i/total)*Math.PI*2;
      const p = heartPoint(t);
      stars[i].target = { x: cx + p.x*scale, y: cy - p.y*scale };
    }
  }
  resize();

  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    let closest = null, dist = 9999;
    stars.forEach(s => {
      const d = Math.hypot(s.x-mx, s.y-my);
      if(d < dist){ dist = d; closest = s; }
    });
    if(closest && dist < 40 && !closest.lit){
      closest.lit = true;
      gsap.to(closest, { x: closest.target.x, y: closest.target.y, duration:1, ease:'power3.inOut' });
      checkHeart();
    }
  });

  function checkHeart(){
    const litCount = stars.filter(s=>s.lit).length;
    if(litCount >= Math.floor(stars.length*0.6) && !heartFormed){
      heartFormed = true;
      // acender o restante automaticamente
      stars.forEach(s => {
        if(!s.lit){ s.lit = true; gsap.to(s, { x:s.target.x, y:s.target.y, duration:1, ease:'power3.inOut' }); }
      });
      const msg = $('#skyMessage');
      let i = 0;
      function showMsg(){
        msg.textContent = CONFIG.skyMessages[i % CONFIG.skyMessages.length];
        msg.classList.add('show');
        setTimeout(()=> msg.classList.remove('show'), 3200);
        i++;
      }
      setTimeout(showMsg, 400);
      setInterval(showMsg, 4200);
      const skyHint = $('#skyHint');
      if (skyHint) skyHint.textContent = 'Vocês formaram um coração juntos ✨';
    }
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    stars.forEach(s => {
      s.twinkle += 0.03;
      const a = s.lit ? 1 : 0.4 + Math.sin(s.twinkle)*0.3;
      ctx.beginPath();
      ctx.fillStyle = s.lit ? `rgba(255,143,177,${a})` : `rgba(255,255,255,${a})`;
      ctx.shadowBlur = s.lit ? 14 : 6;
      ctx.shadowColor = s.lit ? '#FF8FB1' : '#ffffff';
      ctx.arc(s.x, s.y, s.lit? s.r*1.6 : s.r, 0, Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* =========================================================
   FINAL — botão "Eu te amo"
========================================================= */
const loveBtn = $('#loveBtn');
if (loveBtn) loveBtn.addEventListener('click', () => {
  const rect = loveBtn.getBoundingClientRect();
  // chuva de corações
  for(let i=0;i<70;i++){
    setTimeout(() => spawnFallingHeart(), i*30);
  }
  // fogos delicados / brilho dourado
  for(let i=0;i<10;i++){
    setTimeout(()=> spawnSparkle(rect.left+rect.width/2, rect.top), i*80);
  }
  gsap.fromTo('.final-moon', { boxShadow:'0 0 90px 30px rgba(240,201,135,.4)' }, { boxShadow:'0 0 160px 60px rgba(240,201,135,.7)', duration:1.4, yoyo:true, repeat:1 });
});

function spawnFallingHeart(){
  const h = document.createElement('div');
  h.textContent = '❤';
  const x = Math.random()*window.innerWidth;
  h.style.cssText = `position:fixed; left:${x}px; top:-30px; font-size:${12+Math.random()*16}px; color:${Math.random()>0.5?'#FF8FB1':'#F0C987'}; z-index:9997; pointer-events:none;`;
  document.body.appendChild(h);
  gsap.to(h, {
    y: window.innerHeight+60, x: `+=${(Math.random()-0.5)*120}`,
    rotation: (Math.random()-0.5)*180,
    duration: 3+Math.random()*2, ease:'power1.in',
    onComplete: () => h.remove()
  });
}

function spawnSparkle(x,y){
  const s = document.createElement('div');
  s.style.cssText = `position:fixed; left:${x}px; top:${y}px; width:6px; height:6px; border-radius:50%; background:#F0C987; box-shadow:0 0 12px 4px rgba(240,201,135,.8); z-index:9997; pointer-events:none;`;
  document.body.appendChild(s);
  gsap.to(s, {
    x: (Math.random()-0.5)*260, y: -100-Math.random()*150,
    opacity:0, duration:1.2, ease:'power2.out',
    onComplete: ()=> s.remove()
  });
}

gsap.utils.toArray('.final-line').forEach((el,i) => {
  gsap.from(el, {
    scrollTrigger:{ trigger:'.final-section', start:'top 60%' },
    opacity:0, y:20, duration:1, delay:i*0.3
  });
});
gsap.from('.final-message', {
  scrollTrigger:{ trigger:'.final-section', start:'top 40%' },
  opacity:0, y:20, duration:1, delay:0.6
});
