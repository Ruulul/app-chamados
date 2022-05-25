import express from 'express'
import bcrypt from 'bcrypt'
import memory from '../memory.js'
let {
    variables: {
        filiais,
        usuarios,
        prisma
    },
    updaters: {
        updateUsuarios
    }
} = memory

const app = express.Router()

app.get('/api/:codfilial/usuarios/all', (req, res)=>{
    let {valid, usuarioId : uid} = req.session
    let user = usuarios.get()[uid]
    valid ? 
      (user?.tipo=="suporte" || user?.cargo=="admin") ?
        res.send(
          usuarios.get()
          .filter(user=>
              user&&
              user.filialId
              ==filiais.get()
              .find(filial=>
                filial.codigo===req.params.codfilial
              )?.id&&
              ![3, 7, 11].includes(user.id)
          )
        )
      : res.send([user])
    : res.send("Não autorizado")
  })
  
  app.post('/api/:codfilial/novo/usuario', (req, res) => {
    req.session.valid && usuarios.get()[req.session.usuarioId].cargo == "admin" ? prisma.usuario.findMany({
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
            filialId: parseInt(filiais.get().find(f=>f.codigo==req.params.codfilial).id),
            metadados: {
              createMany: {
                data: [
                  {nome:"dept", valor: data.dept},
                  {nome: "primeiro_acesso", valor: "true"},
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
      res.send(usuarios.get().find(usuario => usuario.email == req.params.email))
      : res.send("Não autorizado")
  });
  
  app.get('/api/:codfilial/usuarios/area/:filtro', (req, res) => {
    req.session.valid ?
      res.send(
        usuarios.get()
          .filter(usuario =>
            usuario.area.some(area => area == req.params.filtro)))
      : res.send("Não autorizado")
  });
  
  app.get('/api/:codfilial/usuarios/:tipo/:filtro', (req, res) => {
    req.session.valid ?
      res.send(usuarios.get().filter(usuario => usuario[req.params.tipo] == req.params.filtro))
      : res.send("Não autorizado")
  });
  
  app.get('/api/:codfilial/usuario/:id', (req, res) => {
    req.session.valid && typeof (parseInt(req.params.id)) === "number" ?
      res.send(usuarios.get().find(usuario => usuario?.id == req.params.id))
    : res.send("Não autorizado")
  })
export default app

