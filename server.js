const { PrismaClient } = require('@prisma/client');

const cookieParser = require('cookie-parser');

const bcrypt = require('bcrypt')
const session = require('express-session')
const _ = require('lodash')

const { PrismaSessionStore } = require('@quixo3/prisma-session-store')

const fs = require('fs')
const SECRET = fs.readFileSync('./key', 'utf-8');

//const key = fs.readFileSync('./certification/key.pem');
//const cert = fs.readFileSync('./certification/cert.pem');

const prisma = new PrismaClient()
const express = require('express');
const { createJsxAttribute } = require('typescript');
//const https = require('https')
const app = express();
//const server = https.createServer({key, cert}, app)
const port = process.env.PORT || 5000;

var usuarios = "vazio"
var chamados = "vazio"
var categorias = "vazio"

const store = new PrismaSessionStore(
  prisma, {
  checkPeriod: 10 * 60 * 1000,
  dbRecordIdIsSessionId: true,
  dbRecordIdFunction: undefined,
});
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
  res.setHeader('Access-Control-Allow-Origin', 'http://10.0.0.5:3000');

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

async function updateChamados() {
  chamados = await prisma.chamado.findMany({
    select: {
      id: true,
      autorId: true,
      metadados: true,
      chat: true,
      assunto: true,
      createdAt: true,
      prazo: true,
      updatedAt: true
    }
  })
  .then((data) => {
    let Metas = [];
    chamados = [];
    for (const [index, chamado] of Object.entries(data))
      Metas[index] =
        Object.fromEntries(
          chamado.metadados.map(
            (md) => {
              return [md.nome, md.valor]
            }
          )
        )
    return data.map((chamado, index) => { delete chamado.metadados; return { ...chamado, ...Metas[index] } })
  }).catch((e)=>{
    if (chamados === "vazio")
      throw e
    else
      console.log("Erro em updateChamados.\n", e)
  })
}

async function updateUsuarios() {
  await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      sobrenome: true,
      senha: false,
      email: true,
      metadados: true
    }
  }).then(function (usuarios_array) {
    usuarios = []
    for (let usuario of usuarios_array)
      usuarios[usuario.id] = usuario
    let Metas = [];
    for (const [index, usuario] of Object.entries(usuarios_array))
      Metas[index] =
        Object.fromEntries(
          usuario.metadados.map(
            (md) => {
              return [md.nome, md.valor]
            }
          )
        )
    usuarios = usuarios.map((usuario, index) => { delete usuario.metadados; return { ...usuario, ...Metas[index] } })
  }).catch((e)=>{
    if (usuarios === "vazio")
      throw e
    else
      console.log("Erro em updateUsuarios.\n", e)
  })
}

async function updateCategorias() {
  await prisma.usuario.findMany({
  }).then(function (data) {
    categorias = data
  }).catch((e)=>{
    if (categorias === "vazio")
      throw e
    else
      console.log("Erro em updateCategorias.\n", e)
  })
}
updateChamados()
updateUsuarios()
updateCategorias()
/* 
Serviços
*/
app.post('/api/novo/servico', async (req, res) => {
  let servico = req.body
  let autorId = servico.autorId
  req.session.valid ?
    ((console.log("Salvando novo serviço")),
      (servico.chat[servico.chat.length] = { autorId: 3, mensagem: "Seu chamado será atendido dentro de " + ["uma semana", "3 dias", "um dia", "algumas horas"][servico.prioridade - 1] }),
      (await prisma.chamado.create({
        data: {
          autorId,
          chat: {
            create: servico.chat
          },
          assunto: servico.assunto,
          prazo: servico.prazo,
          metadados: {
            createMany: {
              data: Object.entries({
                departamento: servico.departamento,
                status: servico.status,
                prioridade: servico.prioridade,
                tipo: servico.tipo,
                atendenteId: servico.atendenteId,
                atendimento: String(false),
                subCategoria: servico.subCategoria
              }).map((metadado) => { return { "nome": metadado[0], "valor": String(metadado[1]) } })
            }
          }
        }
      })),
      (updateChamados()),
      res.status(200).send(req.body)) : res.send("Não autorizado")
});

