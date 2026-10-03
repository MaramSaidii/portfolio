/* ══════════════════════════════════════════
   PORTFOLIO APP.JS — IoT Engineer Portfolio
══════════════════════════════════════════ */

// ── Loader ──────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    initAnimations();
    initCounters();
    initSkillBars();
  }, 1800);
});

// ── Lucide Icons ────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  initCursor();
  initMouseTrail();
  initGlobe();
  initWaveBackground();
  initNavbar();
  initHeroCanvas();
  initMiniChart();
  initLiveData();
  initProjectFilter();
  initContributionGrid();
  initGitHub();
  initContactForm();
  initHamburger();
  initTypingEffect();
});

// ── Custom Cursor ───────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  const interactables = 'a, button, input, textarea, .skill-pill, .project-card, .filter-btn';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactables)) {
      document.body.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactables)) {
      document.body.classList.remove('cursor-hover');
    }
  });

  (function followLoop() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(followLoop);
  })();
}

// ── Animated wave background ─────────────
function initWaveBackground() {
  const canvas = document.getElementById('wave-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // ── Perspective dot-mesh flowing surface ──
    const cols  = 38;
    const rows  = 22;
    const dotSpX = W / cols;
    const dotSpY = H * 0.55 / rows;
    const originY = H * 0.52; // vertical center of the mesh

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = c / cols;
        const nr = r / rows;

        // Perspective: dots get closer together toward horizon
        const perspective = 0.3 + nr * 0.7;
        const screenX = (nx - 0.5) * W * (0.4 + nr * 0.6) + W * 0.35;
        const baseY   = originY + nr * H * 0.42;

        // Wave displacement
        const wave =
          Math.sin(nx * Math.PI * 3 + t * 0.6 + nr * 0.8) * 28 * nr +
          Math.sin(nx * Math.PI * 5 + t * 0.4 + nr * 1.2) * 14 * nr;

        const screenY = baseY + wave;

        // Dot size + alpha by depth
        const size  = 0.8 + nr * 1.8;
        const alpha = 0.08 + nr * 0.45;

        // Color: front dots cyan, back dots deeper blue
        const r_col = Math.round(nr * 20);
        const g_col = Math.round(100 + nr * 80);
        const b_col = 255;

        ctx.beginPath();
        ctx.arc(screenX, screenY, size * perspective, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r_col},${g_col},${b_col},${alpha * perspective})`;
        ctx.fill();

        // Glow on brightest dots
        if (nr > 0.6 && alpha > 0.3) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, size * perspective * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,160,255,${alpha * 0.15 * perspective})`;
          ctx.fill();
        }
      }
    }

    // ── Connect nearby dots with lines (mesh lines) ──
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols; c++) {
        const get = (rr, cc) => {
          const nx = cc / cols;
          const nr = rr / rows;
          const perspective = 0.3 + nr * 0.7;
          const screenX = (nx - 0.5) * W * (0.4 + nr * 0.6) + W * 0.35;
          const baseY   = originY + nr * H * 0.42;
          const wave =
            Math.sin(nx * Math.PI * 3 + t * 0.6 + nr * 0.8) * 28 * nr +
            Math.sin(nx * Math.PI * 5 + t * 0.4 + nr * 1.2) * 14 * nr;
          return { x: screenX, y: baseY + wave, alpha: 0.06 + nr * 0.2 };
        };

        const a = get(r, c);
        const b = get(r + 1, c);
        const lineAlpha = Math.min(a.alpha, b.alpha) * 0.5;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(0,140,255,${lineAlpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        if (c < cols - 1) {
          const d = get(r, c + 1);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(d.x, d.y);
          ctx.strokeStyle = `rgba(0,140,255,${lineAlpha * 0.6})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
    }

    t += 0.016;
    requestAnimationFrame(draw);
  }
  draw();
}

// ── Animated tech globe (top-right bg) ──
function initGlobe() {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width  = 580;
  const H = canvas.height = 580;
  const cx = W / 2, cy = H / 2, R = 220;
  let angle = 0;

  // Random node positions on sphere surface
  const nodes = Array.from({ length: 60 }, () => ({
    lat: (Math.random() - 0.5) * Math.PI,
    lon: Math.random() * Math.PI * 2,
    size: Math.random() * 2.5 + 0.8,
  }));

  function project(lat, lon) {
    const rotLon = lon + angle;
    const x = cx + R * Math.cos(lat) * Math.sin(rotLon);
    const y = cy - R * Math.sin(lat);
    const z = Math.cos(lat) * Math.cos(rotLon); // depth
    return { x, y, z };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Outer glow
    const grad = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.15);
    grad.addColorStop(0, 'rgba(0,100,255,0.0)');
    grad.addColorStop(0.7, 'rgba(0,80,220,0.08)');
    grad.addColorStop(1,   'rgba(0,60,200,0.18)');
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
      const latR = lat * Math.PI / 180;
      ctx.beginPath();
      let first = true;
      for (let lon = 0; lon <= 360; lon += 4) {
        const { x, y, z } = project(latR, lon * Math.PI / 180);
        if (z < 0) { first = true; continue; }
        first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        first = false;
      }
      ctx.strokeStyle = 'rgba(0,180,255,0.12)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Longitude lines
    for (let lon = 0; lon < 360; lon += 30) {
      const lonR = lon * Math.PI / 180;
      ctx.beginPath();
      let first = true;
      for (let lat = -90; lat <= 90; lat += 3) {
        const { x, y, z } = project(lat * Math.PI / 180, lonR);
        if (z < 0) { first = true; continue; }
        first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        first = false;
      }
      ctx.strokeStyle = 'rgba(0,180,255,0.1)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Connection lines between close nodes
    const visible = nodes.map(n => ({ ...project(n.lat, n.lon), size: n.size })).filter(n => n.z > 0);
    for (let i = 0; i < visible.length; i++) {
      for (let j = i + 1; j < visible.length; j++) {
        const dx = visible[i].x - visible[j].x;
        const dy = visible[i].y - visible[j].y;
        if (Math.sqrt(dx*dx + dy*dy) < 90) {
          const alpha = visible[i].z * visible[j].z * 0.25;
          ctx.beginPath();
          ctx.moveTo(visible[i].x, visible[i].y);
          ctx.lineTo(visible[j].x, visible[j].y);
          ctx.strokeStyle = `rgba(0,220,255,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Nodes
    visible.forEach(n => {
      const alpha = 0.4 + n.z * 0.6;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.size * n.z, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,230,255,${alpha})`;
      ctx.fill();
      // Glow
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.size * n.z * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,150,255,${alpha * 0.2})`;
      ctx.fill();
    });

    angle += 0.003;
    requestAnimationFrame(draw);
  }
  draw();
}

// ── Mouse particle trail ─────────────────
function initMouseTrail() {
  const canvas = document.getElementById('trail-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const particles = [];
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function spawn() {
    particles.push({
      x: mx + (Math.random() - 0.5) * 8,
      y: my + (Math.random() - 0.5) * 8,
      r: Math.random() * 2.5 + 0.5,
      life: 1,
      decay: Math.random() * 0.03 + 0.02,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6 - 0.3,
      hue: Math.random() > 0.5 ? '190,245,255' : '123,47,247',
    });
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    spawn();
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= p.decay;
      p.x += p.vx; p.y += p.vy;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${p.life * 0.6})`;
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
}

// ── Typing role effect ────────────────────
function initTypingEffect() {
  const el = document.querySelector('.role-text');
  if (!el) return;
  const roles = [
    'IoT Engineering Student',
    'Embedded Systems Dev',
    'Smart Solutions Builder',
    'Hardware + Software ♡',
  ];
  let ri = 0, ci = 0, deleting = false;

  function tick() {
    const target = roles[ri];
    if (!deleting) {
      el.textContent = target.slice(0, ++ci);
      if (ci === target.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
    } else {
      el.textContent = target.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        ri = (ri + 1) % roles.length;
      }
    }
    setTimeout(tick, deleting ? 40 : 75);
  }
  setTimeout(tick, 2200);
}

// ── Navbar scroll ───────────────────────
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

// ── Hamburger menu ──────────────────────
function initHamburger() {
  const ham = document.getElementById('hamburger');
  const links = document.querySelector('.nav-links');
  const cta = document.querySelector('.nav-cta');
  if (!ham) return;

  ham.addEventListener('click', () => {
    const open = ham.classList.toggle('open');
    if (links) {
      links.style.display = open ? 'flex' : '';
      links.style.flexDirection = 'column';
      links.style.position = 'fixed';
      links.style.top = '70px';
      links.style.right = '5%';
      links.style.background = 'rgba(8,13,26,0.97)';
      links.style.border = '1px solid rgba(0,245,255,0.12)';
      links.style.borderRadius = '12px';
      links.style.padding = '20px 30px';
      links.style.gap = '18px';
      links.style.zIndex = '999';
      if (!open) {
        links.removeAttribute('style');
      }
    }
  });
}

// ── Hero Canvas (particle network) ──────
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    build();
  }

  function build() {
    const count = Math.floor((W * H) / 14000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r:  Math.random() * 2 + 1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,245,255,${0.15 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // nodes
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,245,255,0.6)';
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

// ── Mini Chart ──────────────────────────
function initMiniChart() {
  const c = document.getElementById('mini-chart-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const data = Array.from({ length: 20 }, () => 20 + Math.random() * 30);

  function drawChart() {
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(0,245,255,0.4)');
    grad.addColorStop(1, 'rgba(0,245,255,0)');

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - (v / 60) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  drawChart();

  // evolve
  setInterval(() => {
    data.shift();
    data.push(20 + Math.random() * 30);
    drawChart();
  }, 1200);
}

// ── Live IoT data sim ───────────────────
function initLiveData() {
  const tempEl = document.getElementById('hero-live-temp');
  const humEl  = document.getElementById('hero-live-hum');
  if (!tempEl) return;

  let temp = 24.3, hum = 61;

  setInterval(() => {
    temp = Math.max(18, Math.min(35, temp + (Math.random() - 0.5) * 0.6));
    hum  = Math.max(40, Math.min(85, hum  + (Math.random() - 0.5) * 1.2));
    if (tempEl) tempEl.textContent = temp.toFixed(1) + '°C';
    if (humEl)  humEl.textContent  = Math.round(hum) + '%';
  }, 2000);
}

// ── Scroll Animations ───────────────────
function initAnimations() {
  // Standard data-animate elements
  const els = document.querySelectorAll('[data-animate]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));

  // Spec cards
  const specObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); specObs.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.spec-card').forEach(el => specObs.observe(el));

  // About info cards
  const aicObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); aicObs.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.about-info-card').forEach(el => aicObs.observe(el));

  // Edu timeline items
  const eduObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); eduObs.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.edu-item').forEach(el => eduObs.observe(el));

  // Journey steps
  const jsObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); jsObs.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.journey-step').forEach(el => jsObs.observe(el));
}

// ── Counter animation ───────────────────
function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      let current = 0;
      const step = target / 40;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.round(current);
        if (current >= target) clearInterval(timer);
      }, 40);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

// ── Skill bars ──────────────────────────
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill[data-width]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.width = entry.target.dataset.width + '%';
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  bars.forEach(b => obs.observe(b));
}

// ── Project filter ──────────────────────
function initProjectFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card[data-cat]');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.cat === filter;
        card.style.opacity    = '0';
        card.style.transform  = 'scale(0.95)';
        setTimeout(() => {
          card.classList.toggle('hidden', !match);
          if (match) {
            card.style.opacity   = '1';
            card.style.transform = 'scale(1)';
          }
        }, 200);
      });
    });
  });
}

// ── Contribution grid ────────────────────
function initContributionGrid() {
  const grid = document.getElementById('contribution-grid');
  if (!grid) return;
  const total = 53 * 7;
  for (let i = 0; i < total; i++) {
    const cell = document.createElement('div');
    cell.className = 'contrib-cell';
    const r = Math.random();
    if      (r > 0.9)  cell.classList.add('l4');
    else if (r > 0.75) cell.classList.add('l3');
    else if (r > 0.55) cell.classList.add('l2');
    else if (r > 0.35) cell.classList.add('l1');
    grid.appendChild(cell);
  }
}

// ── GitHub API ───────────────────────────
function initGitHub() {
  const btn   = document.getElementById('gh-fetch-btn');
  const input = document.getElementById('gh-username-input');
  if (!btn || !input) return;

  btn.addEventListener('click', () => fetchGitHub(input.value.trim()));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') fetchGitHub(input.value.trim());
  });

  // Auto-load Maram's profile on page start
  fetchGitHub('MaramSaidii');
}

async function fetchGitHub(username) {
  if (!username) return;

  const btn = document.getElementById('gh-fetch-btn');
  const origContent = btn.innerHTML;
  btn.innerHTML = '<span>Loading…</span>';
  btn.disabled  = true;

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?per_page=6&sort=updated`)
    ]);

    if (!userRes.ok) throw new Error('User not found');

    const user  = await userRes.json();
    const repos = await reposRes.json();

    // Update profile card
    document.getElementById('gh-name').textContent    = user.name || user.login;
    document.getElementById('gh-bio').textContent     = user.bio  || 'No bio provided';
    document.getElementById('gh-repos').textContent   = user.public_repos;
    document.getElementById('gh-followers').textContent = user.followers;

    // Calculate total stars
    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    document.getElementById('gh-stars').textContent = totalStars;

    // Update avatar
    const avatarEl = document.querySelector('.gh-avatar');
    if (user.avatar_url) {
      avatarEl.innerHTML = `<img src="${user.avatar_url}" alt="${user.login}" />`;
    }

    // Render repos
    const list = document.getElementById('gh-repos-list');
    list.innerHTML = '';
    repos.forEach(repo => {
      const langColors = {
        'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Python': '#3572A5',
        'C': '#555555', 'C++': '#f34b7d', 'HTML': '#e34c26', 'CSS': '#563d7c',
        'Rust': '#dea584', 'Go': '#00ADD8', 'Java': '#b07219'
      };
      const langColor = langColors[repo.language] || '#8b949e';

      const card = document.createElement('div');
      card.className = 'repo-card';
      card.innerHTML = `
        <h4><a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a></h4>
        <p>${repo.description || 'No description provided'}</p>
        <div class="repo-meta">
          ${repo.language ? `<span><span class="repo-lang-dot" style="background:${langColor}"></span>${repo.language}</span>` : ''}
          <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>${repo.stargazers_count}</span>
          <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>${repo.forks_count}</span>
        </div>
      `;
      list.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();

  } catch (err) {
    alert('Could not fetch GitHub profile. Check the username and try again.');
  } finally {
    btn.innerHTML = origContent;
    btn.disabled  = false;
    if (window.lucide) lucide.createIcons();
  }
}

// ── Contact form ──────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.innerHTML = '<span>Sending…</span>';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<span>Message Sent ✓</span>';
      btn.style.background = 'linear-gradient(135deg, #00ff9d, #00b8d4)';
      form.reset();
      setTimeout(() => {
        btn.innerHTML = '<span>Send Message</span>';
        btn.style.background = '';
        btn.disabled = false;
        if (window.lucide) lucide.createIcons();
      }, 3000);
    }, 1500);
  });
}

