// Fonction pour le menu hamburger
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('nav');

  // Bascule du menu en cliquant sur le hamburger
  hamburger.addEventListener('click', function() {
    nav.classList.toggle('active'); // Ajoute/supprime la classe 'active' sur nav
  });

  // Ferme le menu en cliquant sur un lien (optionnel, pour une meilleure UX)
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      nav.classList.remove('active'); // Supprime la classe 'active' en cliquant sur un lien
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

    // Validation de l'email : doit avoir un format valide (ex. : utilisateur@domaine.com)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      isValid = false;
      errors.push('E-mail invalide. Utilisez un format comme exemple@domaine.com.');
    }

    // Validation du message : doit avoir au moins 10 caractères
    if (messageTextarea.value.trim().length < 10) {
      isValid = false;
      errors.push('Le message doit contenir au moins 10 caractères.');
    }

    // S'il y a des erreurs, empêche l'envoi et affiche des alertes
    if (!isValid) {
      event.preventDefault(); // Empêche l'envoi du formulaire
      alert('Erreurs dans le formulaire :\n' + errors.join('\n')); // Affiche les erreurs dans une alerte
    } else {
      // Optionnel : confirmation avant l'envoi
      if (!confirm('Êtes-vous sûr de vouloir envoyer le formulaire ?')) {
        event.preventDefault();
      } else {
        // Feedback après soumission (Formspree gère l'envoi réel)
        // Note : Formspree redirige automatiquement après envoi. Ce message est pour l'UX.
        alert('Message envoyé avec succès ! Vous serez redirigé(e) vers une page de confirmation.');
      }
    }
  });
});