app.post('/api/update/servico/:id', async (req, res) => {
  let novo_servico = req.body
  let metadados = Object.entries({
    assunto: novo_servico.assunto,
    departamento: novo_servico.departamento,
    status: novo_servico.status,
    prioridade: novo_servico.prioridade,
    atendimento: (novo_servico.chat ? (novo_servico.chat.length > 1 ? true : false) : undefined),
    tipo: novo_servico.tipo,
    atendenteId: novo_servico.atendenteId
  }).map((metadado) => { return { "nome": metadado[0], "valor": String(metadado[1]) } });
  let validUpdate = 
    chamados
    .find(chamado=>chamado.metadados.chamadoId==novo_servico.id)
    .atendenteId == usuarios[req.session.usuarioId].id 
    || usuarios[req.session.usuarioId].metadados.find(md=>md.nome=="cargo").valor == "admin"
  console.log("Edição é " + (validUpdate ? "válida" : "inválida"))
  req.session.valid && validUpdate ? (async () => {
    console.log("Atualizando serviço")
    if (novo_servico.chat) {
      novo_servico.chat.forEach((element) => delete element.chamadoId)
      await prisma.chamado.update({
        where: {
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
        }
      }).catch((e)=>console.log("Erro na atualização do chamado.\n", e))
    }
    for (let metadado of metadados)
      await prisma.metadadoChamado.updateMany({
        where: {
          chamadoId: parseInt(req.params.id),
          nome: metadado.nome
        },
        data: {
          valor: metadado.valor
        }
      }).catch((e)=>console.log("Erro na atualização dos metadados do chamado. \n", e))
    updateChamados()
    res.status(200).send(req.body)
  })() : res.send("Não autorizado")
});

app.get('/api/servicos', (req, res) => {
  req.session.valid ?
        usuarios[req.session.usuarioId].tipo == "suporte" ?
          res.send(chamados)
        : res.send(chamados.filter(chamado=>chamado.autorId==req.session.usuarioId))
    : res.send("Não autorizado")
});

app.get('/api/servicos/:tipo/:filtro', (req, res) => {
  req.session.valid ?
    usuarios[req.session.usuarioId].tipo == "suporte" ?
      res.send(chamados.filter(chamado=>chamado[req.params.tipo] == req.params.filtro))
    : res.send(chamados.filter(chamado=>chamado.autorId == req.session.usuarioId && chamado[req.params.tipo] == req.params.filtro))
    : res.send("Não autorizado")
});

app.get('/api/servico/:id', (req, res) => {
  let chamado = chamados.find(chamado=>chamado.id==req.params.id);
  req.session.valid && (chamado.autorId == req.session.usuarioId || usuarios[req.session.usuarioId].tipo == "suporte") ?
      res.send(chamado)
  : res.send("Não autorizado")
});

/*
Categorias
*/

app.get('/api/servicos/categorias/:tipo', (req, res) => {
  console.log(req.params)
  req.session.valid ?
    res.send(categorias.filter(categoria=>categoria.tipo == req.params.tipo))
  : res.send("Não autorizado")
});

app.get('/api/servicos/categorias', (req, res) => {
  res.send(categorias)
});

app.post('/api/servicos/novo/subcategoria/', async (req, res) => {
  let sub = req.body
  let usuario = usuarios[req.session.usuarioId]
  req.session.valid ?
    usuario.tipo == "suporte" ?
      prisma.categoria.create({
        data: {
          tipo: sub.tipo,
          categoria: sub.newCategoria
        }
      })
        .then(r => res.status(200).send("OK" + r))
        .catch(error => res.status(505).send({ error })) : res.send("Não autorizado")
    : res.send("Não autorizado")
  updateCategorias()
});

app.post('/api/servicos/editar/subcategoria/:c/:sc', async (req, res) => {
  let sub = req.body
  let usuario = usuarios[req.session.usuarioId]
  req.session.valid && usuario ?
    usuario.tipo == "suporte" ?
      prisma.categoria.updateMany({
        where: {
          tipo: req.params.c,
          categoria: req.params.sc
        },
        data: {
          tipo: sub.tipo,
          categoria: sub.newCategoria
        }
      })
        .then(r => res.status(200).send("OK" + JSON.stringify(r)))
        .catch(error => res.status(505).send({ error })) : res.send("Não autorizado")
    : res.send("Não autorizado")
  updateCategorias()
});

app.post('/api/servicos/excluir/subcategoria/:c/:sc', async (req, res) => {
  let usuario = usuarios[req.session.usuarioId]
  req.session.valid ?
    usuario.tipo == "suporte" ?
      prisma.categoria.deleteMany({
        where: {
          tipo: req.params.c,
          categoria: req.params.sc
        }
      })
        .then(r => res.status(200).send("OK" + r))
        .catch(error => res.status(505).send({ error })) : res.send("Não autorizado")
    : res.send("Não autorizado")
  updateCategorias()
});

/*
Usuários
*/

