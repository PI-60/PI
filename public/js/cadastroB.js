

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
        else{
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

        tipoU.addEventListener("change", function (){

            if(tipoU.value == "ministrante"){
                campoCPF.style.display = 'none'
            } else {
                campoCPF.style.display = 'block'
            }

        } );

    }   );

    
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
