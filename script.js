// ===========================
// Effet de constellation en arrière-plan du portfolio
// ===========================
// Des points se déplacent lentement et se relient par des lignes
// quand ils sont suffisamment proches, comme des étoiles reliées.
// Le curseur (souris ou doigt) attire les lignes et repousse
// doucement les points proches, pour un effet plus vivant.
(function () {
  const canvas = document.getElementById('constellation-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // Couleurs reprises de la palette du site
  const DOT_COLOR = 'rgba(199, 184, 255, 0.85)';
  const LINE_RGB = '199, 184, 255'; // --color-accent-nav
  const MOUSE_LINE_RGB = '255, 202, 44'; // --color-accent (doré)
  const MOUSE_DOT_COLOR = 'rgba(255, 202, 44, 0.9)';

  const LINK_DISTANCE = 140; // distance max (px) pour relier deux points entre eux
  const MOUSE_LINK_DISTANCE = 200; // distance max (px) pour relier un point au curseur
  const REPEL_DISTANCE = 110; // rayon (px) où le curseur repousse les points
  const REPEL_STRENGTH = 0.045; // force de la répulsion
  const FRICTION = 0.96; // freinage progressif après une poussée
  const SPEED = 0.25; // vitesse de base des points

  let width = 0;
  let height = 0;
  let particles = [];
  let animationId = null;

  // Position du curseur (souris ou doigt). "active" = false quand il
  // n'y a pas d'interaction (souris hors de la fenêtre, pas de doigt posé).
  const mouse = { x: 0, y: 0, active: false };

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
      // Répulsion douce autour du curseur
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_DISTANCE && dist > 0.01) {
          const force = (1 - dist / REPEL_DISTANCE) * REPEL_STRENGTH;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      // Freinage progressif : evita que a partícula acelere pra sempre
      p.vx *= FRICTION;
      p.vy *= FRICTION;

      // Mantém uma velocidade mínima, senão tudo para com o tempo
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed < SPEED * 0.4) {
        const angle = Math.random() * Math.PI * 2;
        p.vx += Math.cos(angle) * 0.01;
        p.vy += Math.sin(angle) * 0.01;
      }

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

    // Lignes entre le curseur et les points proches (couleur dorée)
    if (mouse.active) {
      for (const p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_LINK_DISTANCE) {
          const opacity = (1 - dist / MOUSE_LINK_DISTANCE) * 0.5;
          ctx.strokeStyle = `rgba(${MOUSE_LINE_RGB}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
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

    // Point en surbrillance à la position du curseur
    if (mouse.active) {
      ctx.fillStyle = MOUSE_DOT_COLOR;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
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

  // Souris : suit le curseur sur toute la fenêtre
  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  // "mouseout" com relatedTarget nulo = o cursor realmente saiu da janela
  // (mais confiável entre navegadores do que "mouseleave" na window)
  document.addEventListener('mouseout', function (e) {
    if (!e.relatedTarget) mouse.active = false;
  });

  // Doigt (mobile/tablette) : même logique que la souris
  window.addEventListener(
    'touchmove',
    function (e) {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    },
    { passive: true }
  );

  window.addEventListener('touchend', function () {
    mouse.active = false;
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


// ===========================
// Menu hamburger
// ===========================
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const navUl = document.querySelector('nav ul');

  // Bascule du menu en cliquant sur le hamburger
  hamburger.addEventListener('click', function() {
    navUl.classList.toggle('active');
  });

  // Ferme le menu en cliquant sur un lien
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navUl.classList.remove('active');
    });
  });
});

// ===========================
// Validation et gestion du formulaire de contact
// ===========================
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form');
  const emailInput = document.getElementById('email');
  const messageTextarea = document.getElementById('message');

  form.addEventListener('submit', function(event) {
    let isValid = true;
    let errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      isValid = false;
      errors.push('E-mail invalide. Utilisez un format comme exemple@domaine.com.');
    }

    if (messageTextarea.value.trim().length < 10) {
      isValid = false;
      errors.push('Le message doit contenir au moins 10 caractères.');
    }

    if (!isValid) {
      event.preventDefault();
      alert('Erreurs dans le formulaire :\n' + errors.join('\n'));
    } else {
      if (!confirm('Êtes-vous sûr de vouloir envoyer le formulaire ?')) {
        event.preventDefault();
      } else {
        alert('Message envoyé avec succès ! Vous serez redirigé(e) vers une page de confirmation.');
      }
    }
  });
});

// ===========================
// Accordéon des projets
// ===========================
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.projet-header').forEach(function (header) {
    header.addEventListener('click', function () {
      header.closest('.projet-card').classList.toggle('open');
    });
  });
});