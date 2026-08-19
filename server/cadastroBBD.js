const db = require('./conexaoBD');

async function cadastrarBolsista(emailCoordenador, dadosBolsista) {
    const { email, nome, senha, telefone, CPF } = dadosBolsista;
    let conexao;

    try {
        const queryVerificaCoordenador = 'SELECT email FROM coordenador WHERE email = ?';
        const [coordenadores] = await db.execute(queryVerificaCoordenador, [emailCoordenador]);

        if (coordenadores.length === 0) {
            return { sucesso: false, mensagem: 'Acesso negado. Apenas coordenadores podem cadastrar bolsistas.' };
        }

        conexao = await db.getConnection();
        await conexao.beginTransaction();

        const queryUsuario = 'INSERT INTO usuario (email, nome, senha, telefone, CPF) VALUES (?, ?, ?, ?, ?)';
        await conexao.execute(queryUsuario, [email, nome, senha, telefone, CPF]);

        const queryBolsista = 'INSERT INTO bolsista (email) VALUES (?)';
        await conexao.execute(queryBolsista, [email]);

        await conexao.commit();

        return { 
            sucesso: true, mensagem: `Bolsista ${nome} cadastrado com sucesso!` 
        };

    } catch (erro) {
        if (conexao) await conexao.rollback();
        console.error('Erro ao cadastrar bolsista:', erro);
        return { sucesso: false, mensagem: 'Erro interno ao realizar o cadastro ou dados duplicados.' };
    } finally {
        if (conexao) conexao.release();
    }
}

module.exports = { cadastrarBolsista };