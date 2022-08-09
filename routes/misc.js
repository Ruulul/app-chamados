import express from 'express'
import fs from 'fs'
import fs_promises from 'fs/promises'
import path from 'path'
import { fileTypeFromBuffer } from 'file-type'
import memory from '../memory.js'
import { resetAutoIncrement } from './utils.js'

let {
    variables: {
        usuarios,
        chamados,
        metameta,
        metadados,
        prisma
    },
    updaters: {
      updateMetadados
    }
} = memory

const app = express.Router()

app.get('/api/:codfilial/monitoring', (req, res) => {
    let atendentes =
      usuarios.get()
        .filter(usuario => usuario?.tipo == "suporte")
        .map(usuario => ({ id: usuario.id, nome: usuario.nome, sobrenome: usuario.sobrenome, perfil: usuario.fotoPerfil }))
    res.send({
      atendentes,
      chamados: chamados.get()
    })
  })
  
app.get('/api/:codfilial/atendentes', (req, res) => {
  let atendentes =
    usuarios.get()
      .filter(usuario => usuario?.tipo == "suporte")
      .map(usuario => ({ id: usuario.id, nome: usuario.nome, sobrenome: usuario.sobrenome }))
  res.send(atendentes)
})
  
app.get('/api/:codfilial/files/:filename', (req, res) => {
  let { filename, codfilial } = req.params
  let { valid, usuarioId: uid } = req.session
  let usuario = usuarios.get()[uid]
  const hasUser = (chamado, uid) => [chamado?.atendenteId, chamado?.autorId, chamado?.usuarioId].includes(uid)
    valid &&
    filename != 'undefined' &&
    (usuario?.cargo == "admin" ||
    usuario?.tipo == "suporte" ||
    filename.match(/ProfileIcon$/)||
    chamados.get().some(chamado => chamado.anexo == filename && hasUser(chamado, uid))||
    chamados.get().reduce((pv, cv)=>[...pv, ...cv.chat], [])
    .some(mensagem=>mensagem.metadados.find(({nome})=>nome==='anexo')?.valor===filename 
    && hasUser(chamados.get().find(chamado=>chamado.id===mensagem.chamadoId), uid))
    ) ?
    (() => {
      try {
        fs.readFile(path.resolve('files/', filename), (error, data_raw) => {
          if (error) {
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
        console.log("Erro na leitura de arquivo. \n")
        return res.status(500).send()
      }
    })()
    : res.send("Não autorizado")
})

app.get('/api/:codfilial/:model/:tag/:id/:campo', async (req, res) => {
  let { model, tag, id, campo } = req.params;
  id = parseInt(id)
  console.error(req.params)
  let request_field = metadados.get().find(md=>md.campo===campo&&md.model===model&&md.idModel===id);
  if (!request_field) return res.sendStatus(400);
  let fields_meta = metameta.get().campos[model][tag];
  let field_meta = fields_meta.find(field=>field.campoMeta==campo);
  console.error(field_meta)
  switch (field_meta.tipo) {
    case 'number':
    case 'email':
    case 'string':
    case 'boolean':
      res.send(request_field.valor);
      break;
    case 'anexo':
      try {
        let files = []
        for (let file of metadados.get().filter(metadado=>metadado.campo===campo&&metadado.model===model&&metadado.idModel===id).map(anexo=>anexo.valor)) {
          let data_raw = await fs_promises.readFile(path.resolve('files/', file))
          let buffer_from_raw = Buffer.from(data_raw)
          let mime = await fileTypeFromBuffer(buffer_from_raw)
          let url_base64 = `data:${mime};base64,` + buffer_from_raw.toString('base64')
          files.push(url_base64)
        }
        res.send(files)
      } catch (e) {
        console.log("Erro na leitura de arquivo. \n", e)
        return res.sendStatus(500);
      }
      break;
    default:
      console.error("Unexpected type:", field_meta);
      res.sendStatus(500)
  }
})

app.post('/api/:codfilial/:model/:tag/:idModel/:campo', async (req, res) => {
  let { model, tag, idModel, campo } = req.params;
  idModel = parseInt(idModel)
  let fields_meta = metameta.get().campos[model][tag];
  if (!fields_meta) return res.sendStatus(400)
  let field_meta = fields_meta.find(field=>field.campoMeta==campo);
  if (!field_meta) return res.sendStatus(400)
  let requested_field = metadados.get()
    .find(metadado=>
      metadado.model===model&&
      metadado.campo===campo&&
      metadado.idModel===idModel
    )
  if (requested_field && field_meta.tipo !== 'anexo') return res.sendStatus(403)
  switch (field_meta.tipo) {
    case 'email':
    case 'number':
    case 'string':
    case 'boolean':
      let tipo = field_meta.tipo === 'email' ? 'string' : field_meta.tipo;
      try {
        let valor = JSON.parse(req.body)
        if (typeof valor !== tipo) return res.sendStatus(400)
        await prisma.metadado.create({
          data: {
            campo,
            model,
            valor,
            idModel
          }
        })
        await updateMetadados()
        res.sendStatus(200)
      } catch (e) {
        console.error("Bady body: ", req.body)
        console.error("on", req.path)
        return res.sendStatus(400)
      }
      break;
    /**
     * o anexo vem no body no formato {title, data, descr}, embora não estejamos usando a descrição ainda
     */
    case "anexo":
      if (!('title' in req.body && 'data' in req.body && req.body.data.includes('base64,'))) return res.sendStatus(400)
      let valor = Date.now() + req.body.title;
      try {
        fs.writeFile(
          path.resolve('files/', valor), 
          req.body.data.split('base64,')[1],
          'base64',
          async e=>{
            if (e) {
              console.error(e)
              return res.sendStatus(500)
            }         
            await prisma.metadado.create({
              data: {
                campo,
                model,
                valor,
                idModel
              }
            })
            await updateMetadados()
            res.sendStatus(200)
          })
      } catch (e) {
        console.error("Unexpected type:", field_meta);
        res.sendStatus(400);
      }
  }
})

app.put('/api/:codfilial/:model/:tag/:idModel/:campo/:id', async (req, res) => {
  let { model, tag, idModel, campo, id } = req.params;
  id = parseInt(id)
  idModel = parseInt(idModel)
  let fields_meta = metameta.get().campos[model][tag];
  if (!fields_meta) return res.sendStatus(400)
  let field_meta = fields_meta.find(field=>field.campoMeta==campo);
  if (!field_meta) return res.sendStatus(400)
  let requested_field = metadados.get()
    .find(metadado=>
      metadado.model===model&&
      metadado.campo===campo&&
      metadado.idModel===idModel&&
      metadado.id===id
    )
  if (!requested_field) return res.sendStatus(403)
  switch (field_meta.tipo) {
    case 'email':
    case 'number':
    case 'string':
    case 'boolean':
      let tipo = field_meta.tipo === 'email' ? 'string' : field_meta.tipo;
      try {
        let valor = JSON.parse(req.body);
        if (typeof valor !== tipo) return res.sendStatus(400);
        await prisma.metadado.update({where: {id}, data: {valor}});
        await updateMetadados();
        res.sendStatus(200);
      } catch (e) {
        console.error("Bady body: ", req.body);
        console.error("on", req.path);
        return res.sendStatus(400);
      }
      break;
    /**
     * só substituir o arquivo é uma operação a menos.
     * Isso possui a desvantagem de não podermos manter de quando é o último arquivo, algo que pode ser relevante.
     */
    case "anexo":
      if (!('data' in req.body && req.body.data.includes('base64,'))) return res.sendStatus(400)
      try {
        fs.writeFile(
          path.resolve('files/', requested_field.valor), 
          req.body.data.split('base64,')[1],
          'base64',
          async e=>{
            if (e) {
              console.error(e)
              return res.sendStatus(500)
            }
            res.sendStatus(200)
          })
      } catch (e) {
        console.error("Unexpected type:", field_meta);
        res.sendStatus(400);
      }
  }
})
app.delete('/api/:codfilial/:model/:tag/:idModel/:campo/:id', async (req, res) => {
  let { model, tag, idModel, campo, id } = req.params;
  id = parseInt(id)
  idModel = parseInt(idModel)
  let fields_meta = metameta.get().campos[model][tag];
  if (!fields_meta) return res.sendStatus(400)
  let field_meta = fields_meta.find(field=>field.campoMeta==campo);
  if (!field_meta) return res.sendStatus(400)
  let requested_field = metadados.get()
    .find(metadado=>
      metadado.model===model&&
      metadado.campo===campo&&
      metadado.idModel===idModel&&
      metadado.id===id
    )
  if (!requested_field) return res.sendStatus(403)
  if (field_meta.tipo !== 'anexo') return res.sendStatus(403)
  try {
    await Promise.all([
      fs_promises.unlink(path.resolve('files/', requested_field.valor)),
      prisma.metadado.delete({where:{id}})
        .then(()=>Promise.all([
          resetAutoIncrement('metadado', prisma),
          updateMetadados()
        ]))
    ])
    res.sendStatus(200)
  } catch (e) {
    console.error(e)
    res.sendStatus(500)
  }
})
  
export default app