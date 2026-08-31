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