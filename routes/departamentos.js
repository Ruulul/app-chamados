import express from 'express'
import memory from '../memory.js'

const {
    variables: {
        filiais,
        usuarios,
        departamentos,
        prisma,
        metadados,
    },
    updaters: {
        updateDepartamentos
    }
} = memory

const app = express.Router()

app.get('/api/:codfilial/departamentos/:id', (req, res)=>{
  let dept = departamentos.get().find(dept=>dept.id===parseInt(req.params.id))
  if (!dept) return res.sendStatus(400)
  dept.campos = Object.fromEntries(metadados.get().filter(data=>data.model==='departamento'&&data.idModel===dept.id).map(data=>[data.campo, data.valor]))
  res.send(dept)
})

app.get('/api/:codfilial/departamentos/', (req, res)=>{
    let { usuarioId : uid } = req.session
    req.session.valid && filiais.get().filter(filial=>usuarios.get()[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ?
      res.send(departamentos.get().filter(c=>filiais.get().find(f=>f.codigo==req.params.codfilial).id==c.filialId))
    : res.send("Não autorizado")
  })
  app.post('/api/:codfilial/departamentos/', (req, res) => {
    let { usuarioId : uid } = req.session 
    let { codfilial } = req.params
    let user = usuarios.get()[uid]

    console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) está tentando criar um departamento`)
    
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
        //console.log(`Departamento ${req.body.newDepartamento} criado com sucesso na filial ${codfilial}`)
        console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) está criou o departamento ${req.body.newDepartamento} com sucesso`)
        updateDepartamentos()
        res.send("OK")
      })
    : res.send("Não autorizado")
  })
  app.put('/api/:codfilial/departamentos/:id', (req, res)=>{
    res.send("Não implementado")
  })
  app.delete('/api/:codfilial/departamentos/:id', (req, res)=>{
    let id = parseInt(req.params.id)
    let { usuarioId : uid } = req.session
    let user = usuarios.get()[uid]

    console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) está tentando deletar o departamento ${id}`)
    
    req.session.valid && filiais.get().filter(filial=>user?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ?
      user.tipo == "suporte" ?
        prisma.departamento.delete({ where: { id } })
          .then(async (r) => {
            await updateDepartamentos();
            console.log(`${Date.now()} (${Date()}) - User ${user.nome} (id ${req.session.usuarioId}) deletou com sucesso o departamento ${id}`)
            res.status(200).send("OK" + r)
          })
          .catch(error => res.sendStatus(505)) : res.send("Não autorizado") //console.log(error); res.status(505).send() }) : res.send("Não autorizado")
      : res.send("Não autorizado")
  })  

export default app