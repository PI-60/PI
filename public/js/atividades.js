const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarNav = document.querySelector('.sidebar-nav');
const exitBtn = document.getElementById('exitBtn');
const btnNova = document.querySelector('.btn-nova');
const btnEdita = document.querySelector('icon-btn edit');
const btnDelete = document.querySelector('icon-btn delete');

const semResultados = document.getElementById('semresul');
const pesquisa = document.getElementById('titulo');
const linhas = document.querySelectorAll('.linhas');

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

if(btnDelete){
       btnNova.addEventListener('click', function () {
      // tal coisa seja deletada 
    });
}

if(btnEdita){
    btnEdita.addEventListener('click', function (){
// tal coisa seja alterada
    });


   
}
 /* BUSCAR AT */
            const normalizar = (texto) =>
                    texto.normalize('NFD').toLowerCase().replace(/[\u0300-\u036f]/g, '');

            pesquisaesquisa.addEventListener('input', () => {
                    const termo = normalizar(pesquisa.value.trim());
                    let encontrados = 0;
                 linhas.forEach((linha) => {
            const titulo = normalizar(linha.querySelector('.linhas').textContent);
            
            // se o termo pesquisa aparece no nome
            const combina =  titulo.includes(termo);

            linha.style.display = combina ? '' : 'none';
            if (combina) encontrados++;
      
         
        });
        // se nao tiver resultoados nao aparece ngm
        semResultados.style.display = encontrados === 0 ? 'block' : 'none';
         
    });