app.post('/api/novo/usuario', (req, res) => {
  req.session.valid && usuarios[req.session.usuarioId].cargo == "admin" ? prisma.usuario.findMany({
    where: {
      email: req.body.email
    }
  }).then(async (usuario) => {
    if (usuario.length !== 0) {
      res.status(302).send("Email já registrado")
      return
    }
    console.log(JSON.stringify(req.body))
    req.body.senha = await bcrypt.hash(req.body.senha, 12)
    return req.body
  }, (err) => { res.status(500).send("Erro acessando o banco de dados") })
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
    }, (err) => { res.status(500).send("Erro criando o usuário. \n" + err) })
    : res.send("Não autorizado")
  updateUsuarios()
});

app.get('/api/usuario/email/:email', (req, res) => {
  req.session.valid ? 
    res.send(usuarios.map(usuario=>{delete usuario.senha; return usuario}).find(usuario=>usuario.email==req.params.email))
  : res.send("Não autorizado")
});

app.get('/api/usuarios/:tipo/:filtro', (req, res) => {
  req.session.valid ?
    res.send(usuarios.filter(usuario=>usuario[req.params.tipo] == req.params.filtro).map(usuario=>{delete usuario.senha; return usuario}))
    : res.send("Não autorizado")
});

app.get('/api/usuario/:id', (req, res) => {
  req.session.valid ? 
    res.send(usuarios.map(usuario=>{delete usuario.senha; return usuario}).find(usuario=>usuario.id == req.params.id))
  : res.send("Não autorizado")
})
/*
perfil e auth
*/
app.get('/api/perfil', async (req, res) => {
  req.session.valid ? 
    res.send(usuarios.map(usuario=>{delete usuario.senha; return usuario})[req.session.usuarioId])
  : res.send("Não autorizado")
})

app.post('/api/login', async (req, res) => {
  await prisma.usuario.findMany({
    where: {
      email: req.body.email
    }
  }).then(async (usuario) => {
    if (usuario.length === 0) {
      res.send(JSON.stringify({ "status": 404, "error": "Usuário com esse email não encontrado" }))
      return
    }
    req.session.valid = false
    req.session.valid = await bcrypt.compare(req.body.senha, usuario[0].senha)
    if (req.session.valid) req.session.usuarioId = usuario[0].id
    if (!req.session.valid) {
      res.send(JSON.stringify({ "status": 404, "error": "Senha incorreta" }))
      return
    }
    req.session.save((e) => { res.send(JSON.stringify({ "status": 200, "error": e })) })
  }).catch((err) => {
    console.log(err)
    res.send(JSON.stringify({ "status": 500, "error": "Erro no login" }))
    return false
  })
})

app.post('/api/alterasenha', async (req, res) => {
  await prisma.usuario.findMany({
    where: {
      email: req.body.email
    }
  }).then(async (usuario) => {
    if (usuario.length === 0) {
      res.send(JSON.stringify({ "status": 404, "error": "Usuário com esse email não encontrado" }))
      return
    }
    req.session.valid = false
    if (usuario[0].senha !== "")
      req.session.valid = await bcrypt.compare(req.body.senhaatual, usuario[0].senha)
    else
      req.session.valid = true
    if (req.session.valid) {
      req.session.usuarioId = usuario[0].id
      req.body.senha = await bcrypt.hash(req.body.senha, 12)
      await prisma.usuario.update({
        where: {
          id: usuario[0].id
        },
        data: {
          senha: req.body.senha
        }
      })
    }
    if (!req.session.valid) {
      res.send(JSON.stringify({ "status": 404, "error": "Senha incorreta" }))
      return
    }
    req.session.save((e) => { res.send(JSON.stringify({ "status": 200, "error": e })) })
  }).catch((err) => {
    console.log(err)
    res.send(JSON.stringify({ "status": 500, "error": "Erro no login" }))
    return false
  })
  updateUsuarios()
})

app.post('/api/logout', async (req, res) => {
  //req.session.destroy((err) => { if (!err) { res.status(200).send("Logout com sucesso"); console.log("Logout com sucesso") } else { res.status(500).send("Algum erro ocorreu."); console.log("Algum erro ocorreu.") } })
  try {
    req.session.valid = false
    req.session.save()
    res.status(200).send("OK")
  } catch (e) {
    console.log("Falha em logout. \n" + e)
    res.status(500).send("Error")
  }
})

/*
misc
*/

app.get('/api/monitoring', (req, res) => {
  let atendentes = usuarios.slice(4, 7).map(usuario=>({id: usuario.id, nome: usuario.nome, sobrenome: usuario.sobrenome}))
  //console.log(usuarios.filter(usuario=>usuario.tipo=="suporte"))
  res.send( {
    atendentes,
    chamados
  } )
})

app.listen(port, () => console.log(`Listening on port ${port}`));