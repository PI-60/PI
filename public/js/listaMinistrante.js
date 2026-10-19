
    const campoPesquisa = document.getElementById('nome');
    const linhas = document.querySelectorAll('.linha-ministrante');
    const semResultados = document.getElementById('semresul');

    // remove acentos e deixa minúsculo (assim "jose" encontra "josé")]
    //constante normalzar recebe texto
    const normalizar = (texto) =>
        //separa o acento da palavra
        texto.normalize('NFD').toLowerCase().replace(/[\u0300-\u036f]/g, '');
    // replace(/[\u0300-\u036f]/g, '') = para retirar os acentos

    // quando pesquisar faça tal coisa...
    campoPesquisa.addEventListener('input', () => {
        const termo = normalizar(campoPesquisa.value.trim());
        let encontrados = 0;
        //

        linhas.forEach((linha) => {
            // buscar o nome do ministrante
            const nome = normalizar(linha.querySelector('.nome-ministrante').textContent);

            // se o termo pesquisa aparece no nome
            const combina =  nome.includes(termo);

            linha.style.display = combina ? '' : 'none';
            if (combina) encontrados++;
      
         
        });
        // se nao tiver resultoados nao aparece ngm
        semresul.style.display = encontrados === 0 ? 'block' : 'none';
         
    });
