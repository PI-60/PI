        const userTeste = "userTeste";
        const senhaTeste = "senhaTeste";

        const passwordInput = document.getElementById('password');
        const toggleButton = document.getElementById('toggleBtn');
        const eyeIcon = document.getElementById('eyeIcon');
        const usernameInput = document.getElementById('username');
        const loginForm = document.getElementById('loginForm');
        const loginError = document.getElementById('loginError');

        toggleButton.addEventListener('click', function () {
            // Verifica o tipo atual do input
            const isPassword = passwordInput.getAttribute('type') === 'password';
            
            if (isPassword) {
                // Altera para texto livre (torna visível)
                passwordInput.setAttribute('type', 'text');
                // Altera o desenho do SVG para um olho cortado (ocultar)
                eyeIcon.innerHTML = `<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z M2 2l20 20"/>`;
            } else {
                // Volta a esconder a senha
                passwordInput.setAttribute('type', 'password');
                // Restaura o ícone original do olho aberto
                eyeIcon.innerHTML = `<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>`;
            }
        });

        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const usuarioDigitado = usernameInput.value;
            const senhaDigitada = passwordInput.value;

            if (usuarioDigitado === userTeste && senhaDigitada === senhaTeste) {
                loginError.style.display = 'none';
                window.location.href = '/';
            } else {
                loginError.style.display = 'block';
            }
        });