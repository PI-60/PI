
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
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function(req, arquivo, callback) {

        if (arquivo.mimetype.startsWith("image/")) {
            callback(null, true);

        } else {

            callback(new Error("Arquivo não é uma imagem."));

        }

    }

});


// ROTA PARA ADICIONAR IMAGEM
router.post(
    "/adicionar-imagem", upload.single("imagem"),async function(req, res) {

        try {
            if (!req.file) {
                return res.json({
                    sucesso: false
                });

            }

            const caminho = "/uploads/galeria/" + req.file.filename;
            await pool.execute(
                "INSERT INTO imagens_galeria (caminho) VALUES (?)",
                [caminho]
            );

            res.json({

                sucesso: true,
                imagem: caminho

            });

        } catch (erro) {

            console.error("Erro ao salvar imagem:", erro);

            res.status(500).json({
                sucesso: false
            });

        }

    }
);

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


export default router;


