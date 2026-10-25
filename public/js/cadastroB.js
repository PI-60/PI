

// para todos ficarem escondidos ate mudar o tipo de usuario
document.addEventListener("DOMContentLoaded", function () {
    const tipoU = document.getElementById("tipoU");
    const escondido = document.getElementById("hidden");

    // Na tela de edição de usuário, o seletor não existe.
    // Por isso, só executamos as regras quando ele estiver presente.
    if (!tipoU) {
        return;
    }

    // participante
    const emailB = document.getElementById("emailB");
    const campoEmail = emailB ? emailB.closest(".campo") : null;

    // ministrante
    const cpfB = document.getElementById("cpfB");
    const campoCPF = cpfB ? cpfB.closest(".campo") : null;

    // coordenador
    const siape = document.getElementById("siape");
    const campoSiape = siape ? siape.closest(".campo") : null;

    // bolsista
    const passwordB = document.getElementById("passwordB");
    const campoSenha = passwordB ? passwordB.closest(".campo") : null;

    console.log("Select:", tipoU);
    console.log("Email:", emailB);
    console.log("CPF:", cpfB);
    console.log("Siape:", siape);
    console.log("Senha:", passwordB);

    function atualizarCampos() {
        // se o valor for diferente de "usuario" mostra as outras opções
        if (escondido) {
            escondido.style.display =
                tipoU.value !== "usuario" ? "contents" : "none";
        }

        // participante: esconde o e-mail
        if (campoEmail) {
            campoEmail.style.display =
                tipoU.value === "participante" ? "none" : "";
        }

        // ministrante: esconde o CPF
        if (campoCPF) {
            campoCPF.style.display =
                tipoU.value === "ministrante" ? "none" : "";
        }

        // coordenador: mostra o SIAPE
        if (campoSiape) {
            campoSiape.style.display =
                tipoU.value === "coordenador" ? "" : "none";
        }

        // bolsista: mostra a senha
        if (campoSenha) {
            campoSenha.style.display =
                tipoU.value === "bolsista" ? "" : "none";
        }
    }

    tipoU.addEventListener("change", atualizarCampos);

    // Atualiza os campos quando a página abre
    atualizarCampos();
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

