import prisma_pkg from '@prisma/client'
const { PrismaClient } = prisma_pkg

import bcrypt from 'bcrypt'
import session from 'express-session'

import { PrismaSessionStore } from '@quixo3/prisma-session-store'

import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from "fs"
import { fileTypeFromBuffer } from "file-type"

const SECRET = fs.readFileSync('./key', 'utf-8');

const key = fs.readFileSync(path.resolve('./ssl/key.pem'));
const cert = fs.readFileSync(path.resolve('./ssl/cert.pem'));

import WebSocket, {WebSocketServer} from 'ws';

const prisma = new PrismaClient()
import express from 'express';
import https from 'https';
import http from 'http';
const app = express();
//const server = https.createServer({key, cert}, app)
const port = process.env.PORT || 5000;

var usuarios = "vazio"
var chamados = "vazio"
var categorias = "vazio"
var tipos = "vazio"
var departamentos = "vazio"
var filiais = "vazio"

const store = new PrismaSessionStore(
  prisma, {
  checkPeriod: 10 * 60 * 1000,
  dbRecordIdIsSessionId: true,
  dbRecordIdFunction: undefined,
});
app.use(express.json())
app.use(session({
  secret: SECRET,
  store,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true
  }
}));
app.use(express.static('./public/'))
app.use('/', express.static('./client2/react/dist'))

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'https://10.0.0.5:9999');

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
      chat: {
        include: {
          metadados: true
        }
      },
      assunto: true,
      createdAt: true,
      prazo: true,
      updatedAt: true,
      filialId: true
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
    }).catch((e) => {
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
      metadados: true,
      filialId: true
    },
    where: {
      id: {
        gte: 3
      }
    }
  }).then(function (usuarios_array) {
    usuarios = []
    for (let usuario of usuarios_array)
      usuarios[usuario.id] = usuario
    for (let [index, usuario] of Object.entries(usuarios_array)) {
      let Metas =
        Object.fromEntries(
          usuario.metadados.map(
            (md) => {
              return [md.nome, md.valor]
            }
          )
        )
      usuario = { ...usuario, ...Metas }
      usuario.area = usuario.metadados.filter(md => md.nome == "area").map(md => md.valor)
      usuario.filiais = usuario.metadados.filter(md => md.nome == "acessa_filial").map(md => md.valor)
      delete usuario.metadados
      usuarios[usuario.id] = usuario
    }
  }).catch((e) => {
    if (usuarios === "vazio")
      throw e
    else
      console.log("Erro em updateUsuarios.\n", e)
  })
}

async function updateCategorias() {
  await prisma.categoria.findMany({
  }).then(function (data) {
    categorias = data
  }).catch((e) => {
    if (categorias === "vazio")
      throw e
    else
      console.log("Erro em updateCategorias.\n", e)
  })
}

async function updateDepartamentos() {
  await prisma.departamento.findMany({
  }).then(function (data) {
    departamentos = data
  }).catch((e) => {
    if (departamentos === "vazio")
      throw e
    else
      console.log("Erro em updateDepartamentos.\n", e)
  })
}

async function updateTipos() {
  await prisma.tipo.findMany({
  }).then(function (data) {
    tipos = data
  }).catch((e) => {
    if (tipos === "vazio")
      throw e
    else
      console.log("Erro em updateTipos.\n", e)
  })
}
async function updateFiliais() {
  await prisma.filial.findMany({
  }).then(function (data) {
    filiais = data
  }).catch((e) => {
    if (categorias === "vazio")
      throw e
    else
      console.log("Erro em updateFiliais.\n", e)
  })
}

let isPrimeiroAcesso = (usuario) => {
  let primeiro_acesso = 
    usuario.metadados 
      ? usuario.metadados.find(md=>md.nome=="primeiro_acesso")?.valor 
      : usuario.primeiro_acesso
  if(primeiro_acesso==undefined||primeiro_acesso==null)
    primeiro_acesso = "true"
  return primeiro_acesso==='true'?true:primeiro_acesso==='false'?false:null
}
const conversao = [
  "Jan",    "Jan",
  "Feb",    "Fev",
  "Mar",    "Mar",
  "Apr",    "Abr",
  "May",    "Mai",
  "Jun",    "Jun",
  "Jul",    "Jul",
  "Aug",    "Ago",
  "Sep",    "Set",
  "Oct",    "Out",
  "Nov",    "Nov",
  "Dec",    "Dez",
];
let date_today = Date().split(' ')
let convert = (date)=>`${date[3]}-${String(Math.floor(conversao.indexOf(date[1])/2 + 1)).padStart(2, '0')}-${date[2]}`

