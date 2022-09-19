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
    if (!req.session.valid) return res.send("Não autorizado")
    await prisma.tipo.create({
      data: {
        tipo: body.tipo,
        filialId: filiais.get().find(f=>f.codigo===req.params.codfilial).id,
      }
    })
    res.sendStatus(200);
  })
  app.put('/api/:codfilial/tipos/:id', async (req, res)=>{
    if (!req.session.valid) return res.send("Não autorizado")
    await prisma.tipo.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        tipo: body.tipo,
      }
    })
  })
  app.delete('/api/:codfilial/tipos/:id', async (req, res)=>{
    if (!req.session.valid) return res.send("Não autorizado")
    await prisma.tipo.delete({
      where: parseInt(req.params.id)
    })
  })
  
export default app