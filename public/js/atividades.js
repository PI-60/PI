const btnNova = document.querySelector('.btn-nova');
const btnEdita = document.querySelector('icon-btn edit');
const btnDelete = document.querySelector('icon-btn delete');


if (btnNova) {
    btnNova.addEventListener('click', function () {
        window.location.href = '/cadastroAt';
    });
}


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

    // EXCLUIR MSG
   const mensagens = {
    atividadeExcluida: {
        texto: 'Atividade excluída com sucesso!', // texto = msg que aparecerá
        tipo: 'sucesso' // o tipo para puxar no css 
    },

    erro: {
        texto: 'Não foi possível realizar essa operação.',
        tipo: 'erro'
    }
};
 
    const parametros = new URLSearchParams(window.location.search);
    const tipoMensagem = parametros.get('mensagem');
    const elementoMensagem = document.getElementById('mensagem');
  
    if (elementoMensagem && mensagens[tipoMensagem]) {
        const mensagem = mensagens[tipoMensagem];

        //textContent = define o texto que aparece 
        elementoMensagem.textContent = mensagem.texto;
        // mensagem.tipo for = sucesso a msg fica com a classe sucesso p aplica a cor
        elementoMensagem.classList.add(mensagem.tipo);
        // msg aparece
        elementoMensagem.hidden = false;

        // p msg desaparecer dozinha depoois de 4s
        setTimeout(() => {
            elementoMensagem.hidden = true;
        }, 4000);

        window.history.replaceState(
            {},
            '',
            window.location.pathname
        );
    }

    // EDITA MSG
    const mensagensE = {
    atividadeEditada: {
        texto: 'Atividade editada com sucesso!', // texto = msg que aparecerá
        tipo: 'sucesso' // o tipo para puxar no css 
    }
};
 
    const parametrosE = new URLSearchParams(window.location.search);
    const tipoMensagemE = parametrosE.get('mensagem');
    const elementoMensagemE = document.getElementById('mensagem');
  
    if (elementoMensagemE && mensagensE[tipoMensagemE]) {
        const mensagemE = mensagensE[tipoMensagemE];

        //textContent = define o texto que aparece 
        elementoMensagemE.textContent = mensagemE.texto;
        // mensagem.tipo for = sucesso a msg fica com a classe sucesso p aplica a cor
        elementoMensagemE.classList.add(mensagemE.tipo);
        // msg aparece
        elementoMensagemE.hidden = false;

        // p msg desaparecer dozinha depoois de 4s
        setTimeout(() => {
            elementoMensagemE.hidden = true;
        }, 4000);

        window.history.replaceState(
            {},
            '',
            window.location.pathname
        );
    }

     // ccadastrar of msg
    const mensagensC = {
    atividadeCadastrada: {
        texto: 'Atividade cadastrada com sucesso!', // texto = msg que aparecerá
        tipo: 'sucesso' // o tipo para puxar no css 
    }
};
 
    const parametrosC = new URLSearchParams(window.location.search);
    const tipoMensagemC = parametrosC.get('mensagem');
    const elementoMensagemC = document.getElementById('mensagem');
  
    if (elementoMensagemC && mensagensC[tipoMensagemC]) {
        const mensagemC = mensagensC[tipoMensagemC];

        //textContent = define o texto que aparece 
        elementoMensagemC.textContent = mensagemC.texto;
        // mensagem.tipo for = sucesso a msg fica com a classe sucesso p aplica a cor
        elementoMensagemC.classList.add(mensagemC.tipo);
        // msg aparece
        elementoMensagemC.hidden = false;

        // p msg desaparecer dozinha depoois de 4s
        setTimeout(() => {
            elementoMensagemC.hidden = true;
        }, 4000);

        window.history.replaceState(
            {},
            '',
            window.location.pathname
        );
    }