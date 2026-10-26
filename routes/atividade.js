import express from 'express';
import db from '../database.js'; // ajuste o caminho conforme a localização do seu módulo de conexão com o banco

const router = express.Router();


// ROTA DE CADASTRO ATIVIDADES

router.get('/cadastroat', async (req, res) => {
    const [bolsista] = await db.query(
        //selecione email de bolsista e nome do bolsista(usuario) da tabela bolsita 
        `SELECT bolsista.email, usuario.nome FROM bolsista
         JOIN usuario WHERE bolsista.email = usuario.email
        `
        //join tabela usuaeio quando o eail dobolsita for = email do usuariio


    );
    const [ministrante] = await db.query(
        //selecione  emael e  nome da tabela ministrantes
        'SELECT email, nome FROM ministrante'

    );


    res.render('telaCadastroA', {
          layout: 'layouts/telasNavegacao',
        bolsista,
        ministrante
    });

});

//edita of
router.get('/atividades/:id/editar', async (req, res) => {

    try {
        const id = req.params.id;
        // guarda a id da of

        // dados da oficina
        const [resultado] = await db.execute(
            `SELECT idOficina, ministrante_email, titulo, descricao, local, dt_inicio, dt_termino
             FROM oficina
             WHERE idOficina = ?`,
            [id]
            // busca no banco a of que tem essa id e guarda na variavel resultado
        );
        // se essa oficina for = 0 ou seja nao existe
        if (resultado.length === 0) {
            return res.status(404).send('Oficina não encontrada');
        }
        // oficina = array de resultado que guarda as linhas encontradas 
        const oficina = resultado[0];

        // todos os bolsistas
        const [bolsista] = await db.query(
            `SELECT bolsista.email, usuario.nome
             FROM bolsista
             JOIN usuario ON bolsista.email = usuario.email`
        );

        // todos os ministrantes
        const [ministrante] = await db.query(
            'SELECT email, nome FROM ministrante'
        );

        // bolsistas vinculados a oficina
        const [bolsistasSelecionados] = await db.execute(
            `SELECT usuario_email
             FROM usuario_monitora_oficina
             WHERE oficina_idOficina = ?`,
            [id]
        );

        // formata Date -> YYYY-MM-DD para o <input type="date"> chat
        const formatarData = (d) => {
            if (!d) return '';
            const data = new Date(d);
            const ano = data.getFullYear();
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const dia = String(data.getDate()).padStart(2, '0');
            return `${ano}-${mes}-${dia}`;
        };


        // monta o objeto com os nomes que o template espera
        const atividade = {
            idOficina: oficina.idOficina,
            titulo: oficina.titulo,
            descricao: oficina.descricao,
            local: oficina.local,
            ministrante_email: oficina.ministrante_email,
            dataInicio: formatarData(oficina.dt_inicio),
            dataTermino: formatarData(oficina.dt_termino),
            bolsista1: bolsistasSelecionados[0]?.usuario_email || '',
            bolsista2: bolsistasSelecionados[1]?.usuario_email || '',
            bolsista3: bolsistasSelecionados[2]?.usuario_email || ''
            /* bolsista1: bolsistasSelecionados[0] acessa o primeiro bolsista da lista a contagem começa no índice 0
            ?.usuario_email  acessa o e-mail do bolsista mas somente se ele existir
             o ? evita q a posição seja undefined.
            || '' se não houver um e-mail válido  utiliza uma string vazia ('')
            permite deixar o campo sem valor */
        };

        res.render('telaCadastroA', {
              layout: 'layouts/telasNavegacao',
            atividade,
            bolsista,
            ministrante
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao carregar oficina para edição');
    }
});

// cadastrar oficina
router.post('/cadastroat', async (req, res) => {

    let idOficina = req.body.idOficina;

    const {
        titulo,
        emailM,
        descricao,
        local,
        dataInicio,
        dataTermino,
        bolsista1,
        bolsista2,
        bolsista3
    } = req.body;

    console.log(req.body)

    try {
        // ALTERAR oficina existente
        
        if (idOficina) {

            await db.execute(
                `UPDATE oficina
                 SET ministrante_email = ?, titulo = ?, descricao = ?, local = ?, dt_inicio = ?, dt_termino = ?
                 WHERE idOficina = ?`,
                [emailM, titulo, descricao, local, dataInicio, dataTermino, idOficina]
            );

            // remove os vínculos antigos para cadastra os novos
            await db.execute(
                'DELETE FROM usuario_monitora_oficina WHERE oficina_idOficina = ?',
                [idOficina]
            );

            // insere os bolsistas selecionados 
            const sqlBolsista = `
                INSERT INTO usuario_monitora_oficina
                (usuario_email, oficina_idOficina)
                VALUES (?, ?)
            `;
            const bolsistas = [bolsista1, bolsista2, bolsista3];

            res.redirect('/atividades?mensagem=atividadeEditada');

        } else {

            //  cadastra a oficina
            const [resultado] = await db.execute(
                `INSERT INTO oficina
                 ( ministrante_email, titulo, descricao, local, dt_inicio, dt_termino)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [emailM, titulo, descricao, local, dataInicio, dataTermino]
            );

            idOficina = resultado.insertId;
        }

        // cadasta os bolsistas 
        const sqlBolsista = `
            INSERT INTO usuario_monitora_oficina
            (usuario_email, oficina_idOficina)
            VALUES (?, ?)
        `;

        /*  for (const email of bolsistas) {
            await db.execute(sqlBolsista, [email, id]);
        } */
        // bolsista 1
        if (bolsista1) {
            await db.execute(sqlBolsista, [
                bolsista1,
                idOficina
            ]);
        }

        // bolsista 2
        if (bolsista2) {
            await db.execute(sqlBolsista, [
                bolsista2,
                idOficina
            ]);
        }


        // bolsista 3
        if (bolsista3) {
            await db.execute(sqlBolsista, [
                bolsista3,
                idOficina
            ]);
        }

        res.redirect('/atividades?mensagem=atividadeCadastrada');

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensagem: 'Erro ao cadastrar oficina',
            erro: error.message
        });
    }
});

// ROTA DE LISTAGEM 
router.get('/atividades', async (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }
    try {

        // pesquisar
        const letra = req.query.letra || '';

        const [atividades] = await db.query(
            'SELECT idOficina,  titulo, local, dt_inicio FROM oficina  WHERE titulo LIKE ?',
            [`%${letra}%`]
        );


        res.render('telaAtividades', {
            layout: 'layouts/mainLogado',
            atividades: atividades

        });

    } catch (erro) {
        console.error(erro);
        return res.redirect('/atividades?mensagem=erro');
    }

});
// botao excluir
router.post('/atividades/:id/excluir', async (req, res) => {

    if (!req.session.usuario) {
        return res.redirect('/login');
    }
    try {
        await db.beginTransaction();
        // deleta da tabela usurario monitora onde o id da oficina for tal..
        await db.query('DELETE FROM usuario_monitora_oficina WHERE oficina_idOficina = ?', [req.params.id]);
        // deleta da tabela ofcina acontece dua onde for a id da ofocina..
        await db.query('DELETE FROM oficina_acontece_dia WHERE oficina_idOficina = ?', [req.params.id]);
        // por final aafar a oficina da tabela ofiicna
        await db.query('DELETE FROM oficina WHERE idOficina = ?', [req.params.id]);
        await db.commit();

        res.redirect('/atividades?mensagem=atividadeExcluida');

    } catch (erro) {
        await db.rollback();
        console.error(erro);
         return res.redirect('/atividades?mensagem=erro');
    }
});



// modal
router.get('/atividade/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const [oficinas] = await db.execute(
            `SELECT idOficina, ministrante_email, titulo, descricao, local, dt_inicio, dt_termino FROM oficina WHERE idOficina = ?`,
            [id]
        );

        // pra ver se tem oficina se nao vai dar erro 404 = nao encontrado
        if (oficinas.length === 0) {
            return res.status(404).json({
                erro: 'Oficina não encontrada'
            });
        }

        const [bolsistas] = await db.execute(
            `SELECT usuario_email FROM usuario_monitora_oficina WHERE oficina_idOficina = ?`,
            [id]
        );

        /* oficinas = um array que contem as oficinas encontradas
            o [0] acessa o primeiro elemento
              (...)  chamados de operador spread eles copiam as propriedades do primeiro objeto de oficinas para o novo objeto
               as propriedades id, nome etc  que vaoser retornado s*/
        res.json({
            ...oficinas[0],
            bolsistas: bolsistas
        });

    } catch (erro) {
        console.error('Erro ao buscar oficina:', erro);

        res.status(500).json({
            erro: 'Erro ao consultar oficina'
        });
    }
});


export default router;

