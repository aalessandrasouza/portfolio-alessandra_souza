// Função para o menu hambúrguer
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector("nav");

  // Toggle do menu ao clicar no hambúrguer
  hamburger.addEventListener("click", function () {
    nav.classList.toggle("active"); // Adiciona/remove a classe 'active' no nav
  });

  // Fecha o menu ao clicar em um link (opcional, para melhor UX)
  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      nav.classList.remove("active"); // Remove a classe 'active' ao clicar em um link
    });
  });
});

// Validação do formulário de contato
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const emailInput = document.getElementById("email");
  const messageTextarea = document.getElementById("message");

  form.addEventListener("submit", function (event) {
    let isValid = true;
    let errors = [];

    // Validação do email: deve ter formato válido (ex.: usuario@dominio.com)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      isValid = false;
      errors.push("E-mail inválido. Use um formato como exemplo@dominio.com.");
    }

    // Validação da mensagem: deve ter pelo menos 10 caracteres
    if (messageTextarea.value.trim().length < 10) {
      isValid = false;
      errors.push("A mensagem deve ter pelo menos 10 caracteres.");
    }

    // Se houver erros, previne o envio e mostra alertas
    if (!isValid) {
      event.preventDefault(); // Impede o envio do formulário
      alert("Erros no formulário:\n" + errors.join("\n")); // Mostra os erros em um alerta
    } else {
      // Opcional: confirmação antes do envio (pode remover se não quiser)
      if (!confirm("Tem certeza de que deseja enviar o formulário?")) {
        event.preventDefault();
      }
    }
  });
});
