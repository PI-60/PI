
document.addEventListener('DOMContentLoaded', function () {

    // =====================================
    // ELEMENTOS DA TELA
    // =====================================

    const pesquisa = document.getElementById('nome');
    const filtroTipo = document.getElementById('filtroTipo');
    const lista = document.getElementById('lista-usuarios');
    const mensagemSemResultado = document.getElementById('semresul');
    const contador = document.getElementById('contador-usuarios');
    const botoesPaginacao = document.getElementById('botoes-paginacao');


    // =====================================
    // PESQUISA, FILTROS E PAGINAÇÃO
    // =====================================

    if (pesquisa && filtroTipo && lista && mensagemSemResultado) {

        const linhas = Array.from(
            lista.querySelectorAll('.linha-usuario')
        );

        const porPagina = 5;
        let paginaAtual = 1;

        function atualizarLista() {

            const termo = pesquisa.value.trim().toLowerCase();
            const tipoSelecionado = filtroTipo.value;

            const filtrados = linhas.filter(function (linha) {

                const nome = (linha.dataset.nome || '').toLowerCase();
                const email = (linha.dataset.email || '').toLowerCase();
                const funcoes = (linha.dataset.funcoes || '').toLowerCase();

                const correspondeTexto =
                    nome.includes(termo) || email.includes(termo);

                const correspondeTipo =
                    tipoSelecionado === 'todos' ||
                    funcoes.split(/\s+/).includes(tipoSelecionado);

                return correspondeTexto && correspondeTipo;
            });

            const totalPaginas = Math.ceil(
                filtrados.length / porPagina
            );

            if (totalPaginas > 0 && paginaAtual > totalPaginas) {
                paginaAtual = totalPaginas;
            }

            if (totalPaginas === 0) {
                paginaAtual = 1;
            }

            const inicio = (paginaAtual - 1) * porPagina;

            const paginaVisivel = filtrados.slice(
                inicio,
                inicio + porPagina
            );

            linhas.forEach(function (linha) {
                linha.style.display = 'none';
            });

            paginaVisivel.forEach(function (linha) {
                linha.style.display = 'table-row';
            });

            mensagemSemResultado.style.display =
                filtrados.length === 0 ? 'block' : 'none';

            if (contador) {

                if (filtrados.length === 0) {
                    contador.textContent = 'Nenhum usuário para mostrar';
                } else {
                    contador.textContent =
                        `Mostrando ${inicio + 1}–${inicio + paginaVisivel.length} de ${filtrados.length} usuários`;
                }
            }

            desenharPaginacao(totalPaginas);
        }


        function desenharPaginacao(totalPaginas) {

            if (!botoesPaginacao) return;

            botoesPaginacao.replaceChildren();

            if (totalPaginas <= 1) return;

            for (let numero = 1; numero <= totalPaginas; numero++) {

                const botao = document.createElement('button');

                botao.type = 'button';
                botao.textContent = numero;
                botao.className = 'botao-acao';

                if (numero === paginaAtual) {
                    botao.style.borderColor = '#f28c28';
                    botao.style.backgroundColor = '#fff0df';
                }

                botao.addEventListener('click', function () {
                    paginaAtual = numero;
                    atualizarLista();
                });

                botoesPaginacao.appendChild(botao);
            }
        }


        pesquisa.addEventListener('input', function () {
            paginaAtual = 1;
            atualizarLista();
        });

        filtroTipo.addEventListener('change', function () {
            paginaAtual = 1;
            atualizarLista();
        });

        atualizarLista();
    }


    // =====================================
    // REATIVAR USUÁRIO
    // =====================================

    if (lista) {

        lista.addEventListener('click', async function (evento) {

            const botaoReativar = evento.target.closest(
                '.botao-acao.reativar'
            );

            if (!botaoReativar) return;

            const email = botaoReativar.dataset.email;
            const tipo = botaoReativar.dataset.tipo;

            if (!email || !tipo) {
                alert('Não foi possível identificar o cadastro.');
                return;
            }

            const confirmado = confirm(
                'Tem certeza de que deseja reativar este usuário?'
            );

            if (!confirmado) return;

            try {

                const resposta = await fetch(
                    `/usuarios/${tipo}/${encodeURIComponent(email)}/reativar`,
                    {
                        method: 'POST'
                    }
                );

                if (resposta.redirected) {
                    window.location.href = resposta.url;
                    return;
                }

                if (!resposta.ok) {
                    const mensagemErro = await resposta.text();

                    alert(
                        mensagemErro ||
                        'Não foi possível reativar o usuário.'
                    );

                    return;
                }

                window.location.reload();

            } catch (erro) {

                console.error('Erro ao reativar usuário:', erro);

                alert('Não foi possível conectar ao servidor.');
            }
        });
    }


    // =====================================
    // MENSAGENS DE RETORNO
    // =====================================

    const mensagens = {

        usuarioReativado: {
            texto: 'Usuário reativado com sucesso!',
            tipo: 'sucesso'
        },

        erro: {
            texto: 'Não foi possível realizar essa operação.',
            tipo: 'erro'
        }
    };


    const parametros = new URLSearchParams(
        window.location.search
    );

    const tipoMensagem = parametros.get('mensagem');

    const elementoMensagem = document.getElementById('mensagem');

    if (elementoMensagem && mensagens[tipoMensagem]) {

        const mensagemAtual = mensagens[tipoMensagem];

        elementoMensagem.textContent = mensagemAtual.texto;

        elementoMensagem.classList.remove('sucesso', 'erro');
        elementoMensagem.classList.add(mensagemAtual.tipo);

        elementoMensagem.hidden = false;

        setTimeout(function () {
            elementoMensagem.hidden = true;
        }, 4000);

        window.history.replaceState(
            {},
            '',
            window.location.pathname
        );
    }

});
