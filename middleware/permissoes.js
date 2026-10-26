
import db from '../database.js';

// Verifica se a pessoa está logada
export function exigirLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    next();
}

// Verifica se a pessoa tem a função de coordenador
export async function exigirCoordenador(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    try {
        const email = req.session.usuario.email;

        const [coordenadores] = await db.execute(
            'SELECT email FROM coordenador WHERE email = ?',
            [email]
        );

        console.log('E-mail da sessão:', email);
        console.log('Resultado da busca por coordenador:', coordenadores);

        if (coordenadores.length === 0) {
            return res.status(403).send(
                'Acesso negado. Apenas coordenadores podem realizar esta ação.'
            );
        }

        next();
    } catch (erro) {
        console.error('Erro ao verificar permissão de coordenador:', erro);
        return res.status(500).send('Erro ao verificar permissões.');
    }
}

// Verifica se a pessoa tem a função de administrador
export async function exigirAdministrador(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    try {
        const email = req.session.usuario.email;

        const [administradores] = await db.execute(
            'SELECT email FROM administrador WHERE email = ?',
            [email]
        );

        if (administradores.length === 0) {
            return res.status(403).send(
                'Acesso negado. Apenas administradores podem realizar esta ação.'
            );
        }

        next();
    } catch (erro) {
        console.error('Erro ao verificar permissão de administrador:', erro);
        return res.status(500).send('Erro ao verificar permissões.');
    }
}

// Coordenadores OU administradores podem gerenciar ministrantes
export async function exigirCoordenadorOuAdministrador(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    try {
        const email = req.session.usuario.email;

        const [coordenadores] = await db.execute(
            'SELECT email FROM coordenador WHERE email = ?',
            [email]
        );

        const [administradores] = await db.execute(
            'SELECT email FROM administrador WHERE email = ?',
            [email]
        );

        console.log('Verificando permissão para ministrantes:', email);
        console.log('Coordenador encontrado:', coordenadores.length > 0);
        console.log('Administrador encontrado:', administradores.length > 0);

        if (coordenadores.length === 0 && administradores.length === 0) {
            return res.status(403).send(
                'Acesso negado. É necessário estar logado como coordenador ou administrador.'
            );
        }

        next();
    } catch (erro) {
        console.error('Erro ao verificar permissões de ministrante:', erro);
        return res.status(500).send('Erro ao verificar permissões.');
    }
}
