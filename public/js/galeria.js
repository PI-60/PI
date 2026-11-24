
const botaoAdicionar = document.getElementById("adicionarImagem");
const inputImagem = document.getElementById("inputImagem");
const galeria = document.getElementById("galeria");

// ELEMENTOS DO MODAL
const modal = document.getElementById("modalImagem");
const imagemAmpliada = document.getElementById("imagemAmpliada");
const dataImagem = document.getElementById("dataImagem");
const horaImagem = document.getElementById("horaImagem");
const fecharModal = document.getElementById("fecharModal");


function adicionarImagemNaTela(caminho, dataUpload) {

    const item = document.createElement("div");
    item.classList.add("imagem-item");

    const imagem = document.createElement("img");

    imagem.src = caminho;
    imagem.alt = "Imagem da galeria";

    // armazena a data de envio na imagem
    imagem.dataset.data = dataUpload || "";

    item.appendChild(imagem);
    galeria.prepend(item);

}

async function carregarImagens() {

    try {

        const resposta = await fetch("/listar-imagens");
        const imagens = await resposta.json();

        galeria.innerHTML = "";

        imagens.forEach(function (item) {

            adicionarImagemNaTela(
                item.caminho,
                item.data_upload
            );

        });

    } catch (erro) {

        console.error("Erro ao carregar imagens:", erro);

    }

}

botaoAdicionar.addEventListener("click", function () {
    inputImagem.click();

});



inputImagem.addEventListener("change", async function () {

    const arquivo = this.files[0];
    if (!arquivo) {
        return;
    }

    const formulario = new FormData();
    formulario.append("imagem", arquivo);

    try {

        const resposta = await fetch("/adicionar-imagem", {
            method: "POST",
            body: formulario
        });

        const resultado = await resposta.json();

        if (resultado.sucesso) {

            adicionarImagemNaTela(
                resultado.imagem.caminho,
                resultado.imagem.data_upload
            );

        } else {
            alert("Não foi possível adicionar a imagem.");

        }

    } catch (erro) {
        console.error("Erro ao enviar imagem:", erro);
        alert("Erro ao adicionar imagem.");

    }

    inputImagem.value = "";

});

galeria.addEventListener("click", function (event) {
    const imagem = event.target.closest(".imagem-item img");
    if (!imagem) return;
    // mostra a imagem ampliada
    imagemAmpliada.src = imagem.src;
    // recupera a data de envio
    const data = imagem.dataset.data;

    if (data) {
        // converte a data do msql para formato do javas
        const dataFormatada = new Date(data.replace(" ", "T"));

        if (!isNaN(dataFormatada.getTime())) {

            dataImagem.textContent =
                dataFormatada.toLocaleDateString("pt-BR");

            horaImagem.textContent =
                dataFormatada.toLocaleTimeString("pt-BR");

        } else {

            dataImagem.textContent = "Não disponível";
            horaImagem.textContent = "Não disponível";

        }

    } else {

        dataImagem.textContent = "Não disponível";
        horaImagem.textContent = "Não disponível";

    }

    modal.showModal();

});


fecharModal.addEventListener("click", function () {
    modal.close();

});

carregarImagens();
