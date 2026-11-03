const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNavLogado');

if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
        const isOpen = mainNav.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
}
        const trocarConta = document.getElementById('trocarConta');

            if (trocarConta) {
                trocarConta.addEventListener('click', function () {
                    window.location.href = '/logout';
                });
            }

// ================= NOTIFICAÇÕES =================

const botaoNotificacoes = document.getElementById('botaoNotificacoes');
const menuNotificacoes = document.getElementById('menuNotificacoes');
const listaNotificacoes = document.getElementById('listaNotificacoes');
const badgeNotificacao = document.getElementById('badgeNotificacao');
const marcarTodasLidas = document.getElementById('marcarTodasLidas');

// transforma a data da notificação em algo como "3 dias 18 horas atrás"
function tempoRelativo(dataString) {
    const agora = new Date();
    const data = new Date(dataString);
    const diffMs = Math.max(0, agora - data);

    const minutos = Math.floor(diffMs / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) {
        const horasRestantes = horas % 24;
        return horasRestantes > 0
            ? `${dias} dia${dias > 1 ? 's' : ''} ${horasRestantes} hora${horasRestantes > 1 ? 's' : ''} atrás`
            : `${dias} dia${dias > 1 ? 's' : ''} atrás`;
    }

    if (horas > 0) {
        const minutosRestantes = minutos % 60;
        return minutosRestantes > 0
            ? `${horas} hora${horas > 1 ? 's' : ''} ${minutosRestantes} minuto${minutosRestantes > 1 ? 's' : ''} atrás`
            : `${horas} hora${horas > 1 ? 's' : ''} atrás`;
    }

    if (minutos > 0) {
        return `${minutos} minuto${minutos > 1 ? 's' : ''} atrás`;
    }

    return 'agora mesmo';
}

function renderizarNotificacoes(notificacoes) {
    if (!listaNotificacoes) return;

    if (!notificacoes || notificacoes.length === 0) {
        listaNotificacoes.innerHTML = '<p class="notificacoes-vazio">Nenhuma notificação por enquanto.</p>';
        return;
    }

    listaNotificacoes.innerHTML = notificacoes.map((notificacao) => `
        <a
            class="notificacao-item ${notificacao.lida ? '' : 'nao-lida'}"
            href="/atividades">
            <span class="notificacao-texto">
                <i class="bi bi-person-plus"></i>
                <span>${notificacao.mensagem}</span>
            </span>
            <span class="notificacao-tempo">${tempoRelativo(notificacao.criado_em)}</span>
        </a>
    `).join('');
}

function atualizarBadge(naoLidas) {
    if (!badgeNotificacao) return;

    if (naoLidas > 0) {
        badgeNotificacao.textContent = naoLidas > 99 ? '99+' : naoLidas;
        badgeNotificacao.hidden = false;
    } else {
        badgeNotificacao.hidden = true;
    }
}

async function carregarNotificacoes() {
    try {
        const resposta = await fetch('/notificacoes');
        if (!resposta.ok) return;

        const dados = await resposta.json();
        renderizarNotificacoes(dados.notificacoes);
        atualizarBadge(dados.naoLidas);

    } catch (erro) {
        console.error('Erro ao carregar notificações:', erro);
    }
}

if (botaoNotificacoes && menuNotificacoes) {
    botaoNotificacoes.addEventListener('click', function (evento) {
        evento.stopPropagation();
        menuNotificacoes.classList.toggle('aberto');
    });

    document.addEventListener('click', function (evento) {
        if (!menuNotificacoes.contains(evento.target) && evento.target !== botaoNotificacoes) {
            menuNotificacoes.classList.remove('aberto');
        }
    });
}

if (marcarTodasLidas) {
    marcarTodasLidas.addEventListener('click', async function (evento) {
        evento.stopPropagation();

        try {
            await fetch('/notificacoes/marcar-lidas', { method: 'POST' });
            await carregarNotificacoes();

        } catch (erro) {
            console.error('Erro ao marcar notificações como lidas:', erro);
        }
    });
}

if (botaoNotificacoes) {
    carregarNotificacoes();
    setInterval(carregarNotificacoes, 30000);
}