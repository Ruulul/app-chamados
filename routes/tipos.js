import express from 'express'

import memory from '../memory.js'
let {
    variables: {
        usuarios,
        filiais,
        tipos
    }
} = memory

const app = express.Router()

app.get('/api/:codfilial/tipos', (req, res)=>{
    let { usuarioId : uid } = req.session
    req.session.valid && filiais.get().filter(filial=>usuarios.get()[uid]?.filiais.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) ?
      res.send(tipos.get().filter(t=>filiais.get().find(f=>f.codigo==req.params.codfilial).id==t.filialId))
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
  
export default app