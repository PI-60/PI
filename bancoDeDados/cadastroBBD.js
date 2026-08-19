const db = require('./db');

async function cadastrarBolsista(emailCoordenador, dadosBolsista) {
    const { email, nome, senha, telefone, CPF } = dadosBolsista;
    let conexao;

    try {
        // 1. Validação de segurança: Verifica se quem está cadastrando é coordenador
        const queryVerificaCoordenador = 'SELECT email FROM coordenador WHERE email = ?';
        const [coordenadores] = await db.execute(queryVerificaCoordenador, [emailCoordenador]);

        if (coordenadores.length === 0) {
            return { sucesso: false, mensagem: 'Acesso negado. Apenas coordenadores podem cadastrar bolsistas.' };
        }

        // Pegamos uma conexão dedicada do pool para gerenciar a transação
        conexao = await db.getConnection();
        await conexao.beginTransaction();

        // 2. Insere na tabela 'usuario'
        const queryUsuario = 'INSERT INTO usuario (email, nome, senha, telefone, CPF) VALUES (?, ?, ?, ?, ?)';
        await conexao.execute(queryUsuario, [email, nome, senha, telefone, CPF]);

        // 3. Insere na tabela 'bolsista'
        const queryBolsista = 'INSERT INTO bolsista (email) VALUES (?)';
        await conexao.execute(queryBolsista, [email]);

        // Se tudo deu certo, salva as alterações permanentemente
        await conexao.commit();

        return { sucesso: true, mensagem: `Bolsista ${nome} cadastrado com sucesso!` };

    } catch (erro) {
        // Se houver qualquer erro (Ex: e-mail ou CPF duplicado), desfaz as alterações
        if (conexao) await conexao.rollback();
        
        console.error('Erro ao cadastrar bolsista:', erro);
        return { sucesso: false, mensagem: 'Erro interno ao realizar o cadastro ou dados duplicados.' };
    } finally {
        if (conexao) conexao.release();
    }
}

module.exports = { cadastrarBolsista };
