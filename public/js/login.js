const db = require('db');

async function realizarLogin(email, senha) {   
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

           /*loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const usuarioDigitado = usernameInput.value;
            const senhaDigitada = passwordInput.value;*/
        loginForm.addEventListener(type = 'submit', function (event) {
            event.preventDefault();
            const usuarioDigitado = usernameInput.value;
            const senhaDigitada = passwordInput.value;

            try {
                const resposta = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email: usuarioDigitado, 
                        senha: senhaDigitada 
                    })
                });

                const dados = await resposta.json();

                if (resposta.ok && dados.sucesso) {
                    loginError.style.display = 'none';
                    localStorage.setItem('logado', 'true');
                    localStorage.setItem('usuario_nome', dados.usuario.nome);
                    localStorage.setItem('usuario_papel', dados.usuario.papel);
                    window.location.href = 'pagInicialLogado.hbs';
                    
                } else {
                    loginError.style.display = 'block';
                    loginError.innerText = dados.mensagem || 'E-mail ou senha incorretos.';
                }
            } catch (erro) {
                console.error('Erro na requisição:', erro);
                loginError.style.display = 'block';
                loginError.innerText = 'Não foi possível conectar ao servidor.';
            }

            /*if (usuarioDigitado === userTeste && senhaDigitada === senhaTeste) {
                loginError.style.display = 'none';
                localStorage.setItem('logado', 'true');
                window.location.href = '/';
            } else {
                loginError.style.display = 'block';
            }*/
}
           module.exports = { realizarLogin };
 });
       