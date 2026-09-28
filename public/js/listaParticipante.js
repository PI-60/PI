
    const campoPesquisa = document.getElementById('nome');
    const linhas = document.querySelectorAll('.linhap');
    const semResultados = document.getElementById('semresul');

    // remove acentos e deixa minúsculo (assim "jose" encontra "josé")]
    //constante normalzar recebe texto
    const normalizar = (texto) =>
        texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    // eplace(/[\u0300-\u036f]/g, '') = para retirar os acentos

    // quando pesquisar faça tal coisa...
    campoPesquisa.addEventListener('input', () => {
        const termo = normalizar(campoPesquisa.value.trim());
        let encontrados = 0;
        //

        linhas.forEach((linha) => {
            // buscar o nome do participante/ telefone/ cpf
            const nome = normalizar(linha.querySelector('.nome-participante').textContent);
            const telefone = linha.querySelector('.telefone-participante').textContent;
            const cpf = linha.querySelector('.cpf-participante').textContent;

            // se o termo pesquisa aparece no nome
            const combina =  nome.includes(termo);

            /*if (combina) {
                 linha.style.display = '';
             } else {
                      linha.style.display = 'none';
                                                } */
            linha.style.display = combina ? '' : 'none';
            if (combina) encontrados++;
        });
        // se nao tiver resultoados nao aparece ngm
        semresul.style.display = encontrados === 0 ? 'block' : 'none';
    });
