
document.addEventListener('DOMContentLoaded', function () {

    // ELEMENTOS DA TELA
    const pesquisa = document.getElementById('nome');
    const filtroTipo = document.getElementById('filtroTipo');
    const lista = document.getElementById('lista-usuarios');
    const mensagemSemResultado = document.getElementById('semresul');
    const contador = document.getElementById('contador-usuarios');
    const botoesPaginacao = document.getElementById('botoes-paginacao');
    const botaoCadastrar = document.getElementById('cadastrarUsuario');


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
    // CADASTRAR USUÁRIO
    // =====================================

    if (botaoCadastrar) {

        botaoCadastrar.addEventListener('click', function () {
            window.location.href = '/cadastro';
        });
    }


    // =====================================
    // VISUALIZAR, EDITAR E EXCLUIR
    // =====================================

    if (lista) {

        lista.addEventListener('click', async function (evento) {

            // VISUALIZAR
            const botaoVisualizar = evento.target.closest(
                '.botao-acao.visualizar'
            );

            if (botaoVisualizar) {

                const email = botaoVisualizar.dataset.email;

                if (email) {
                    window.location.href =
                        '/usuarios/visualizar/' +
                        encodeURIComponent(email);
                }

                return;
            }


            // EDITAR
            const botaoEditar = evento.target.closest(
                '.botao-acao.editar'
            );

            if (botaoEditar) {

                const email = botaoEditar.dataset.email;

                const ministrante =
                    botaoEditar.dataset.ministrante === '1';

                if (email) {

                    const rota = ministrante
                        ? '/usuarios/ministrantes/editar/'
                        : '/usuarios/editar/';

                    window.location.href =
                        rota + encodeURIComponent(email);
                }

                return;
            }


            // DESATIVAR / REATIVAR
            const botaoStatus = evento.target.closest(
                '.botao-acao.desativar, .botao-acao.reativar'
            );

            if (botaoStatus) {

                const email = botaoStatus.dataset.email;
                const tipo = botaoStatus.dataset.tipo;

                const desativando = botaoStatus.classList.contains('desativar');

                if (!email || !tipo) {
                    alert('Não foi possível identificar o cadastro.');
                    return;
                }

                const acao = desativando ? 'desativar' : 'reativar';

                const confirmado = confirm(
                    desativando
                        ? 'Tem certeza de que deseja desativar este usuário? Ele não poderá mais acessar o sistema.'
                        : 'Tem certeza de que deseja reativar este usuário?'
                );

                if (!confirmado) return;

                try {

                    const resposta = await fetch(
                        `/usuarios/${tipo}/${encodeURIComponent(email)}/${acao}`,
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
                        alert(mensagemErro || 'Não foi possível alterar o status.');
                        return;
                    }

                    window.location.reload();

                } catch (erro) {

                    console.error('Erro ao alterar status:', erro);

                    alert('Não foi possível conectar ao servidor.');
                }

                return;
            }

            // EXCLUIR
            const botaoExcluir = evento.target.closest(
                '.botao-acao.excluir'
            );

            if (!botaoExcluir) return;

            const email = botaoExcluir.dataset.email;

            const ministrante =
                botaoExcluir.dataset.ministrante === '1';

            if (!email) {
                alert('Não foi possível identificar o cadastro.');
                return;
            }

            const confirmado = confirm(
                'Tem certeza de que deseja excluir este cadastro? Essa ação não pode ser desfeita.'
            );

            if (!confirmado) return;

            const rota = ministrante
                ? '/usuarios/ministrantes/excluir/'
                : '/usuarios/excluir/';

            try {

                const resposta = await fetch(
                    rota + encodeURIComponent(email),
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type':
                                'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams({
                            tipo: ministrante ? 'ministrante' : 'usuario'
                        })
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
                        'Não foi possível excluir o cadastro.'
                    );

                    return;
                }

                window.location.reload();

            } catch (erro) {

                console.error('Erro ao excluir cadastro:', erro);

                alert('Não foi possível conectar ao servidor.');
            }
        });
    }


    // =====================================
    // MENSAGENS DE RETORNO
    // =====================================

    const mensagens = {

        usuarioExcluido: {
            texto: 'Usuário excluído com sucesso!',
            tipo: 'sucesso'
        },

        usuarioEditado: {
            texto: 'Usuário salvo com sucesso!',
            tipo: 'sucesso'
        },

        usuarioCadastrado: {
            texto: 'Usuário cadastrado com sucesso!',
            tipo: 'sucesso'
        },
        usuarioDesativado: {
        texto: 'Usuário desativado com sucesso!',
        tipo: 'sucesso'
        },

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
