

// bolsista;
document.addEventListener("DOMContentLoaded", function () {
    /*quando clicar nesse botão faça isso.. */

    const tipoU = document.getElementById("tipoU");
    const campoSenha = passwordB.closest(".campo");

    console.log("Select:", tipoU);
    console.log("Senha:", passwordB);

    tipoU.addEventListener("change", function () {

        if (tipoU.value === "bolsista") {
            campoSenha.style.display = "block";
        } else {
            campoSenha.style.display = "none";
        }

    });




});

document.addEventListener("DOMContentLoaded", function () {
    /*quando clicar nesse botão faça isso.. */

    const tipoU = document.getElementById("tipoU");
    const campoEmail = emailB.closest(".campo");
    // cchama o campo + proximo que tenha emailB ja que todas as cedulas sao .campo)


    console.log("Select:", tipoU);
    console.log("Email:", emailB);

    tipoU.addEventListener("change", function () {

        if (tipoU.value == "participante") {
            campoEmail.style.display = "none";
            // document.getElementById('emailB').style.display='none'
            //  document.querySelector('label[for= emailB').style.display ='none'
        }
        else {
            campoEmail.style.display = "block";
            //   emailB.style.display = "block";
            //   document.querySelector('label[for= emailB').style.display ='block'
        }


    });

});

document.addEventListener("DOMContentLoaded", function () {

    const tipoU = document.getElementById("tipoU");
    const campoCPF = cpfB.closest(".campo");

    console.log("Select:", tipoU);
    console.log("CPF:", cpfB);

    tipoU.addEventListener("change", function () {

        if (tipoU.value == "ministrante") {
            campoCPF.style.display = 'none'
        } else {
            campoCPF.style.display = 'block'
        }

    });

});


// bolsista;
document.addEventListener("DOMContentLoaded", function () {
    /*quando clicar nesse botão faça isso.. */

    const tipoU = document.getElementById("tipoU");
    const campoSiape = siape.closest(".campo");

    console.log("Select:", tipoU);
    console.log("Siape:", siape);

    tipoU.addEventListener("change", function () {

        if (tipoU.value === "coordenador") {
            campoSiape.style.display = "block";
        } else {
            campoSiape.style.display = "none";
        }

    });




});

// Mascaras
window.addEventListener("load", (event) => {

    // Telefone
    document.getElementById('phoneB').addEventListener('input', function (e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    }); document.getElementById('phoneB').addEventListener('input', function (e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });



    // CPF
    const inputCpf = document.getElementById('cpfB');
    inputCpf.addEventListener('input', (e) => {
        let valor = e.target.value.replace(/\D/g, ''); // Remove tudo que não for dígito

        // Aplica a máscara usando regex
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

        e.target.value = valor;
    });
});

