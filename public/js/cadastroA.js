document.addEventListener("DOMContentLoaded", function () {

    //título
    const titulo = document.getElementById("titulo");
    const campoTitulo = titulo.closest(".campo");

    //email
    const emailM = document.getElementById("emailM");
    const campoEmail = emailM.closest(".campo");

    //descrição
    const descricao = document.getElementById("descricao");
    const campoDescricao = descricao.closest(".campo");

    //local
    const local = document.getElementById("local");
    const campoLocal = local.closest(".campo");

    //bolsista1
    const bolsista1 = document.getElementById("bolsista1");
    const campoBolsista1 = bolsista1.closest(".campo");

    //bolsista2
    const bolsista2 = document.getElementById("bolsista2");
    const campoBolsista2 = bolsista2.closest(".campo");

    //bolsista3
    const bolsista3 = document.getElementById("bolsista3");
    const campoBolsista3 = bolsista3.closest(".campo");

    

    console.log("Título:", titulo);
    console.log("Container título:", campoTitulo);

    console.log("Email:", emailM);
    console.log("Container email:", campoEmail);

    console.log("Descrição:", descricao);
    console.log("Container descrição:", campoDescricao);

    console.log("Local:", local);
    console.log("Container local:", campoLocal);

    console.log("Bolsista 1:", bolsista1);
    console.log("Container bolsista:", campoBolsista1);

    console.log("Bolsista 2:", bolsista2);
    console.log("Container bolsista:", campoBolsista2);

    console.log("Bolsista 3:", bolsista3);
    console.log("Container bolsista:", campoBolsista3);







});

//{"mensagem":"Erro ao cadastrar oficina","erro":"Column count doesn't match value count at row 1"}

document.addEventListener("DOMContentLoaded", function () {
    const form      = document.getElementById("CadastroA");
    const inputDia  = document.getElementById("novoDia");
    const btnAdd    = document.getElementById("btnAddDia");
    const lista     = document.getElementById("listaDias");
    const erroDias  = document.getElementById("erroDias");

    // guarda os dias em formato YYYY-MM-DD
    let dias = [];

    // YYYY-MM-DD -> DD/MM/YYYY (sem usar Date, evita bug de fuso horário)
    function formatar(iso) {
        const [ano, mes, dia] = iso.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    // desenha a lista na tela e cria os inputs hidden que vão pro servidor
    function render() {
        lista.innerHTML = "";

        dias.forEach(function (dia) {
            const li = document.createElement("li");
            li.textContent = formatar(dia) + " ";

            // input hidden: o servidor recebe como req.body.dias
            const hidden = document.createElement("input");
            hidden.type = "hidden";
            hidden.name = "dias";
            hidden.value = dia;

            // botão remover
            const btnRemover = document.createElement("button");
            btnRemover.type = "button";
            btnRemover.textContent = "✕";
            btnRemover.addEventListener("click", function () {
                dias = dias.filter(d => d !== dia);
                render();
            });

            li.appendChild(hidden);
            li.appendChild(btnRemover);
            lista.appendChild(li);
        });

        erroDias.hidden = dias.length > 0;
        if (dias.length > 0) erroDias.hidden = true;
    }

    // clique no botão "Adicionar dia"
    btnAdd.addEventListener("click", function () {
        const valor = inputDia.value;

        if (!valor) return;                 // nada escolhido
        if (dias.includes(valor)) {         // já existe
            inputDia.value = "";
            return;
        }

        dias.push(valor);
        dias.sort();                        // ordena as datas
        inputDia.value = "";
        render();
    });

    // ao editar: carrega os dias que já vieram do banco (data-dias="2026-11-20,2026-11-21")
    const salvos = lista.dataset.dias;
    if (salvos) {
        dias = salvos.split(",").map(d => d.trim()).filter(Boolean);
        dias.sort();
        render();
    }

    // não deixa enviar sem nenhum dia
    form.addEventListener("submit", function (e) {
        if (dias.length === 0) {
            e.preventDefault();
            erroDias.hidden = false;
        }
    });
});