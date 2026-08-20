
document.addEventListener("DOMContentLoaded", function () {
    /*quando clicar nesse botão faça isso.. */

    const tipoU = document.getElementById("tipoU");
    const passwordB = document.getElementById("passwordB");

    console.log("Select:", tipoU);
    console.log("Senha:", passwordB);

    tipoU.addEventListener("change", function () {

        console.log("Escolheu:", tipoU.value);

        if (tipoU.value === "bolsista") {
            passwordB.style.display = "flex";
        } else {
            passwordB.style.display = "none";
        }

    });

});