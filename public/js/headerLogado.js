const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNavLogado');

if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
        const isOpen = mainNav.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
}