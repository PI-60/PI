import nodemailer from 'nodemailer';

// "Carteiro" que envia os e-mails pelo Gmail.
// O usuário e a senha de app vêm do arquivo .env (nunca escritos no código).
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Envia o e-mail com o link de redefinição de senha
export async function enviarEmailRedefinicao(destino, nome, link) {
    await transporter.sendMail({
        from: `"IFSC 60+" <${process.env.GMAIL_USER}>`,
        to: destino,
        subject: 'Redefinição de senha - IFSC 60+',
        text:
            `Olá, ${nome}!\n\n` +
            `Recebemos um pedido para redefinir a sua senha.\n` +
            `Acesse o link abaixo para criar uma nova senha (válido por 30 minutos):\n\n` +
            `${link}\n\n` +
            `Se você não pediu a redefinição, ignore este e-mail. Sua senha continua a mesma.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
                <h2 style="color: #129745;">IFSC 60+</h2>
                <p>Olá, <strong>${nome}</strong>!</p>
                <p>Recebemos um pedido para redefinir a sua senha.
                   Clique no botão abaixo para criar uma nova senha:</p>
                <p style="text-align: center; margin: 28px 0;">
                    <a href="${link}"
                       style="background: #129745; color: #fff; padding: 12px 24px;
                              border-radius: 6px; text-decoration: none; font-weight: bold;">
                        Redefinir senha
                    </a>
                </p>
                <p style="color: #666; font-size: 13px;">
                    O link vale por 30 minutos.<br>
                    Se você não pediu a redefinição, ignore este e-mail. Sua senha continua a mesma.
                </p>
            </div>`
    });
}
