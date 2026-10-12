const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarNav = document.querySelector('.sidebar-nav');
const exitBtn = document.getElementById('exitBtn');
const btnNova = document.querySelector('.btn-nova');
const btnEdita = document.querySelector('icon-btn edit');
const btnDelete = document.querySelector('icon-btn delete');

 



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

/*if(btnDelete){
       btnDelete.addEventListener('click', function () {
      // tal coisa seja deletada 
    });
}

if(btnEdita){
    btnEdita.addEventListener('click', function (){
// tal coisa seja alterada

    });
    
*/

// PARA PESQUISAR A AT PELO TITULO usei de exemplo a de partiipante

const campoPesquisa = document.getElementById('titulo');
const cards = document.querySelectorAll('.card-atividade');
const semResultados = document.getElementById('semresul');

if (campoPesquisa) {
    campoPesquisa.addEventListener('input', () => {
        const termo = campoPesquisa.value.trim().toLowerCase();
        let encontrados = 0;

        cards.forEach((card) => {
            const titulo = card.querySelector('h3').textContent.toLowerCase();
            const combina = titulo.includes(termo);
            card.style.display = combina ? '' : 'none';

            if (combina) {
                encontrados++;
            }
        });

        if (semResultados) {
            semResultados.style.display =
                encontrados === 0 ? 'block' : 'none';
        }
    });
}
// confirmação antes de excluir uma atividade
 document.querySelectorAll('.excluir').forEach((form) => {
        form.addEventListener('submit', (e) => {
            if (!confirm(`Tem certeza que deseja excluir essa atividade? Essa ação não pode ser desfeita.`)) {
                e.preventDefault();
            }
        });
    });
