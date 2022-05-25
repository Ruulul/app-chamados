import express from 'express'
import memory from '../memory.js'

const {
    variables: {
        filiais,
        usuarios,
        departamentos,
        prisma
    },
    updaters: {
        updateDepartamentos
    }
} = memory

const app = express.Router()

app.get('/api/:codfilial/departamentos/', (req, res)=>{
    let { usuarioId : uid } = req.session
    req.session.valid && filiais.get().filter(filial=>usuarios.get()[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ?
      res.send(departamentos.get().filter(c=>filiais.get().find(f=>f.codigo==req.params.codfilial).id==c.filialId))
    : res.send("Não autorizado")
  })
  app.post('/api/:codfilial/departamentos/novo', (req, res) => {
    let { usuarioId : uid } = req.session 
    let { codfilial } = req.params
    let user = usuarios.get()[uid]
    req.session.valid 
    && user?.cargo == 'admin' 
    && filiais.get()
        .filter(
          filial=>
          user
            ?.filiais
            .includes(filial.id.toString())
        ).find(f=>f.codigo==codfilial) ?
      prisma.departamento.create({
        data: {
          departamento: req.body.newDepartamento,
          filialId: filiais.get().find(filial=>filial.codigo == codfilial).id
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
  app.post('/api/:codfilial/departamentos/excluir/:id', (req, res)=>{
    let cat = req.body
    let { usuarioId : uid } = req.session
    let user = usuarios.get()[uid]
    req.session.valid && filiais.get().filter(filial=>user?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ?
      user.tipo == "suporte" ?
        prisma.departamento.delete({
          where: {
            id: cat.id,
          }
        })
          .then(async (r) => {
            await updateDepartamentos();
            res.status(200).send("OK" + r)
          })
          .catch(error => { console.log(error); res.status(505).send() }) : res.send("Não autorizado")
      : res.send("Não autorizado")
  })  

export default app