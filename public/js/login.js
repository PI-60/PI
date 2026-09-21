function mostrarSenha() {
    var inputPass = document.getElementById('password');
    var btnShowPass = document.getElementById('toggleBtn');

    // Troca o tipo do input
    const isPassword = inputPass.type === 'password';
    inputPass.type = isPassword ? 'text' : 'password';

    // Alterna a classe de forma instantânea sem reescrever a string inteira
    btnShowPass.classList.toggle('bi-eye-fill', isPassword);
    btnShowPass.classList.toggle('bi-eye-slash-fill', !isPassword);
}


// fuction cria uma função chamada mostrarSenha, var inputPass JavaScript procura no HTML o elemento que possui: id="password"
//var btnShowPass  encontra o ícone do olho
// const isPassword verifica se o campo atualmente está como senha
// inputPass.type operador ternário onde se for password muda para text senão muda para password
//btnShowPass Isso troca o ícone do olho