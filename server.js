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
const { ObjectFlags } = require('typescript');
const { transformDocument } = require('@prisma/client/runtime');
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
  (servico.chat[servico.chat.length] = {autorId: 3, mensagem: "Seu chamado será atendido dentro de " + ["uma semana", "3 dias", "um dia", "algumas horas"][servico.prioridade - 1]}),
  (await prisma.chamado.create({data: {
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
        atendimento: String(false)}).map((metadado)=>{return {"nome": metadado[0], "valor": String(metadado[1])}})        
      }
    }
  }})),

  res.status(200).send(req.body)) : res.send("Não autorizado")
});

app.post('/api/update/servico/:id', async (req, res) => {
  let novo_servico = req.body
  let metadados =  Object.entries({
    assunto: novo_servico.assunto,
    departamento: novo_servico.departamento,
    status: novo_servico.status,
    prioridade: novo_servico.prioridade,
    atendimento: (novo_servico.chat ? (novo_servico.chat.length > 1 ? true : false) : undefined),
    tipo: novo_servico.tipo,
    atendenteId: novo_servico.atendenteId
    }).map((metadado)=>{return {"nome": metadado[0], "valor": String(metadado[1])}});
  let validUpdate = await prisma.metadadoChamado.findFirst(
    {where:{
      chamadoId: novo_servico.id,
      nome: "atendenteId"
    }
  }).then(async (valor)=>{
    console.log(valor)
    let usuario = await prisma.usuario.findUnique({where:{id: req.session.usuarioId},select:{id:true, metadados:true}})
    let metadados = Object.fromEntries(usuario.metadados.map((metadado)=>[metadado.nome, metadado.valor]))
    if (valor.valor == usuario.id || metadados.cargo == "admin")
      return true;
    else return false;
  })
  console.log("Edição é " + (validUpdate ? "válida" : "inválida"))
  req.session.valid && validUpdate ? ( async ()=>{
  console.log("Atualizando serviço")
  if (novo_servico.chat) {
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
    }
  })
  }
  for (let metadado of metadados) 
    await prisma.metadadoChamado.updateMany({
      where:{
        chamadoId: parseInt(req.params.id),
        nome: metadado.nome
      },
      data: {
        valor: metadado.valor
      }
    })
  res.status(200).send(req.body)})()  : res.send("Não autorizado")
});

app.get('/api/servicos', async(req, res) => {
  req.session.valid ? 
    prisma.chamado
      .findMany()
        .then(async (data)=>{
            let Metas = [];
            for (const [index, chamado] of data.entries())
              await prisma.metadadoChamado.findMany({where:{chamado}})
              .then(
                (mds)=>{
                  Metas[index] = 
                  Object.fromEntries(
                    mds.map(
                      (md)=>{
                        return [md.nome, md.valor]
                      }
                    )
                  )
                }
              )
            res.send(data.map((chamado, index)=>{return {...chamado, ...Metas[index]}}))
          }
        ).catch("Ocorreu um erro no banco de dados")
  : res.send("Não autorizado") });

app.get('/api/servicos/:tipo/:filtro', async (req, res) => {
  req.session.valid ? 
  prisma.chamado.findMany(
    {
      where:{
        metadados: {
          some: { 
            nome: req.params.tipo,
            valor: req.params.filtro
          },
        }
      }
    }
  )
  .then(
    async (data)=>{
      let Metas = [];
      for (const [index, chamado] of data.entries())
        await prisma.metadadoChamado.findMany({where:{chamado}})
        .then(
          (mds)=>{
            Metas[index] = 
            Object.fromEntries(
              mds.map(
                (md)=>{
                  return [md.nome, md.valor]
                }
              )
            )
          }
        )
      res.send(
        data.map(
          (chamado, index)=>{
            return {...chamado, ...Metas[index]}
          }
        )
      )
    }
  ) 
  : res.send("Não autorizado")
});

app.get('/api/usuarios/:tipo/:filtro', async (req, res) => {
  req.session.valid ? 
  prisma.usuario.findMany(
    {
      where:{
        metadados: {
          some: { 
            nome: req.params.tipo,
            valor: req.params.filtro
          },
        }
      },
      select: {
        id: true,
        nome: true,
        sobrenome: true,
        senha: false,
        email: false,
      }
    }
  )
  .then(
    async (data)=>{
      let Metas = [];
      for (const [index, usuario] of data.entries())
        await prisma.metadadoUsuario.findMany({where:{usuario}})
        .then(
          (mds)=>{
            Metas[index] = 
            Object.fromEntries(
              mds.filter((md)=>md.nome!=="area").map(
                (md)=>{
                  return [md.nome, md.valor]
                }
              )
            )
            Metas[index].area = mds.filter((md)=>md.nome==="area").map(md=>md.valor)
          }
        )
      res.send(
        data.map(
          (usuario, index)=>{
            return {...usuario, ...Metas[index]}
          }
        )
      )
    }
  ) 
  : res.send("Não autorizado")
});

app.get('/api/servico/:id', async (req, res)=> {
  req.session.valid ? prisma.chamado.findUnique({
    where: {
      id: parseInt(req.params.id)
    }
  }).then(
    async (chamado)=>{
      let meta = Object.fromEntries((await prisma.metadadoChamado.findMany({where: {chamado}})).map((md)=>{return [md.nome, md.valor]}))
      chamado.chat = 
        await prisma.mensagem
          .findMany({
              where: {
                chamadoId: parseInt(req.params.id)
              }
            }
          )
      chamado = {...chamado, ...meta}
      res.send(chamado)})
  .catch((e)=>res.status(500).send({erro: "Falha em encontrar serviço " + req.params.id + `\n${e}`}))
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
    },
    select: {
      id: true,
      nome: true,
      sobrenome: true,
      senha: false,
      email: false,
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
  req.session.valid ? await prisma.usuario.findUnique({where:{id: req.session.usuarioId}})
    .then(usuario=>{
      delete usuario.senha
      res.send(usuario)
    })
    .catch(err=>{
      res.send("Não autorizado")
    }) : res.send("Não autorizado")
})

app.post('/api/login', async (req, res) => {
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
    req.session.save((e)=>{res.send(JSON.stringify({"status": 200, "error": e}))})
  }).catch((err)=>{
    console.log(err)
    res.send(JSON.stringify({"status": 500, "error": "Erro no login"}))
    return false
  })
})

app.post('/api/alterasenha', async (req, res) => {
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
    req.session.valid = await bcrypt.compare(req.body.senhaatual, usuario[0].senha)
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
      res.send(JSON.stringify({"status": 404, "error": "Senha incorreta"}))
      return
    }
    req.session.save((e)=>{res.send(JSON.stringify({"status": 200, "error": e}))})
  }).catch((err)=>{
    console.log(err)
    res.send(JSON.stringify({"status": 500, "error": "Erro no login"}))
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