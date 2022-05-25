import express from 'express'
import bcrypt from 'bcrypt'
import memory from '../memory.js'

let {
    variables: {
        prisma,
        usuarios,
    },
    updaters: {
        updateUsuarios
    }
} = memory

const app = express.Router()

app.get('/api/:codfilial/perfil', async (req, res) => {
  req.session.valid ?
    res.send(usuarios.get().map(usuario => { 
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
  }).then(async (usuarios) => {
    if (usuarios.length === 0) {
      res.send(JSON.stringify({ "status": 404, "error": "Usuário com esse email não encontrado" }))
      return
    }
    let user = usuarios[0]
    req.session.valid = false
    let primeiro_acesso = isPrimeiroAcesso(user)
    let senha_blank = user.senha === ""
    if (!primeiro_acesso && !senha_blank) //A comparação só deve ser feita se não for o primeiro acesso e a senha não estiver em branco
      req.session.valid = await bcrypt.compare(req.body.senhaatual, user.senha)
    else
      req.session.valid = user.id
    if (req.session.valid) {
      req.session.usuarioId = user.id
      req.body.senha = await bcrypt.hash(req.body.senha, 12)
      
      user.metadados.find(md=>md.nome==="primeiro_acesso") 
        ? await prisma.usuario.update({
            where: {
              id: user.id
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
              id: user.id
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
  /*req.session.destroy(
    (err) => { 
      if (!err) { 
        res.status(200).send("Logout com sucesso"); 
        console.log("Logout com sucesso") 
      } else { 
        res.status(500).send("Algum erro ocorreu."); 
        console.log("Algum erro ocorreu.") 
      } 
    }
  )*/
  try {
    req.session.valid = false
    req.session.save()
    res.status(200).send("OK")
  } catch (e) {
    console.log("Falha em logout. \n" + e)
    res.status(500).send("Error")
  }
})

export default app

function isPrimeiroAcesso (usuario) {
    let primeiro_acesso = 
      usuario.metadados 
        ? usuario.metadados.find(md=>md.nome=="primeiro_acesso")?.valor 
        : usuario.primeiro_acesso
    if(primeiro_acesso==undefined||primeiro_acesso==null)
      primeiro_acesso = "true"
    return primeiro_acesso==='true'?true:primeiro_acesso==='false'?false:true
  }
  