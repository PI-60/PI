const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarNav = document.querySelector('.sidebar-nav');
const exitBtn = document.getElementById('exitBtn');
const btnNova = document.querySelector('.btn-nova');
const btnEdita = document.querySelector('icon-btn edit');
const btnDelete = document.querySelector('icon-btn delete');

 const campoPesquisa = document.getElementById('titulo');
const linhas = document.querySelectorAll('.linha-atividade');
const semResultados = document.getElementById('semresul');



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

           campoPesquisa.addEventListener('input', () => {
        const letra = campoPesquisa.value.trim();
        let encontrados = 0;
        //

        linhas.forEach((linhas) => {
            // buscar o nome do participante
            const titulo = linhas.querySelector('.titulo').textContent;

            // se o termo pesquisa aparece no nome
            const combina =  titulo.includes(letra);

            /*if (combina) {
                 linha.style.display = '';
             } else {
                      linha.style.display = 'none';
                                                } */
            linha.style.display = combina ? '' : 'none';
            if (combina) encontrados++;
      
         
        });
        // se nao tiver resultoados nao aparece ngm
        semresul.style.display = encontrados === 0 ? 'block' : 'none';
         
    });


