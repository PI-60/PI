
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

import pool from "../database.js";

const router = express.Router();

// Caminho da pasta atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do armazenamento = serve para uarar o caminho da img /uploads/galeria/foto1.png
const armazenamento = multer.diskStorage({

    destination: function(req, arquivo, callback) {

        callback(null, path.join(
            __dirname,
            "../public/uploads/galeria"
        ));

    },

    filename: function(req, arquivo, callback) {

        const extensao = path.extname(arquivo.originalname);
        const nomeArquivo = randomUUID() + extensao;

        callback(null, nomeArquivo);

    }

});

// Configuração do Multer
const upload = multer({

    storage: armazenamento,

    limits: {
     fileSize: 10 * 1024 * 1024
    },

    fileFilter: function(req, arquivo, callback) {

    console.log("Nome:", arquivo.originalname);
    console.log("Tipo recebido:", arquivo.mimetype);

    if (arquivo.mimetype.startsWith("image/")) {
        callback(null, true);
    } else {
        console.log("Arquivo rejeitado!");
        callback(new Error("Arquivo não é uma imagem."));
    }

}
});

router.get('/galeria', async (req, res) => {

    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    try {

        const [imagens] = await pool.execute(
            "SELECT * FROM imagens_galeria ORDER BY id DESC"
        );

        res.render('telaGaleria', {
            layout: 'layouts/telasNavegacao',
            imagens: imagens

        });

    } catch (erro) {
        console.error("Erro ao buscar imagens:", erro);
        res.status(500).send("Erro ao carregar a galeria.");

    }

});

router.post("/adicionar-imagem", upload.single("imagem"), async function(req, res) {
        try {

            if (!req.file) {
                return res.json({ sucesso: false });
            }

            const caminho = "/uploads/galeria/" + req.file.filename;

            // salva a imagem no banco
            const [resultado] = await pool.execute(
                "INSERT INTO imagens_galeria (caminho) VALUES (?)",
                [caminho]
            );

            // busca a imagem cadastrada e sua data de upload
            const [imagens] = await pool.execute(
                "SELECT id, caminho, data_upload FROM imagens_galeria WHERE id = ?",
                [resultado.insertId]
            );

            res.json({
                sucesso: true,
                imagem: imagens[0]

            });

        } catch (erro) {

            console.error("Erro ao salvar imagem:", erro);

            res.status(500).json({
                sucesso: false
            });

        }

    }
);
// ROTA PARA LISTAR AS IMAGENS
router.get("/listar-imagens", async function(req, res) {

    try {

        const [imagens] = await pool.execute(
            "SELECT id, caminho, data_upload FROM imagens_galeria ORDER BY id DESC"
        );

        res.json(imagens);

    } catch (erro) {

        console.error("Erro ao listar imagens:", erro);

        res.status(500).json({
            erro: "Erro ao carregar imagens."
        });

    }

});

export default router;