await updateChamados()
await updateUsuarios()
await updateCategorias()
await updateDepartamentos()
await updateTipos()
await updateFiliais()
/*
Filiais
*/
app.get('/api/:codfilial/', async (req, res)=>{
  let {codfilial} = req.params 
  let { usuarioId : uid } = req.session
  req.session.valid ?
    filiais.filter(filial=>usuarios[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==codfilial) !== undefined ?
      res.send(filiais.find(f=>f.codigo==codfilial))
    : res.send("Filial inválida")
  : res.send("Não autorizado")
})

app.get('/api/:codfilial/all', async (req, res)=>{
  let {usuarioId : uid} = req.session
  console.log(usuarios[uid]?.nome,usuarios[uid]?.filiais.map(filial=>filiais.find(f=>f.id==filial)))
  req.session.valid ?
    res.send(usuarios[uid]?.filiais.map(filial=>filiais.find(f=>f.id==filial)))
  : res.send("Não autorizado")
})
/* 
Serviços
*/

app.post('/api/:codfilial/novo/servico', async (req, res) => {
  let servico = req.body
  let autorId = servico.autorId
  let { usuarioId : uid } = req.session
  let { codfilial } = req.params
  req.session.valid && filiais.filter(filial=>usuarios[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==codfilial) ?
    (console.log("Salvando novo serviço"),
      servico.chat[servico.chat.length] = { autorId: 3, mensagem: "Seu chamado será atendido dentro de " + ["uma semana", "3 dias", "um dia", "algumas horas"][servico.prioridade - 1] },

      await prisma.chamado.create({
        data: {
          autorId,
          chat: {
            create: servico.chat
          },
          assunto: servico.assunto,
          prazo: servico.prazo,
          filialId: parseInt(filiais.find(f=>f.codigo==req.params.codfilial).id),
          metadados: {
            createMany: {
              data: Object.entries({
                departamento: servico.departamento,
                status: servico.status,
                prioridade: servico.prioridade,
                tipo: servico.tipo,
                atendimento: String(false),
                subCategoria: servico.subCategoria,
                usuarioId: servico.usuarioId
              }).map((metadado) => { return { "nome": metadado[0], "valor": String(metadado[1]) } })
            }
          }
        }
      }),
      (updateChamados()),
      res.status(200).send(req.body))
    : res.send("Não autorizado")
});

app.post('/api/:codfilial/update/servico/:id/arquivo', (req, res) => {
  let filename = (()=>`${Date.now()}-${req.body.title}`)()
  let {usuarioId:uid} = req.session
  let {codfilial, id} = req.params
  console.log(Object.keys(req.body), filename)
  req.session.valid && filiais.filter(filial=>usuarios[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ? (
    console.log("Salvando arquivo no serviço"),
    req.body.data ? 
      (console.log("Iniciando a escrita"),
        fs.writeFile(
          path.resolve(`files/`, filename),
          req.body.data.split('base64,')[1],
          'base64',
          (error) => {
            if (error) {
              console.log(error)
              console.log({ error })
              res.send({ error })
              return
            }
            console.log(`Arquivo ${filename} salvo com sucesso`)
            prisma.metadadoChamado.updateMany({
              where: {
                chamadoId: parseInt(req.params.id),
                nome: "anexo"
              },
              data: {
                valor: filename
              }
            })
              .then(async data => {
                console.log(`${data.count} registro alterado`)
                if (data.count == 0)
                  await prisma.metadadoChamado.create({
                    data: {
                      nome: "anexo",
                      valor: filename,
                      chamado: {
                        connect: {
                          id: parseInt(req.params.id)
                        }
                      }
                    }
                  }).then(() => {
                    console.log("Registro raiz criado")
                    res.send()
                    updateChamados()
                  })
                    .catch(() => { console.log("Erro na criação do registro raiz"); res.status(500).send() })
                else
                  res.send()
                updateChamados()
              })
              .catch(error => {
                console.log(error)
                res.send({ error })
              })
          }
        ))
      : res.send()
  )
    : res.send("Não autorizado")
})

app.post('/api/:codfilial/update/servico/:id', async (req, res) => {
  let novo_servico = req.body
  let chamado_atualizado = undefined
  let { usuarioId : uid } = req.session 
  let { codfilial, id } = req.params
  let metadados = Object.entries({
    departamento: novo_servico.departamento,
    status: novo_servico.status,
    prioridade: novo_servico.prioridade,
    atendimento: 
      novo_servico.atendimento 
      ? novo_servico.atendimento
      : (novo_servico.chat 
        ? (novo_servico.chat.length > 2 
          ? true 
          : false) 
        : false),
    tipo: novo_servico.tipo,
    atendenteId: novo_servico.atendenteId,
    usuarioId: novo_servico.usuarioId
  }).map((metadado) => { return { nome: metadado[0], valor: String(metadado[1]) } });
  let valuidpdate;
  try {
    let chamado =
      chamados
        .filter(chamado => chamado)
        .find(chamado => chamado.id == novo_servico.id)
    valuidpdate =
      (((chamado
        .atendenteId || uid) == uid && usuarios[uid].tipo=="suporte")
      ||chamado
        .usuarioId == uid
      || usuarios[req.session.usuarioId].cargo == "admin")
      && filiais.filter(filial=>usuarios[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined
  } catch (e) {
    console.log(e)
    valuidpdate = false
  }
  console.log("Edição é " + (valuidpdate ? "válida" : "inválida"))
  req.session.valid && valuidpdate ? (async () => {
    console.log("Atualizando serviço " + novo_servico.id)
    if (novo_servico.chat) {
      novo_servico.chat.forEach((element) => {delete element.chamadoId;delete element.metadados})
      chamado_atualizado = await prisma.chamado.update({
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
          updatedAt: new Date()
        },
        include: {
          chat: true
        }
      }).catch((e) => console.log("Erro na atualização do chamado.\n", e))
    }
    console.log("Atualizando metadados...")
    for (let {nome, valor} of metadados){
      console.log(`${nome} para ${valor}`)
      if (chamados.find(chamado=>chamado.id==novo_servico.id)[nome])
        await prisma.metadadoChamado.updateMany({
          where: {
            chamadoId: parseInt(novo_servico.id),
            nome
          },
          data: {
            valor
          }
        }).catch((e) => console.log("Erro na atualização dos metadados do chamado. \n", e))
      else {
        console.log(`Criando campo ${nome}...`)
        await prisma.metadadoChamado.create({
          data:{
            nome, valor,
            chamadoId: parseInt(novo_servico.id)
          }
        })
      }
    }
    await updateChamados()
    console.log("Chamado atualizado")
    res.status(200).send(chamado_atualizado)
  })() : res.send("Não autorizado")
});

app.get('/api/:codfilial/servicos', (req, res) => {
  let uid = req.session.usuarioId
  req.session.valid && filiais.filter(filial=>usuarios[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ?
    usuarios[uid]?.cargo == "admin" 
    ? res.send(chamados.filter(c=>filiais.find(f=>f.codigo==req.params.codfilial).id==c.filialId))
    : usuarios[uid]?.tipo == "suporte"
      ? res.send(chamados.filter(c=>filiais.find(f=>f.codigo==req.params.codfilial).id==c.filialId).filter(chamado => chamado.autorId == uid || (chamado.atendenteId || uid) == uid || chamado.usuarioId == uid))
      : res.send(chamados.filter(c=>filiais.find(f=>f.codigo==req.params.codfilial).id==c.filialId).filter(chamado => chamado.autorId == uid || chamado.usuarioId == uid))
  : res.send("Não autorizado")
});

app.get('/api/:codfilial/servicos/:tipo/:filtro', (req, res) => {
  let { tipo, filtro, codfilial } = req.params
  let { valid, usuarioId: uid } = req.session
  valid 
  ? filiais
      .filter(
        filial=>
          usuarios[uid]
          ?.filiais
          .includes(filial.id.toString())
      ).find(f=>f.codigo==codfilial) 
    ? usuarios[uid]?.cargo == "admin" 
      ? res.send(chamados.filter(c=>filiais.find(f=>f.codigo==req.params.codfilial).id==c.filialId).filter(chamado => chamado[tipo] == filtro))
      : usuarios[uid]?.tipo == "suporte"
        ? res.send(chamados.filter(c=>filiais.find(f=>f.codigo==req.params.codfilial).id==c.filialId).filter(chamado => chamado[tipo] == filtro).filter(chamado => chamado.autorId == uid || (chamado.atendenteId || uid) == uid || chamado.usuarioId == uid))
        : res.send(chamados.filter(c=>filiais.find(f=>f.codigo==req.params.codfilial).id==c.filialId).filter(chamado => chamado[tipo] == filtro).filter(chamado => chamado.autorId == uid || chamado.usuarioId == uid))
    : res.send([])
  : res.send("Não autorizado")
});

app.get('/api/:codfilial/servico/:id', (req, res) => {
  let { usuarioId: uid } = req.session
  let chamado = chamados.find(chamado => chamado.id == req.params.id);
  req.session.valid && 
  filiais.filter(filial=>usuarios[uid]?.filiais?.includes(filial.id.toString()))
  .find(f=>f.codigo==req.params.codfilial) && 
  (chamado.autorId == uid || chamado.usuarioId == uid || usuarios[uid].tipo == "suporte") 
  ? res.send(chamado)
  : res.send("Não autorizado")
});

app.post('/api/:codfilial/update/mensagem/:id/arquivo', (req, res) => {
  let filename = (()=>`${Date.now()}-${req.body.title}`)()
  let {usuarioId : uid} = req.session
  let { codfilial, id } = req.params
  id = parseInt(id)
  console.log(Object.keys(req.body), filename)
  req.session.valid && filiais.filter(filial=>usuarios[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ? (
    console.log("Salvando arquivo no serviço"),
    req.body.data ? 
      (console.log("Iniciando a escrita"),
        fs.writeFile(
          path.resolve(`files/`, filename),
          req.body.data.split('base64,')[1],
          'base64',
          (error) => {
            if (error) {
              console.log(error)
              console.log({ error })
              res.send({ error })
              return
            }
            console.log(`Arquivo ${filename} salvo com sucesso`)
            prisma.metadadoMensagem.updateMany({
              where: {
                mensagemId: parseInt(req.params.id),
                nome: "anexo"
              },
              data: {
                valor: filename
              }
            })
              .then(async data => {
                console.log(`${data.count} registro alterado`)
                if (data.count == 0)
                  await prisma.metadadoMensagem.create({
                    data: {
                      nome: "anexo",
                      valor: filename,
                      mensagem: {
                        connect: {
                          id
                        }
                      }
                    }
                  }).then(() => {
                    console.log("Registro raiz criado")
                    res.send()
                    updateChamados()
                  })
                    .catch((e) => { console.log("Erro na criação do registro raiz\n", e); res.status(500).send() })
                else
                  res.send()
                updateChamados()
              })
              .catch(error => {
                console.log(error)
                res.send({ error })
              })
          }
        ))
      : res.send()
  )
    : res.send("Não autorizado")
})

/*
Departamentos and tipos TODO
*/
app.get('/api/:codfilial/departamentos/', (req, res)=>{
  let { usuarioId : uid } = req.session
  req.session.valid && filiais.filter(filial=>usuarios[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ?
    res.send(departamentos.filter(c=>filiais.find(f=>f.codigo==req.params.codfilial).id==c.filialId))
  : res.send("Não autorizado")
})
app.post('/api/:codfilial/departamentos/novo', (req, res) => {
  let { usuarioId : uid } = req.session 
  let { codfilial } = req.params
  req.session.valid 
  && usuarios[uid]?.cargo == 'admin' 
  && filiais
      .filter(
        filial=>
        usuarios[uid]
          ?.filiais
          .includes(filial.id.toString())
      ).find(f=>f.codigo==codfilial) ?
    prisma.departamento.create({
      data: {
        departamento: req.body.newDepartamento,
        filialId: filiais.find(filial=>filial.codigo == codfilial).id
      }
    }).then(()=>{
      console.log(`Departamento ${req.body.newDepartamento} criado com sucesso na filial ${codfilial}`)
      updateDepartamentos()
      res.send("OK")
    })
  : res.send("Não autorizado")
})
app.post('/api/:codfilial/departamentos/editar/:id', (req, res)=>{
  res.send("Não implementado")
})
app.get('/api/:codfilial/departamentos/excluir/:id', (req, res)=>{
  res.send("Não implementado")
})

app.get('/api/:codfilial/tipos', (req, res)=>{
  let { usuarioId : uid } = req.session
  req.session.valid && filiais.filter(filial=>usuarios[uid]?.filiais.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) ?
    res.send(tipos.filter(t=>filiais.find(f=>f.codigo==req.params.codfilial).id==t.filialId))
  : res.send("Não autorizado")
})
app.post('/api/:codfilial/tipos/novo', (req, res) => {
  res.send("Não implementado")
})
app.post('/api/:codfilial/tipos/editar/:id', (req, res)=>{
  res.send("Não implementado")
})
app.get('/api/:codfilial/tipos/excluir/:id', (req, res)=>{
  res.send("Não implementado")
})

/*
Categorias
*/

app.get('/api/:codfilial/servicos/categorias/:tipo', (req, res) => {
  console.log(req.params)
  req.session.valid && filiais.filter(filial=>usuarios[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ?
    res.send(categorias.filter(c=>filiais.find(f=>f.codigo==req.params.codfilial).id==c.filialId).filter(categoria => categoria.tipo == req.params.tipo))
    : res.send("Não autorizado")
});

app.get('/api/:codfilial/servicos/categorias', (req, res) => {
  let {usuarioId : uid} = req.session
  res.send(categorias.filter(c=>filiais.filter(filial=>usuarios[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial)?.id==c.filialId))
});

app.post('/api/:codfilial/servicos/novo/subcategoria/', async (req, res) => {
  let sub = req.body
  let usuario = usuarios[req.session.usuarioId]
  let { usuarioId : uid } = req.session
  req.session.valid && filiais.filter(filial=>usuarios[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ?
    usuario.tipo == "suporte" ?
      prisma.categoria.create({
        data: {
          tipo: sub.tipo,
          categoria: sub.newCategoria,
          filialId:  parseInt(filiais.find(f=>f.codigo==req.params.codfilial).id)
        }
      })
        .then(async (r) => {
          updateCategorias()
          res.status(200).send("OK" + r)
        })
        .catch(error => res.status(505).send({ error })) : res.send("Não autorizado")
    : res.send("Não autorizado")
  updateCategorias()
});

app.post('/api/:codfilial/servicos/editar/subcategoria/:c/:sc', async (req, res) => {
  let sub = req.body
  let usuario = usuarios[req.session.usuarioId]
  let { usuarioId : uid } = req.session
  req.session.valid && usuario && filiais.filter(filial=>usuarios[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ?
    usuario.tipo == "suporte" ?
      prisma.categoria.update({
        where: {
          id: sub.id
        },
        data: {
          tipo: sub.tipo,
          categoria: sub.newCategoria
        }
      })
        .then(async (r) => {
          await updateCategorias()
          res.status(200).send("OK" + JSON.stringify(r))
        })
        .catch(error => { console.log(error); res.status(505).send() }) : res.send("Não autorizado")
    : res.send("Não autorizado")
  updateCategorias()
});

app.post('/api/:codfilial/servicos/excluir/subcategoria/:c/:sc', async (req, res) => {
  let usuario = usuarios[req.session.usuarioId]
  let cat = req.body
  let { usuarioId : uid } = req.session
  req.session.valid && filiais.filter(filial=>usuarios[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ?
    usuario.tipo == "suporte" ?
      prisma.categoria.delete({
        where: {
          id: cat.id,
        }
      })
        .then(async (r) => {
          await updateCategorias();
          res.status(200).send("OK" + r)
        })
        .catch(error => { console.log(error); res.status(505).send() }) : res.send("Não autorizado")
    : res.send("Não autorizado")
});

/*
Usuários
*/

app.get('/api/:codfilial/usuarios/all', (req, res)=>{
  let {valid, usuarioId : uid} = req.session
  valid ? 
    (usuarios[uid]?.tipo=="suporte" || usuarios[uid]?.cargo=="admin") ?
      res.send(usuarios.filter(user=>user&&![3, 7, 11].includes(user.id)))
    : res.send([usuarios[uid]])
  : res.send("Não autorizado")
})

app.post('/api/:codfilial/novo/usuario', (req, res) => {
  req.session.valid && usuarios[req.session.usuarioId].cargo == "admin" ? prisma.usuario.findMany({
    where: {
      email: req.body.email
    }
  }).then(async (usuario) => {
    if (usuario.length !== 0) {
      res.status(302).send("Email já registrado")
      return
    }
    req.body.senha = await bcrypt.hash(req.body.senha, 12)
    return req.body
  }, (err) => { res.status(500).send("Erro acessando o banco de dados") })
    .then(async (data) => {
      let user = await prisma.usuario.create({
        data: {
          email: data.email,
          senha: data.senha,
          nome: data.nome,
          sobrenome: data.sobrenome,
          filialId: parseInt(filiais.find(f=>f.codigo==req.params.codfilial).id),
          metadados: {
            createMany: {
              data: [
                {nome:"dept", valor: data.dept},
                ...data?.acessa_filial?.map(af=>({nome: "acessa_filial", valor: af}))
              ]
            }
          }
        }
      })
      if (data.permissoes.includes("suporte"))
        await prisma.metadadoUsuario.create({
          data: {
            usuarioId: user.id,
            nome: "tipo",
            valor: "suporte"
          }
        })
      if (data.permissoes.includes("admin"))
        await prisma.metadadoUsuario.create({
          data: {
            usuarioId: user.id,
            nome: "cargo",
            valor: "admin"
          }
        })
      res.status(200).send("Usuário criado com sucesso")
      updateUsuarios()
      return
    }, (err) => { res.status(500).send("Erro criando o usuário. \n" + err) })
    : res.send("Não autorizado")
});

app.get('/api/:codfilial/usuario/email/:email', (req, res) => {
  req.session.valid ?
    res.send(usuarios.find(usuario => usuario.email == req.params.email))
    : res.send("Não autorizado")
});

app.get('/api/:codfilial/usuarios/area/:filtro', (req, res) => {
  req.session.valid ?
    res.send(
      usuarios
        .filter(usuario =>
          usuario.area.some(area => area == req.params.filtro)))
    : res.send("Não autorizado")
});

app.get('/api/:codfilial/usuarios/:tipo/:filtro', (req, res) => {
  req.session.valid ?
    res.send(usuarios.filter(usuario => usuario[req.params.tipo] == req.params.filtro))
    : res.send("Não autorizado")
});

app.get('/api/:codfilial/usuario/:id', (req, res) => {
  req.session.valid && typeof (parseInt(req.params.id)) === "number" ?
    res.send(usuarios.find(usuario => usuario?.id == req.params.id))
  : res.send("Não autorizado")
})
/*
perfil e auth
*/
app.get('/api/:codfilial/perfil', async (req, res) => {
  req.session.valid ?
    res.send(usuarios.map(usuario => { 
      delete usuario.senha; 
      usuario.primeiro_acesso = isPrimeiroAcesso(usuario);
      return usuario 
    })[req.session.usuarioId])
    : res.send("Não autorizado")
})

app.post('/api/:codfilial/login', async (req, res) => {
  await prisma.usuario.findMany({
    where: {
      email: req.body.email
    },
    include: {
      metadados: true
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

app.post('/api/:codfilial/alterasenha', async (req, res) => {
  await prisma.usuario.findMany({
    where: {
      email: req.body.email
    },
    include: {
      metadados: true
    }
  }).then(async (usuario) => {
    if (usuario.length === 0) {
      res.send(JSON.stringify({ "status": 404, "error": "Usuário com esse email não encontrado" }))
      return
    }
    req.session.valid = false
    let primeiro_acesso = isPrimeiroAcesso(usuario[0])
    let senha_blank = usuario[0].senha === ""
    if (!primeiro_acesso && !senha_blank) //A comparação só deve ser feita se não for o primeiro acesso e a senha não estiver em branco
      req.session.valid = await bcrypt.compare(req.body.senhaatual, usuario[0].senha)
    else
      req.session.valid = usuario[0].id
    if (req.session.valid) {
      req.session.usuarioId = usuario[0].id
      req.body.senha = await bcrypt.hash(req.body.senha, 12)
      
      usuario[0].metadados.find(md=>md.nome==="primeiro_acesso") 
        ? await prisma.usuario.update({
            where: {
              id: usuario[0].id
            },
            data: {
              senha: req.body.senha,
              metadados: {
                updateMany: {
                  where: {
                    nome: "primeiro_acesso"
                  },
                  data: {
                    valor: "false"
                  }
                }
              }
            }
          })
        : await prisma.usuario.update({
            where: {
              id: usuario[0].id
            },
            data: {
              senha: req.body.senha,
              metadados: {
                create: {
                  nome: "primeiro_acesso",
                  valor: "false"
                }
              }
            }
          })
      await updateUsuarios()
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
})

app.post('/api/:codfilial/logout', async (req, res) => {
  req.session.destroy(
    (err) => { 
      if (!err) { 
        res.status(200).send("Logout com sucesso"); 
        console.log("Logout com sucesso") 
      } else { 
        res.status(500).send("Algum erro ocorreu."); 
        console.log("Algum erro ocorreu.") 
      } 
    }
  )
  //try {
  //  req.session.valid = false
  //  req.session.save()
  //  res.status(200).send("OK")
  //} catch (e) {
  //  console.log("Falha em logout. \n" + e)
  //  res.status(500).send("Error")
  //}
})

/*
misc
*/

app.get('/api/:codfilial/monitoring', (req, res) => {
  let atendentes =
    usuarios
      .filter(usuario => usuario.tipo == "suporte")
      .map(usuario => ({ id: usuario.id, nome: usuario.nome, sobrenome: usuario.sobrenome, perfil: usuario.fotoPerfil }))
  res.send({
    atendentes,
    chamados
  })
})

app.get('/api/:codfilial/atendentes', (req, res) => {
  let atendentes =
    usuarios
      .filter(usuario => usuario.tipo == "suporte")
      .map(usuario => ({ id: usuario.id, nome: usuario.nome, sobrenome: usuario.sobrenome }))
  res.send(atendentes)
})

app.get('/api/:codfilial/files/:filename', (req, res) => {
  let { filename, codfilial } = req.params
  let { valid, usuarioId: uid } = req.session
    valid &&
    filename != 'undefined' &&
    (usuarios[uid]?.cargo == "admin" ||
    chamados.some(chamado => chamado.anexo == filename && (chamado.atendenteId == uid || chamado.autorId == uid|| chamado.usuarioId == uid))) ?
    (() => {
      try {
        fs.readFile(path.resolve('files/', filename), (error, data_raw) => {
          if (error) {
            console.log(error)
            return res.status(500).send()
          }
          let buffer_from_raw = Buffer.from(data_raw)
          fileTypeFromBuffer(buffer_from_raw)
            .then(({mime})=>{
              let url_base64 = `data:${mime};base64,` + buffer_from_raw.toString('base64')
              res.send(url_base64)
            })
            .catch(err=>res.status(500).send(err))
        })
      } catch (e) {
        console.log("Erro na leitura de arquivo. \n", e)
        return res.status(500).send()
      }
    })()
    : res.send("Não autorizado")
})

// React redirect
app.get('*', (req, res) => {
  req.secure 
  ? res.sendFile(path.resolve(__dirname, 'client2/react/dist/index.html'))  
  : res.redirect('https://' + req.headers.host + req.url);
});

//app.listen(port, () => console.log(`Listening on port ${port}`));

const server = https.createServer({key, cert},app)

server.listen(port, ()=>console.log(`Listening on port ${port}`))
//http.createServer(app).listen(port, ()=>console.log(`Listening on port ${port}`))