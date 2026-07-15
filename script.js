// ===========================
// Effet de constellation en arrière-plan
// (fonctionne sur n'importe quelle page ayant un <canvas id="constellation-bg">)
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

  const DOT_COLOR = 'rgba(199, 184, 255, 0.85)';
  const LINE_RGB = '199, 184, 255'; // --color-accent-nav
  const MOUSE_LINE_RGB = '255, 202, 44'; // --color-accent (doré)
  const MOUSE_DOT_COLOR = 'rgba(255, 202, 44, 0.9)';

  const LINK_DISTANCE = 140;
  const MOUSE_LINK_DISTANCE = 200;
  const REPEL_DISTANCE = 110;
  const REPEL_STRENGTH = 0.045;
  const FRICTION = 0.96;
  const SPEED = 0.25;

  let width = 0;
  let height = 0;
  let particles = [];
  let animationId = null;

  const mouse = { x: 0, y: 0, active: false };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

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

      p.vx *= FRICTION;
      p.vy *= FRICTION;

      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed < SPEED * 0.4) {
        const angle = Math.random() * Math.PI * 2;
        p.vx += Math.cos(angle) * 0.01;
        p.vy += Math.sin(angle) * 0.01;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x <= 0 || p.x >= width) p.vx *= -1;
      if (p.y <= 0 || p.y >= height) p.vy *= -1;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

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

    ctx.fillStyle = DOT_COLOR;
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

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

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  document.addEventListener('mouseout', function (e) {
    if (!e.relatedTarget) mouse.active = false;
  });

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

  if (!prefersReducedMotion) {
    animationId = requestAnimationFrame(loop);
  }
})();


// ===========================
// Carrossel de imagens dos projetos
// (só age se a página tiver algum ".projet-carousel" — senão não faz nada)
// ===========================
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.projet-carousel').forEach(function (carousel) {
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const dotsContainer = carousel.querySelector('.carousel-dots');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');

    if (!track || slides.length === 0) return;

    let current = 0;

    const dots = slides.map(function (_, index) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', 'Aller à l\'image ' + (index + 1));
      dot.addEventListener('click', function () {
        goTo(index);
      });
      if (dotsContainer) dotsContainer.appendChild(dot);
      return dot;
    });

    function update() {
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === current);
      });
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      update();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goTo(current - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goTo(current + 1);
      });
    }

    let touchStartX = null;

    track.addEventListener(
      'touchstart',
      function (e) {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );

    track.addEventListener(
      'touchend',
      function (e) {
        if (touchStartX === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX;

        if (Math.abs(deltaX) > 40) {
          deltaX < 0 ? goTo(current + 1) : goTo(current - 1);
        }
        touchStartX = null;
      },
      { passive: true }
    );

    update();
  });
});


// ===========================
// Menu hamburger
// (só existe na home — verificação evita erro nas páginas de projeto)
// ===========================
document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.querySelector('.hamburger');
  const navUl = document.querySelector('nav ul');

  if (!hamburger || !navUl) return;

  hamburger.addEventListener('click', function () {
    navUl.classList.toggle('active');
  });

  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navUl.classList.remove('active');
    });
  });
});

// ===========================
// Validation et gestion du formulaire de contact
// (só existe na home — verificação evita erro nas páginas de projeto)
// ===========================
document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const messageTextarea = document.getElementById('message');

  form.addEventListener('submit', function (event) {
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
// (só existe na home — querySelectorAll retorna lista vazia nas outras páginas, sem erro)
// ===========================
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.projet-header').forEach(function (header) {
    header.addEventListener('click', function () {
      header.closest('.projet-card').classList.toggle('open');
    });
  });
});