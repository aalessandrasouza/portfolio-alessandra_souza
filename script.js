// Função para o menu hamburger
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

// Validation et gestion du formulaire de contact
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

// Accordéon des projets
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.projet-header').forEach(function (header) {
    header.addEventListener('click', function () {
      header.closest('.projet-card').classList.toggle('open');
    });
  });
});