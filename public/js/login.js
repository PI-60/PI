        const userTeste = "userTeste";
        const senhaTeste = "senhaTeste";

        const passwordInput = document.getElementById('password');
        const toggleButton = document.getElementById('toggleBtn');
        const eyeIcon = document.getElementById('eyeIcon');
        const usernameInput = document.getElementById('username');
        const loginForm = document.getElementById('loginForm');
        const loginError = document.getElementById('loginError');

       toggleButton.addEventListener('click', function () {


    const isPassword = passwordInput.type === 'password';


   if (isPassword) {


// Mostra a senha
passwordInput.type = 'text';


// OLHO NORMAL
eyeIcon.innerHTML = `
<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z
M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z
M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
`;


    } else {


        // Esconde a senha
        passwordInput.type = 'password';


        // OLHO RISCADO
        eyeIcon.innerHTML = `
<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z
M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z
M2 2l20 20"/>




            <circle
                cx="12"
                cy="12"
                r="3"
                fill="none"
                stroke="#808080"
                stroke-width="2"
            />


            <line
                x1="3"
                y1="3"
                x2="21"
                y2="21"
                stroke="#808080"
                stroke-width="2.5"
                stroke-linecap="round"
            />
        `;
    }
});


        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const usuarioDigitado = usernameInput.value;
            const senhaDigitada = passwordInput.value;

            if (usuarioDigitado === userTeste && senhaDigitada === senhaTeste) {
                loginError.style.display = 'none';
                localStorage.setItem('logado', 'true');
                window.location.href = '/';
            } else {
                loginError.style.display = 'block';
            }
        });