
    const campoPesquisa = document.getElementById('nome');
    const linhas = document.querySelectorAll('.linha-participante');
    const semResultados = document.getElementById('semresul');

    // remove acentos e deixa minúsculo (assim "jose" encontra "josé")]
    //constante normalzar recebe texto
    const normalizar = (texto) =>
        //separa o acento da palavra
        texto.normalize('NFD').toLowerCase().replace(/[\u0300-\u036f]/g, '');
    // replace(/[\u0300-\u036f]/g, '') = para retirar os acentos

    // quando pesquisar faça tal coisa...
    campoPesquisa.addEventListener('input', () => {
        const termo = normalizar(campoPesquisa.value.trim());
        let encontrados = 0;
        //

        linhas.forEach((linha) => {
            // buscar o nome do participante
            const nome = normalizar(linha.querySelector('.nome-participante').textContent);

            // se o termo pesquisa aparece no nome
            const combina =  nome.includes(termo);

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


    // confirmação antes de excluir um participante
    document.querySelectorAll('.form-excluir').forEach((form) => {
        form.addEventListener('submit', (e) => {
            const nome = form.dataset.nome.trim();
            if (!confirm(`Tem certeza que deseja excluir "${nome}"? Essa ação não pode ser desfeita.`)) {
                e.preventDefault();
            }
        });
    });

    // msg pra quando for realizado com sucesso ou nao
   const mensagens = {
    participanteExcluido: {
        texto: 'Participante excluído com sucesso!', // texto = msg que aparecerá
        tipo: 'sucesso' // o tipo para puxar no css 
    },

    erro: {
        texto: 'Não foi possível realizar a operação.',
        tipo: 'erro'
    }
};
    // http://localhost:3000/participantes?mensagem=erro retorna ?mensagem=erro
    const parametros = new URLSearchParams(window.location.search);
    // /participantes?mensagem=erro =  tipoMensagem recebe erro
    const tipoMensagem = parametros.get('mensagem');

    const elementoMensagem = document.getElementById('mensagem');
    //  mensagens[tipoMensagem] = verifica se existe uma mensagem cadastrada com o nome recebido 
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

        // remove a mensagem da url = volta p /participante
        window.history.replaceState(
            {},
            '',
            window.location.pathname
        );
    }