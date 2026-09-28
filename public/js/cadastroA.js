document.addEventListener("DOMContentLoaded", function () {

    //título
    const titulo = document.getElementById("tituloA");
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
