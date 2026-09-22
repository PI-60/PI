function pesquisarParticipante() {

    // Pega o que foi digitado
    const pesquisa = document
        .getElementById("nome")
        .value
        .toLowerCase()
        .trim();

    // Pega todos os participantes
    const participantes = document.querySelectorAll(
        ".linha-participante"
    );

    // Verifica cada participante
    participantes.forEach(function(participante) {

        const nome = participante
            .querySelector(".nome-participante")
            .textContent
            .toLowerCase()
            .trim();

        // Mostra ou esconde
        if (nome.includes(pesquisa)) {
            participante.style.display = "flex";
        } else {
            participante.style.display = "none";
        }
    });
}
