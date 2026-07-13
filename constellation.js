// Effet de constellation en arrière-plan du portfolio.
// Des points se déplacent lentement et se relient par des lignes
// quand ils sont suffisamment proches, comme des étoiles reliées.
(function () {
  const canvas = document.getElementById('constellation-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // Couleurs reprises de la palette du site (--color-accent-nav: #c7b8ff)
  const DOT_COLOR = 'rgba(199, 184, 255, 0.85)';
  const LINE_RGB = '199, 184, 255';

  const LINK_DISTANCE = 140; // distance max (px) pour relier deux points
  const SPEED = 0.25; // vitesse de déplacement des points

  let width = 0;
  let height = 0;
  let particles = [];
  let animationId = null;

  // Adapte la taille du canvas à la fenêtre
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  // Nombre de points proportionnel à la taille de l'écran, avec un plafond
  // pour ne pas surcharger les petits appareils.
  function densityCount() {
    const area = width * height;
    return Math.min(140, Math.max(40, Math.floor(area / 14000)));
  }

  function createParticles() {
    const count = densityCount();
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: Math.random() * 1.4 + 0.6
      });
    }
  }

  function step() {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Rebondit doucement sur les bords de l'écran
      if (p.x <= 0 || p.x >= width) p.vx *= -1;
      if (p.y <= 0 || p.y >= height) p.vy *= -1;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Lignes entre les points proches (opacité selon la distance)
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < LINK_DISTANCE) {
          const opacity = (1 - dist / LINK_DISTANCE) * 0.35;
          ctx.strokeStyle = `rgba(${LINE_RGB}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Points (étoiles)
    ctx.fillStyle = DOT_COLOR;
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    step();
    draw();
    animationId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', function () {
    resize();
    createParticles();
  });

  resize();
  createParticles();
  draw();

  // Respecte la préférence "mouvement réduit" du système :
  // dans ce cas, on affiche une image fixe, sans animation.
  if (!prefersReducedMotion) {
    animationId = requestAnimationFrame(loop);
  }
})();