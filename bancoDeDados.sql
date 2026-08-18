create database ifsc60;

-- create tables

create table usuario(
email varchar(100) primary key not null,
nome varchar(100) not null,
    senha varchar(50) not null, 
    telefone varchar(13),
    CPF varchar (11) not null
); 

create table oficina(
	 idOficina int auto_increment primary key not null,
     email varchar(100),
     foreign key (email) references usuario (email),
     titulo varchar (50) not null,
     descricao varchar (1200),
     local varchar (1200),
     dt_inicio date not null,
     dt_termino date not null,
     duracaoHr time not null
);

create table coordenador(
	email varchar(100) primary key not null,
	SIAPE varchar(20) not null,
    foreign key (email) references usuario (email) 
);

create table bolsista(
	email varchar(100) primary key not null,
    foreign key (email) references usuario (email) 
);

create table administrador(
	email varchar(100) primary key,
    foreign key (email) references usuario (email)
);

create table participante(
	idParticipante int auto_increment primary key not null,
    email varchar(100),
    foreign key (email) references administrador (email),
    nome varchar (200) not null,
    CPF varchar(11),
    telefone varchar (13)
    );
    
create table comparece (
	email varchar(100) primary key not null,
	foreign key (email) references bolsista (email),
    idOficina int auto_increment not null,
    foreign key (idOficina) references oficina (idOficina)
);

create table oficinaDia (
	idOficinaDia int auto_increment primary key not null,
    dt date not null
);

create table dia_oficina (
	idOficina int primary key not null,
	foreign key (idOficina) references oficina (idOficina),
	idOficinaDia int not null,
    foreign key (idOficinaDia) references oficinaDia (idOficinaDia)
);

create table participa (
	idParticipante int primary key not null, 
    idOficinaDia int not null,
    foreign key (idOficinaDia) references oficinaDia (idOficinaDia),
    foreign key (idParticipante) references participante (idParticipante),
    frequencia boolean
);

create table ministrante (
	email varchar(100) primary key not null, 
    nome varchar (200) not null,
    telefone varchar (13)
);

-- inserts

insert into usuario
values 
('suelen.vicente@ifsc.edu.br', '12345', '44998682401', '00000000001'),
('fernanda.trentini@ifsc.edu.br', '12345', '47988888888', '00000000001'),
('oliver.cs11@aluno.ifsc.edu.br', '12345', '47988171843', '00000000001'),
('heloisa.mr@aluno.ifsc.edu.br', '12345', '12345678900', '00000000001'),
('kiara.s18@aluno.ifsc.edu.br', '12345', '12345678900', '00000000001'),

insert into coordenador 
values 
('suelen.vicente@ifsc.edu.br', '12345'),
('fernanda.trentini@ifsc.edu.br', '12345');

insert into bolsista 
values 
('heloisa.mr@aluno.ifsc.edu.br),
('kiara.s18@aluno.ifsc.edu'),
('oliver.cs11@aluno.ifsc.edu');


