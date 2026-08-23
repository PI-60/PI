

// bolsista;
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

    // paeticiapnte;

    document.addEventListener("DOMContentLoaded", function () {
    /*quando clicar nesse botão faça isso.. */

    const tipoU = document.getElementById("tipoU");
    const emailB = document.getElementById("phoneB");

    console.log("Select:", tipoU);
    console.log("Email:", emailB);

    tipoU.addEventListener("change", function () {

        console.log("Escolheu:", tipoU.value);

        if (tipoU.value === "participante") {
            emailB.style.display = "none";
        } else {
            phoneB.style.display = "flex";
        }

    });


});

// ministrante
 document.addEventListener("DOMContentLoaded", function () {
    /*quando clicar nesse botão faça isso.. */

    const tipoU = document.getElementById("tipoU");
    const cpfB = document.getElementById("cpfB");

    console.log("Select:", tipoU);
    console.log("CPF:", cpfB);

    tipoU.addEventListener("change", function () {

        console.log("Escolheu:", tipoU.value);

        if (tipoU.value === "ministrante") {
            emailB.style.display = "flex";
        } else {
            phoneB.style.display = "none";
        }

     });


});
    
