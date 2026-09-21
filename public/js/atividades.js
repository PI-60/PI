const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarNav = document.querySelector('.sidebar-nav');
const exitBtn = document.getElementById('exitBtn');

sidebarToggle.addEventListener('click', function () {
    sidebarNav.classList.toggle('is-open');
});

exitBtn.addEventListener('click', function () {
    localStorage.removeItem('logado');
    window.location.href = '/login';
});
