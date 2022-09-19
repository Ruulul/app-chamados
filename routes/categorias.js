import express from 'express'

import memory from '../memory.js'
let {
    variables: {
        filiais,
        usuarios,
        categorias,
        prisma
    },
    updaters: {
        updateCategorias
    }
} = memory

const app = express.Router()

app.get('/api/:codfilial/categorias/:tipo/', (req, res) => {
    console.log(req.params)
    req.session.valid && filiais.get().filter(filial=>usuarios.get()[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ?
      res.send(categorias.get().filter(c=>filiais.get().find(f=>f.codigo==req.params.codfilial).id==c.filialId && c.tipo == req.params.tipo))
      : res.send("Não autorizado")
  });
  
app.get('/api/:codfilial/categorias/', (req, res) => {
  let {usuarioId : uid} = req.session
  res.send(categorias.get().filter(c=>filiais.get().filter(filial=>usuarios.get()[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial)?.id==c.filialId))
});
  
app.post('/api/:codfilial/categorias/', async (req, res) => {
  let sub = req.body
  let { usuarioId : uid } = req.session
  let user = usuarios.get()[uid]
  req.session.valid && filiais.get().filter(filial=>user?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined
    user.tipo == "suporte" && sub.tipo && sub.newCategoria ?
      prisma.categoria.create({
        data: {
          tipo: sub.tipo,
          categoria: sub.categoria,
          filialId:  parseInt(filiais.get().find(f=>f.codigo==req.params.codfilial).id)
        }
      })
        .then(async (r) => {
          updateCategorias()
          res.status(200).send("OK" + r)
        })
        .catch(error => res.status(505).send({ error }))
    : res.send("Não autorizado")
  updateCategorias()
});
  
  app.put('/api/:codfilial/categorias/:id', async (req, res) => {
    let sub = req.body
    let { usuarioId : uid } = req.session
    let user = usuarios.get()[uid]
    req.session.valid && user && filiais.get().filter(filial=>user?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ?
      user.tipo == "suporte" ?
        prisma.categoria.update({
          where: {
            id: sub.id
          },
          data: {
            tipo: sub.tipo,
            categoria: sub.categoria
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
  
  app.delete('/api/:codfilial/categorias/:id', async (req, res) => {
    let cat = req.body
    let { usuarioId : uid } = req.session
    let user = usuarios.get()[uid]
    req.session.valid && filiais.get().filter(filial=>user?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ?
      user.tipo == "suporte" ?
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
  
export default app