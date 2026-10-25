
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

        if (coordenadores.length === 0) {
            return res.status(403).send(
                'Acesso negado. Apenas coordenadores podem realizar esta ação.'
            );
        }

        next();
    } catch (erro) {
        console.error('Erro ao verificar permissão:', erro);
        return res.status(500).send(
            'Erro ao verificar permissões.'
        );
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
        console.error('Erro ao verificar permissão:', erro);
        return res.status(500).send(
            'Erro ao verificar permissões.'
        );
    }
}
