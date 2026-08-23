CREATE DATABASE IF NOT EXISTS ifsc60;
USE ifsc60;

-- TABELA PRINCIPAL DE USUÁRIOS

CREATE TABLE usuario (
    email VARCHAR(100) PRIMARY KEY NOT NULL,
    nome VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(13),
    CPF VARCHAR(11) NOT NULL
);

-- OFICINA

CREATE TABLE oficina (
    idOficina INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100),
    titulo VARCHAR(50) NOT NULL,
    descricao VARCHAR(1200),
    local VARCHAR(1200),
    dt_inicio DATE NOT NULL,
    dt_termino DATE NOT NULL,
    duracaoHr TIME NOT NULL,

    FOREIGN KEY (email) REFERENCES usuario(email)
);

-- COORDENADOR

CREATE TABLE coordenador (
    email VARCHAR(100) PRIMARY KEY NOT NULL,
    SIAPE VARCHAR(20) NOT NULL,

    FOREIGN KEY (email) REFERENCES usuario(email)
);

-- BOLSISTA

CREATE TABLE bolsista (
    email VARCHAR(100) PRIMARY KEY NOT NULL,

    FOREIGN KEY (email) REFERENCES usuario(email)
);

-- ADMINISTRADOR

CREATE TABLE administrador (
    email VARCHAR(100) PRIMARY KEY NOT NULL,

    FOREIGN KEY (email) REFERENCES usuario(email)
);

-- PARTICIPANTE

CREATE TABLE participante (
    idParticipante INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    CPF VARCHAR(11),
    telefone VARCHAR(13)
);

-- COMPARECE

CREATE TABLE comparece (
    email VARCHAR(100) NOT NULL,
    idOficina INT NOT NULL,

    PRIMARY KEY (email, idOficina),

    FOREIGN KEY (email) REFERENCES bolsista(email),
    FOREIGN KEY (idOficina) REFERENCES oficina(idOficina)
);

-- OFICINA DIA

CREATE TABLE oficinaDia (
    idOficinaDia INT AUTO_INCREMENT PRIMARY KEY,
    dt DATE NOT NULL
);

-- DIA_OFICINA

CREATE TABLE dia_oficina (
    idOficina INT NOT NULL,
    idOficinaDia INT NOT NULL,

    PRIMARY KEY (idOficina, idOficinaDia),

    FOREIGN KEY (idOficina) REFERENCES oficina(idOficina),
    FOREIGN KEY (idOficinaDia) REFERENCES oficinaDia(idOficinaDia)
);

-- PARTICIPA

CREATE TABLE participa (
    idParticipante INT NOT NULL,
    idOficinaDia INT NOT NULL,
    frequencia BOOLEAN,

    PRIMARY KEY (idParticipante, idOficinaDia),

    FOREIGN KEY (idParticipante) REFERENCES participante(idParticipante),
    FOREIGN KEY (idOficinaDia) REFERENCES oficinaDia(idOficinaDia)
);

-- MINISTRANTE

CREATE TABLE ministrante (
    email VARCHAR(100) PRIMARY KEY NOT NULL,
    nome VARCHAR(200) NOT NULL,
    telefone VARCHAR(13)
);

-- USUÁRIOS FICTÍCIOS

INSERT INTO usuario
    (email, nome, senha, telefone, CPF)
VALUES
    ('ana.teste@ifsc.edu.br', 'Ana Teste', '12345', '47999999999', '00000000001'),
    ('bruno.teste@ifsc.edu.br', 'Bruno Teste', '12345', '47988888888', '00000000002'),
    ('carla.teste@aluno.ifsc.edu.br', 'Carla Teste', '12345', '47977777777', '00000000003'),
    ('diego.teste@aluno.ifsc.edu.br', 'Diego Teste', '12345', '47966666666', '00000000004'),
    ('elisa.teste@aluno.ifsc.edu.br', 'Elisa Teste', '12345', '47955555555', '00000000005');

-- COORDENADORES

INSERT INTO coordenador
    (email, SIAPE)
VALUES
    ('ana.teste@ifsc.edu.br', '100001'),
    ('bruno.teste@ifsc.edu.br', '100002');

-- BOLSISTAS

INSERT INTO bolsista
    (email)
VALUES
    ('carla.teste@aluno.ifsc.edu.br'),
    ('diego.teste@aluno.ifsc.edu.br'),
    ('elisa.teste@aluno.ifsc.edu.br');