// ── Profile photo fallback ───────────────
(function initPhotoFallback() {
  // Handle both hero and about section photos
  ['hero-photo', 'profile-photo'].forEach(id => {
    const img = document.getElementById(id);
    if (!img) return;
    img.addEventListener('error', () => {
      const hex = img.closest('.hero-hex-photo') || img.closest('.hex-photo');
      if (!hex) return;
      img.style.display = 'none';
      hex.style.background = 'linear-gradient(160deg, #0d1424 0%, #1a2235 60%, #0d1424 100%)';
      const ph = document.createElement('div');
      ph.style.cssText = `
        position:absolute;inset:0;display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:10px;
        color:rgba(0,245,255,0.35);font-family:var(--mono);font-size:0.75rem;
        text-align:center;padding:20px;
      `;
      ph.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Maram Saidi<br/>Add photo.png to /assets/</span>
      `;
      hex.appendChild(ph);
    });
  });
})();

// ── AgriNova image slider ────────────────
(function initAgriSlider() {
  const slides = document.getElementById('agrinova-slides');
  const dotsContainer = document.getElementById('agri-dots');
  if (!slides) return;

  const total = slides.children.length;
  let current = 0;

  // Build dots
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'agri-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }

  function goTo(index) {
    current = (index + total) % total;
    slides.style.transform = `translateX(-${current * 100}%)`;
    dotsContainer.querySelectorAll('.agri-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  // Auto-play every 3s
  let timer = setInterval(() => goTo(current + 1), 3000);

  // Pause on hover
  const sliderEl = slides.closest('.agrinova-slider');
  sliderEl.addEventListener('mouseenter', () => clearInterval(timer));
  sliderEl.addEventListener('mouseleave', () => {
    timer = setInterval(() => goTo(current + 1), 3000);
  });

  // Expose for inline onclick buttons
  window.agriSlide = (dir) => {
    clearInterval(timer);
    goTo(current + dir);
    timer = setInterval(() => goTo(current + 1), 3000);
  };

  if (window.lucide) lucide.createIcons();
})();

// ── AstroQuest slider ────────────────────
(function initAstroSlider() {
  const slides = document.getElementById('astroquest-slides');
  const dotsContainer = document.getElementById('astro-dots');
  if (!slides) return;

  const total = slides.children.length;
  let current = 0;

  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'agri-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }

  function goTo(index) {
    current = (index + total) % total;
    slides.style.transform = `translateX(-${current * 100}%)`;
    dotsContainer.querySelectorAll('.agri-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  let timer = setInterval(() => goTo(current + 1), 3500);
  const sliderEl = slides.closest('.agrinova-slider');
  sliderEl.addEventListener('mouseenter', () => clearInterval(timer));
  sliderEl.addEventListener('mouseleave', () => {
    timer = setInterval(() => goTo(current + 1), 3500);
  });

  window.astroSlide = (dir) => {
    clearInterval(timer);
    goTo(current + dir);
    timer = setInterval(() => goTo(current + 1), 3500);
  };
})();

// ── Hero video left/right switch on cursor ──
(function initHeroVideoSwitch() {
  const wrap     = document.querySelector('.hero-photo-wrap');
  const clip     = document.querySelector('.hero-hex-clip');
  const vidMain  = document.getElementById('hero-video-main');
  const vidLeft  = document.getElementById('hero-video-left');
  if (!wrap || !vidMain || !vidLeft) return;

  let currentSide = 'right';

  clip.addEventListener('mousemove', (e) => {
    const rect = clip.getBoundingClientRect();
    const side = e.clientX < rect.left + rect.width / 2 ? 'left' : 'right';
    if (side === currentSide) return;
    currentSide = side;

    if (side === 'left') {
      vidMain.style.display = 'none';
      vidLeft.style.display = 'block';
      vidLeft.play();
    } else {
      vidLeft.style.display = 'none';
      vidMain.style.display = 'block';
      vidMain.play();
    }
  });

  // Reset to main on mouse leave
  clip.addEventListener('mouseleave', () => {
    currentSide = 'right';
    vidLeft.style.display = 'none';
    vidMain.style.display = 'block';
    vidMain.play();
  });
})();

// ── Contact section cursor-reveal background ─
(function initContactReveal() {
  const layer2   = document.getElementById('contact-bg-2');
  if (!layer2) return;

  const imageZone = layer2.closest('.contact-image-zone') || layer2.parentElement;
  const hint      = document.getElementById('contact-hint');
  const RADIUS = 180;

  imageZone.addEventListener('mousemove', (e) => {
    // Hide hint on first interaction
    if (hint) imageZone.classList.add('user-interacted');

    const rect = imageZone.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mask = `radial-gradient(circle ${RADIUS}px at ${x}px ${y}px, black 0%, transparent 100%)`;
    layer2.style.webkitMaskImage = mask;
    layer2.style.maskImage       = mask;
  });

  imageZone.addEventListener('mouseleave', () => {
    const hidden = 'radial-gradient(circle 0px at -9999px -9999px, black 100%, transparent 100%)';
    layer2.style.webkitMaskImage = hidden;
    layer2.style.maskImage       = hidden;
  });
})();

// ── Smooth anchor scroll ─────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      // close mobile menu if open
      const links = document.querySelector('.nav-links');
      if (links && links.style.display === 'flex') {
        links.removeAttribute('style');
        document.getElementById('hamburger')?.classList.remove('open');
      }
    }
  });
});
