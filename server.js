const { PrismaClient } = require('@prisma/client');

const cookieParser = require('cookie-parser');

const bcrypt = require('bcrypt')
const session = require('express-session')
const _ = require('lodash')

const { PrismaSessionStore } = require('@quixo3/prisma-session-store')

const fs = require('fs')
const SECRET = fs.readFileSync('./key', 'utf-8');
//fs.readFile('./key',(err, data)=>{if(!err) SECRET=data; else throw Error("Falha em obter segredo")})
//const PUBLIC_KEY;
//fs.readFile('./key.pub',(err, data)=>{if(!err) PUBLIC_KEY=data; else throw Error("Falha em ler chave pública")})


const prisma = new PrismaClient()
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const store = new PrismaSessionStore(
  prisma, {
    checkPeriod: 10 * 60 * 1000,
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  }
);

(async()=>{await prisma.$disconnect()})();

app.use(express.json())
app.use(cookieParser())
app.use(session({
  secret: SECRET,
  store,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
  }
}));
app.use(express.static('./public/'))

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://10.0.0.83:3000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  
  next();
});

app.get('/api/mensagem', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.post('/api/novo/servico', async (req, res) => {
  let servico = req.body
  let autorId = servico.autorId
  req.session.valid ? 
  ((console.log("Salvando novo serviço")),
  (await prisma.chamado.create({data: {
    autorId,
    chat: {
      create: servico.chat
    },
    assunto: servico.assunto,
    departamento: servico.departamento,
    status: servico.status,
    prioridade: servico.prioridade
  }})),

  res.status(200).send(req.body)) : res.send("Não autorizado")
});

app.post('/api/update/servico/:id', async (req, res) => {
  let novo_servico = req.body
  req.session.valid ? (
  (console.log("Salvando novo serviço")),
  (novo_servico.chat.forEach((element)=>delete element.chamadoId)),
  (await prisma.chamado.update({
    where:{
      id: parseInt(req.params.id)
    },
    data: {
      autor: novo_servico.autor,
      chat: {
        createMany: {
          data: novo_servico.chat,
          skipDuplicates: true
        }
      },
      assunto: novo_servico.assunto,
      departamento: novo_servico.departamento,
      status: novo_servico.status,
      prioridade: novo_servico.prioridade,
      atendimento: true
    }
  })),
  (res.status(200).send(req.body)) ) : res.send("Não autorizado")
});

app.get('/api/servicos', (req, res) => {
  console.log(req.session)
  req.session.valid ? prisma.chamado.findMany().then(data=>res.send(data)) : res.send("Não autorizado")
});

app.get('/api/servicos/:filtro', async (req, res) => {
  console.log(req.session)
  req.session.valid ? 
  prisma.chamado.findMany(
    {
      where:{
      status: req.params.filtro
      }
    }
  ).then((chamado)=>res.send(chamado)) 
  : res.send("Não autorizado")
});

app.get('/api/servico/:id', (req, res)=> {
  req.session.valid ? prisma.chamado.findUnique({
    where: {
      id: parseInt(req.params.id)
    }
  }).then(async (servico)=>{
    servico.chat = await prisma.mensagem.findMany({
      where: {
        chamadoId: parseInt(req.params.id)
      }
    })
    res.send(servico)})
  .catch((e)=>res.status(500).send({erro: "Falha em encontrar serviço " + req.params.id}))
  : res.send("Não autorizado")
})

app.post('/api/novo/usuario', (req, res) => {
  req.session.valid ? prisma.usuario.findMany({
    where: {
      email: req.body.email
    }
  }).then( async (usuario)=>{
      if(usuario.length !== 0) {
        res.status(302).send("Email já registrado")
        return
      }
      console.log(JSON.stringify(req.body))
      req.body.senha = await bcrypt.hash(req.body.senha, 12)
      return req.body
  }, (err)=>{res.status(500).send("Erro acessando o banco de dados")})
    .then(async (data) => {
      await prisma.usuario.create({
        data: {
          email: data.email,
          senha: data.senha,
          nome: data.nome,
          sobrenome: data.sobrenome
        }
      })
      res.status(200).send("Usuário criado com sucesso")
      return
    }, (err)=>{res.status(500).send("Erro criando o usuário. \n" + err)})
  : res.send("Não autorizado")
})

app.get('/api/usuario/:id', (req, res) => {
  req.session.valid ? prisma.usuario.findUnique({
    where: {
      id: parseInt(req.params.id)
    }
  }).then((usuario)=>{
    res.send(usuario)
  }).catch((err)=>{
    res.status(500).send({erro: "Falha em obter usuário "})
  }) : res.send("Não autorizado")
})

app.get('/api/usuario/email/:email', (req, res) => {
  req.session.valid ? prisma.usuario.findUnique({
    where: {
      email: req.params.email
    }
  }).then((usuario)=>{
    usuario !== "" ? res.send(usuario) : res.send("Usuário não encontrado")
  }).catch((err)=>{
    res.status(500).send({erro: "Falha em obter usuário "})
  }) : res.send("Não autorizado")
})

app.get('/api/perfil', async (req, res)=> {
  await prisma.usuario.findUnique({where:{id: req.session.usuarioId}})
    .then(usuario=>{
      delete usuario.senha
      res.send(usuario)
    })
    .catch(err=>{
      res.send("Não autorizado")
    })
})

app.post('/api/login', async (req, res) => {
  console.log(req.sessionID)
  await prisma.usuario.findMany({
    where: {
      email: req.body.email
    }
  }).then( async (usuario)=>{
    if (usuario.length === 0) {
      res.send(JSON.stringify({"status": 404, "error": "Usuário com esse email não encontrado"}))
      return
    }
    req.session.valid = false
    req.session.valid = await bcrypt.compare(req.body.senha, usuario[0].senha)
    if (req.session.valid) req.session.usuarioId = usuario[0].id
    if (!req.session.valid) {
      res.send(JSON.stringify({"status": 404, "error": "Senha incorreta"}))
      return
    }
    console.log(req.sessionID)
    req.session.save(err=>console.log)
    console.log(req.session)
    res.send(JSON.stringify({"status": 200, "error": null}))
  }).catch((err)=>{
    console.log(err)
    res.status(500).send("Erro no login")
    return false
  })
})

app.post('/api/logout', async (req, res) => {
  req.session.destroy((err)=>{if(!err) {res.status(200).send("Logout com sucesso"); console.log("Logout com sucesso")} else {res.status(500).send("Algum erro ocorreu."); console.log("Algum erro ocorreu.")}})
  //try {
  //req.session.valid = false
  //req.session.save()
  //res.status(200).send("OK")
  //}  catch (e) {
  //  console.log("Falha em logout. \n" + e)
  //  res.status(500).send("Error")
  //}
})
app.listen(port, () => console.log(`Listening on port ${port}`));