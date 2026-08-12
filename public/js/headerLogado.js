const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNavLogado');
const logoutBtn = document.getElementById('logoutBtn');

navToggle.addEventListener('click', function () {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

logoutBtn.addEventListener('click', function () {
    localStorage.removeItem('logado');
    window.location.href = '/login';
});
