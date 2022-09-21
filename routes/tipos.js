import express from 'express'

import memory from '../memory.js'
let {
    variables: {
        usuarios,
        filiais,
        tipos,
        prisma,
    },
} = memory

const app = express.Router()

app.get('/api/:codfilial/tipos', (req, res)=>{
    let { usuarioId : uid } = req.session
    req.session.valid && filiais.get().filter(filial=>usuarios.get()[uid]?.filiais.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) ?
      res.send(tipos.get().filter(t=>filiais.get().find(f=>f.codigo==req.params.codfilial).id==t.filialId))
    : res.send("Não autorizado")
  })
  app.post('/api/:codfilial/tipos/', async (req, res) => {
    let user = usuarios.get()[req.session.usuarioId]
    console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) está tentando criar um tipo: ${JSON.stringify(req.body)}`)
    if (!req.session.valid) return res.send("Não autorizado")
    await prisma.tipo.create({
      data: {
        tipo: body.tipo,
        filialId: filiais.get().find(f=>f.codigo===req.params.codfilial).id,
      }
    })
    console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) criou com sucesso o tipo ${JSON.stringify(body.tipo)}`)
    res.sendStatus(200);
  })
  app.put('/api/:codfilial/tipos/:id', async (req, res)=>{
    if (!req.session.valid) return res.send("Não autorizado")
    let user = usuarios.get()[req.session.usuarioId]
    console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) está tentando editar o tipo ${tipos.get().find(t=>t.id===parseInt(req.params.id)).tipo} (${req.params.id})`)
    await prisma.tipo.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        tipo: req.body.tipo,
      }
    })
    console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) editou com sucesso o tipo ${req.params.id} para ${req.body.tipo}`)
    res.sendStatus(200)
  })
  app.delete('/api/:codfilial/tipos/:id', async (req, res)=>{
    let user = usuarios.get()[req.session.usuarioId]
    console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) está tentando deletar o tipo ${req.params.id}`)
    if (!req.session.valid) return res.send("Não autorizado")
    await prisma.tipo.delete({
      where: parseInt(req.params.id)
    })
    console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) deletou com sucesso o tipo ${req.params.id}`)
    res.sendStatus(200)
  })
  
export default app