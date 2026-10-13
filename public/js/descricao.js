const grade = document.querySelector(".atividades-grid");
const modal = document.getElementById("modalOficina");
const botaoFechar = document.getElementById("fecharModal");

if (grade && modal && botaoFechar) {

    grade.addEventListener("click", async function (evento) {

        // Não abrir o modal ao clicar em editar ou excluir
        if (evento.target.closest("button, form, a")) {
            return;
        }

        // Identifica o card clicado
        const card = evento.target.closest(".card-atividade");

        if (!card) {
            return;
        }

        // Pega o ID da oficina
        const id = card.dataset.id;

        if (!id) {
            console.error("ID da oficina não encontrado.");
            return;
        }

        try {
            // Busca os dados no backend
            const resposta = await fetch(`/atividade/${id}`);

            if (!resposta.ok) {
                throw new Error(`Erro HTTP: ${resposta.status}`);
            }

            const oficina = await resposta.json();


            console.log("Dados recebidos:", oficina);
console.log("Bolsistas:", oficina.bolsistas);

const listaBolsistas = document.getElementById("bolsistas");

listaBolsistas.innerHTML = "";

if (oficina.bolsistas && oficina.bolsistas.length > 0) {

    oficina.bolsistas.forEach(function (bolsista) {
        const item = document.createElement("li");

        item.textContent = bolsista.usuario_email;

        listaBolsistas.appendChild(item);
    });

} else {
    listaBolsistas.textContent = "Nenhum bolsista cadastrado.";
}

            // Preenche o modal
            document.getElementById("nomeOficina").textContent =
                oficina.titulo || "";


            document.getElementById("descricaoOficina").textContent =
                oficina.descricao || "";

            document.getElementById("dataiOficina").textContent =
                oficina.dt_inicio || "";


            document.getElementById("datafOficina").textContent =
                oficina.dt_termino || "";

            document.getElementById("localOficina").textContent =
                oficina.local || "";

            document.getElementById("horarioOficina").textContent =
                oficina.horario || "";


            document.getElementById("ministrante").textContent =
                oficina.ministrante_email || "";

            // Abre o modal
            modal.showModal();

        } catch (erro) {
            console.error("Erro ao carregar a oficina:", erro);

            alert("Não foi possível carregar os dados da oficina.");
        }
    });

    // Fechar pelo botão
    botaoFechar.addEventListener("click", function () {
        modal.close();
    });

    // Fechar ao clicar fora do conteúdo
    modal.addEventListener("click", function (evento) {
        if (evento.target === modal) {
            modal.close();
        }
    });
}