document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password');
  const toggleButton = document.getElementById('toggleBtn');
  const eyeIcon = document.getElementById('eyeIcon');

  if (toggleButton && passwordInput && eyeIcon) {
    toggleButton.addEventListener('click', function (event) {
      event.preventDefault(); // Garante que o clique no olho não envie o formulário

      const isPassword = passwordInput.type === 'password';

      if (isPassword) {
        // Mostra a senha
        passwordInput.type = 'text';

        // OLHO NORMAL (Aberto)
        eyeIcon.innerHTML = `
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        `;
      } else {
        // Esconde a senha
        passwordInput.type = 'password';

        // OLHO RISCADO (Fechado)
        eyeIcon.innerHTML = `
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
          <line x1="3" y1="3" x2="21" y2="21" stroke="#808080" stroke-width="2.5" stroke-linecap="round"/>
        `;
      }
    });
  }
});