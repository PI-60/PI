
    const campoPesquisa = document.getElementById('nome');
    const linhas = document.querySelectorAll('.linha-participante');
    const semResultados = document.getElementById('semresul');
    const botao = document.querySelector('.botao-freq');


    if (botao) {
        botao.addEventListener('click', function () {
            window.location.href = '/frequencia';
        });
    }


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
        texto: 'Não foi possível realizar essa operação.',
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
    // /participantes?mensagem=participanteEditado



      const mensagensE = {
    participanteEditado: {
        texto: 'Participante salvo com sucesso!', // texto = msg que aparecerá
        tipo: 'sucesso' // o tipo para puxar no css 
    },

    erro: {
        texto: 'Não foi possível realizar essa operação.',
        tipo: 'erro'
    }
};
    // http://localhost:3000/participantes?mensagem=erro retorna ?mensagem=erro
    const parametrosE = new URLSearchParams(window.location.search);
    // /participantes?mensagem=erro =  tipoMensagem recebe erro
    const tipoMensagemE = parametrosE.get('mensagem');

    const elementoMensagemE = document.getElementById('mensagem');
    //  mensagens[tipoMensagem] = verifica se existe uma mensagem cadastrada com o nome recebido 
    if (elementoMensagemE && mensagensE[tipoMensagemE]) {
        const mensagem = mensagensE[tipoMensagemE];

        //textContent = define o texto que aparece 
        elementoMensagemE.textContent = mensagem.texto;
        // mensagem.tipo for = sucesso a msg fica com a classe sucesso p aplica a cor
        elementoMensagemE.classList.add(mensagem.tipo);
        // msg aparece
        elementoMensagemE.hidden = false;

        // p msg desaparecer dozinha depoois de 4s
        setTimeout(() => {
            elementoMensagemE.hidden = true;
        }, 4000);

        // remove a mensagem da url = volta p /participante
        window.history.replaceState(
            {},
            '',
            window.location.pathname
        );
    }


    
        // =========================================
        // PAGINAÇÃO
        // =========================================

        const participantes = Array.from(
            document.querySelectorAll('.linha-participante')
        );

        const contador = document.getElementById('contador-participantes');
        const botoes = document.getElementById('botoes-paginacao');

        const porPagina = 5;
        let paginaAtual = 1;

        // MOSTRAR PARTICIPANTES DA PÁGINA
        function mostrarPagina() {

            // Aproveita sua pesquisa original
            const termo = normalizar(campoPesquisa.value.trim());

            const filtrados = Array.from(linhas).filter((linha) => {

                const nome = normalizar(
                    linha.querySelector('.nome-participante').textContent
                );

                return nome.includes(termo);
            });

            const total = filtrados.length;
            const totalPaginas = Math.ceil(total / porPagina);

            // Garantir que a página seja válida
            paginaAtual = Math.max(
                1,
                Math.min(paginaAtual, Math.max(1, totalPaginas))
            );

            // Esconder todos os participantes
            participantes.forEach((participante) => {
                participante.style.display = 'none';
            });

            // Calcular início e fim
            const inicio = (paginaAtual - 1) * porPagina;
            const fim = Math.min(inicio + porPagina, total);

            // Mostrar participantes da página atual
            filtrados.slice(inicio, fim).forEach((participante) => {
                participante.style.display = '';
            });

            // CONTADOR
            contador.textContent = total > 0
                ? `Mostrando ${inicio + 1}–${fim} de ${total} participantes`
                : 'Mostrando 0 participantes';

            // MENSAGEM DE RESULTADOS
            semResultados.style.display = total === 0 ? 'block' : 'none';

            // CRIAR BOTÕES
            botoes.innerHTML = '';

            for (let i = 1; i <= totalPaginas; i++) {

                const botao = document.createElement('button');

                botao.type = 'button';
                botao.textContent = i;
                botao.classList.add('pagina');

                if (i === paginaAtual) {
                    botao.classList.add('ativa');
                }

                botao.addEventListener('click', () => {
                    paginaAtual = i;
                    mostrarPagina();
                });

                botoes.appendChild(botao);
            }
        }

        // PESQUISA
        campoPesquisa.addEventListener('input', () => {
            paginaAtual = 1;
            mostrarPagina();
        });

        // INICIAR PAGINAÇÃO
        mostrarPagina();