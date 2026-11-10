import argon2 from 'argon2';

// Gera o hash Argon2id da senha (é isso que vai para o banco, nunca a senha pura)
export async function gerarHash(senha) {
    return argon2.hash(senha, { type: argon2.argon2id });
}

// Verifica se a senha digitada confere com a senha salva no banco.
// Retorna { valida, precisaAtualizar }:
//  - valida: a senha está correta?
//  - precisaAtualizar: a senha salva ainda está em texto puro (cadastros antigos)
//    e deve ser trocada pelo hash.
export async function verificarSenha(senhaSalva, senhaDigitada) {
    if (!senhaSalva || !senhaDigitada) {
        return { valida: false, precisaAtualizar: false };
    }

    if (senhaSalva.startsWith('$argon2')) {
        try {
            const valida = await argon2.verify(senhaSalva, senhaDigitada);
            return { valida, precisaAtualizar: false };
        } catch {
            return { valida: false, precisaAtualizar: false };
        }
    }

    // Senha antiga, ainda em texto puro
    const valida = senhaSalva === senhaDigitada;
    return { valida, precisaAtualizar: valida };
}
