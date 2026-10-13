const grade = document.querySelector(".atividades-grid");
const modal = document.getElementById("modalOficina");
const botaoFechar = document.getElementById("fecharModal");

// se gradd e moda e o botao foram clicados...
if (grade && modal && botaoFechar) {
    grade.addEventListener("click", async function (evento) {

        // pra nao abrir o modal quando clicar nos outros booted
        if (evento.target.closest("button, form, a")) {
            return;
        }
        // idenrifica o card que foi clicado
        const card = evento.target.closest(".card-atividade");

        if (!card) {
            return;
        }
        // id = id da oficina (html)
        const id = card.dataset.id;
        // if se nao 
        if (!id) {
            console.error("ID da oficina não encontrado.");
            return;
        }

        try {
            // bfaz requisição pro banco e p onde essa info irá = atividade
            const resposta = await fetch(`/atividade/${id}`);

            // se ele nao encontrar por ex der o erro 404 ele vai executa o if
            if (!resposta.ok) {
                throw new Error(`Erro HTTP: ${resposta.status}`);
            }

            //  converte as info do sit pra uma cocnstante
            const oficina = await resposta.json();
            //  console.log("Dados recebidos:", oficina);
            //  console.log("Bolsistas:", oficina.bolsistas);

            // pra mostrar o ul
            const listaBolsistas = document.getElementById("bolsistas");
            listaBolsistas.innerHTML = "";
            // esse inner.HTML serve pra 'limpae' a lista p que nao se "misture" com de outra oficna

            // se o tramanho dessa lista for > 0 
            if (oficina.bolsistas && oficina.bolsistas.length > 0) {
                //lista os bolsisra
                oficina.bolsistas.forEach(function (bolsista) {
                    // cria um elemento li = lista
                    const item = document.createElement("li");
                    item.textContent = bolsista.usuario_email;
                    // cololca o email do bolsista no elemto li, ou seja na lista
                    listaBolsistas.appendChild(item);
                    // appendChild faz com que um elemento possa ser add a outro elemnto, na pratica a lsita foca assim
                    /*<ul id="bolsistas">
                     <li>ana@ifsc.edu.br</li>
                     <li>maria@ifsc.edu.br</li>
                    <li>joao@ifsc.edu.br</li>
                    </ul> */
                });

            } else {
                listaBolsistas.textContent = "Nenhum bolsista cadastrado.";
            }

            // pega o id e mostra o titlo = oficin.titulo do banco na rotq
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
                
            document.getElementById("ministrante").textContent =
                oficina.ministrante_email || "";

            // finçao p abrir o modal
            modal.showModal();

        } catch (erro) {
            console.error("Erro ao carregar a oficina:", erro);
            alert("Não foi possível carregar os dados da oficina.");
        }
    });
    // quando clicar no botao fehae modal 
    const fecharModal = document.getElementById("fecharModal");
    fecharModal.addEventListener("click", () => {
        modal.close();
    });
    // esse metodo funciona para que quando clicar fora da tela do modal ele se feche tb
    modal.addEventListener("click", function (evento) {
        if (evento.target === modal) {
            modal.close();
        }
    });
}