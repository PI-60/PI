<<<<<<< HEAD
const db = require('db');

async function realizarLogin(email, senha) {   
       const userTeste = "userTeste";
        const senhaTeste = "senhaTeste";
=======
function mostrarSenha() {
    var inputPass = document.getElementById('password');
    var btnShowPass = document.getElementById('toggleBtn');
>>>>>>> ac8251e7f641f0ed2445dde5951030c16f1dd022

    // Troca o tipo do input
    const isPassword = inputPass.type === 'password';
    inputPass.type = isPassword ? 'text' : 'password';

    // Alterna a classe de forma instantânea sem reescrever a string inteira
    btnShowPass.classList.toggle('bi-eye-fill', isPassword);
    btnShowPass.classList.toggle('bi-eye-slash-fill', !isPassword);
}

<<<<<<< HEAD
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
       
=======

// fuction cria uma função chamada mostrarSenha, var inputPass JavaScript procura no HTML o elemento que possui: id="password"
//var btnShowPass  encontra o ícone do olho
// const isPassword verifica se o campo atualmente está como senha
// inputPass.type operador ternário onde se for password muda para text senão muda para password
//btnShowPass Isso troca o ícone do olho
>>>>>>> ac8251e7f641f0ed2445dde5951030c16f1dd022
