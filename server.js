const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

(async () => {
  let servicos = await prisma.chamado.findMany()
  console.log("Serviços vindo do servidor: " + servicos)
})()
.catch((e)=>{throw e})
.finally(async()=>{await prisma.$disconnect()});

app.use(express.json())

app.use(express.static('./public/'))

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

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
  console.log("Salvando novo serviço")
  let servico = req.body
  await prisma.chamado.create({data: {
    autor: servico.autor,
    chat: {
      create: servico.chat
    },
    assunto: servico.assunto,
    departamento: servico.departamento,
    status: servico.status,
    prioridade: servico.prioridade
  }})

  res.status(200).send(req.body)
});

app.post('/api/update/servico/:id', async (req, res) => {
  console.log("Salvando novo serviço")
  novo_servico = req.body
  novo_servico.chat.forEach((element)=>delete element.chamadoId)
  await prisma.chamado.update({
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
      prioridade: novo_servico.prioridade
    }
  });

  res.status(200).send(req.body)
});

app.get('/api/servicos', async (req, res) => {
  console.log('Sending services')
  let servicos = await prisma.chamado.findMany()
  res.send(servicos)
});

app.get('/api/servicos/:filtro', async (req, res) => {
  console.log('Sending "' + req.params.filtro + '" services')
  let servicos = await prisma.chamado.findMany(
    {
      where:{
      status: req.params.filtro
      }
    }
  )
  res.send(servicos)
});

app.get('/api/servico/:id', async (req, res)=> {
  console.log("Buscando serviço " + req.params.id)
  let servico = await prisma.chamado.findUnique({
    where: {
      id: parseInt(req.params.id)
    }
  }).catch((e)=>console.log("Erro recuperando serviço"))
  servico.chat = await prisma.mensagem.findMany({
    where: {
      chamadoId: parseInt(req.params.id)
    }
  })
  console.log("Encontrado")
  res.send(servico)
})

app.listen(port, () => console.log(`Listening on port ${port}`));