const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarNav = document.querySelector('.sidebar-nav');
const exitBtn = document.getElementById('exitBtn');
const btnNova = document.querySelector('.btn-nova');

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
        sidebarNav.classList.toggle('is-open');
    });
}

if (exitBtn) {
    exitBtn.addEventListener('click', function () {
        localStorage.removeItem('logado');
        window.location.href = '/login';
    });
}

if (btnNova) {
    btnNova.addEventListener('click', function () {
        window.location.href = '/cadastroAt';
    });
}
    