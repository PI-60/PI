
const botaoAdicionar = document.getElementById("adicionarImagem");
const inputImagem = document.getElementById("inputImagem");
const galeria = document.getElementById("galeria");

// FUNÇÃO PARA ADICIONAR IMAGEM NA TELA

function adicionarImagemNaTela(caminho) {

    const item = document.createElement("div");
    item.classList.add("imagem-item");

    const imagem = document.createElement("img");
    imagem.src = caminho;
    imagem.alt = "Imagem da galeria";

    item.appendChild(imagem);
    galeria.appendChild(item);

}


// CARREGAR IMAGENS SALVAS NO BANCO

async function carregarImagens() {

    try {

        const resposta = await fetch("/listar-imagens");
        const imagens = await resposta.json();

        galeria.innerHTML = "";
        imagens.forEach(function (item) {
            adicionarImagemNaTela(item.caminho);

        });

    } catch (erro) {

        console.error("Erro ao carregar imagens:", erro);

    }

}


// ABRIR SELEÇÃO DE ARQUIVOS

botaoAdicionar.addEventListener("click", function () {
    inputImagem.click();

});


// ENVIAR NOVA IMAGEM

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
            adicionarImagemNaTela(resultado.imagem);

        } else {

            alert("Não foi possível adicionar a imagem.");

        }

    } catch (erro) {

        console.error("Erro ao enviar imagem:", erro);
        alert("Erro ao adicionar imagem.");

    }

    inputImagem.value = "";

});


// CARREGAR ASSIM QUE A PÁGINA ABRIR

carregarImagens();
