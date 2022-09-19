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

app.get('/api/:codfilial/:model/:tag/:idModel/campo/:campo', async (req, res) => {
  let campo = await getCampo(req.params)
  if (campo instanceof Error) return res.sendStatus(400)
  res.send(campo)
})

app.post('/api/:codfilial/:model/:tag/:idModel/campo/:campo', async (req, res) => {
  if ((await postCampo(req.params, req.body)) instanceof Error) return res.sendStatus(400)
  res.sendStatus(200)
})

app.put('/api/:codfilial/:model/:tag/:idModel/campo/:campo/:id', async (req, res) => {
  if ((await putCampo(req.params)) instanceof Error) return res.sendStatus(400)
  res.sendStatus(200)
})
app.delete('/api/:codfilial/:model/:tag/:idModel/campo/:campo/:id', async (req, res) => {
  if ((await deleteCampo(req.params)) instanceof Error) return res.sendStatus(400)
  res.sendStatus(200)
})

export async function getCampo({model, tag, idModel, campo}) {
  idModel = parseInt(idModel)
  let request_field = metadados.get().find(md=>md.campo===campo&&md.model===model&&md.idModel===idModel);
  if (!request_field) return new Error("Sem campo requisitado")
  let fields_meta = metameta.get().campos[model][tag];
  let field_meta = fields_meta.find(field=>field.campoMeta==campo);
  switch (field_meta.tipo) {
    case 'number':
    case 'email':
    case 'string':
    case 'boolean':
      return request_field;
    case 'anexo':
      try {
        let files = []
        for (let file of metadados.get().filter(metadado=>metadado.campo===campo&&metadado.model===model&&metadado.idModel===idModel)) {
          let data_raw = await fs_promises.readFile(path.resolve('files/', file.valor))
          let buffer_from_raw = Buffer.from(data_raw)
          let { mime } = await fileTypeFromBuffer(buffer_from_raw)
          let url_base64 = `data:${mime};base64,` + buffer_from_raw.toString('base64')
          files.push({ id: file.id, title: file.valor, data: url_base64 })
        }
        return files
      } catch (e) {
        console.log("Erro na leitura de arquivo. \n", e)
        return e;
      }
    default:
      return new Error("Unexpected type:" + field_meta);
  }

}
export async function postCampo({model, tag, idModel, campo}, body) {
  idModel = parseInt(idModel)
  let fields_meta
  try {
    fields_meta = metameta.get().campos[model][tag];
    if (!fields_meta) {
      return new Error(`Sem metacampos ${model}.${tag}`)
    }
  } catch (e) {
    return new Error(`Erro na obtenção do metacampo ${model}.${tag}`)
  }
  let field_meta = fields_meta.find(field=>field.campoMeta==campo);
  if (!field_meta) {
    return new Error(`Sem metacampo em ${model}.${tag}.${campo} \n${fields_meta}`)
  }
  let requested_field = metadados.get()
    .find(metadado=>
      metadado.model===model&&
      metadado.campo===campo&&
      metadado.idModel===idModel
    )
  if (requested_field && field_meta.tipo !== 'anexo') {
    return new Error(`Espaço já preenchido: ${requested_field}`)
  }
  switch (field_meta.tipo) {
    case 'email':
    case 'number':
    case 'string':
    case 'boolean':
      let tipo = field_meta.tipo === 'email' ? 'string' : field_meta.tipo;
      try {
        let valor = JSON.parse(body)
        if (typeof valor !== tipo) return new Error("Tipo inválido")
        await prisma.metadado.create({
          data: {
            campo,
            model,
            valor,
            idModel
          }
        })
        await updateMetadados()
        console.error(campo, "salvo com sucesso como", valor, "para", model, tag, idModel)
        return
      } catch (e) {
        console.error("Bady body: ", body)
        return e
      }
      break;
    /**
     * o anexo vem no body no formato {title, data, descr}, embora não estejamos usando a descrição ainda
     */
    case "anexo":
      if (!('title' in body && 'data' in body && body.data.includes('base64,'))) return new Error("Campos insuficientes para anexar")
      let valor = Date.now() + '-' + body.title;
      try {
        fs.writeFile(
          path.resolve('files/', valor), 
          body.data.split('base64,')[1],
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
            console.error("anexo salvo com sucesso como", valor, "para", model, tag, idModel)
            return
          })
      } catch (e) {
        console.error("Unexpected type:", field_meta);
        return e
      }
  }
}
export async function putCampo({model, tag, idModel, campo, id}, body) {
  id = parseInt(id)
  idModel = parseInt(idModel)
  let fields_meta = metameta.get().campos[model][tag];
  if (!fields_meta) return new Error("sem meta informação do modelo")
  let field_meta = fields_meta.find(field=>field.campoMeta==campo);
  if (!field_meta) return new Error("sem meta informação do campo")
  let requested_field = metadados.get()
    .find(metadado=>
      metadado.model===model&&
      metadado.campo===campo&&
      metadado.idModel===idModel&&
      metadado.id===id
    )
  if (!requested_field) return new Error("Sem campo a editar")
  switch (field_meta.tipo) {
    case 'email':
    case 'number':
    case 'string':
    case 'boolean':
      let tipo = field_meta.tipo === 'email' ? 'string' : field_meta.tipo;
      try {
        let valor = JSON.parse(body);
        if (typeof valor !== tipo) return new Error("Campo deve ser do tipo adequado")
        await prisma.metadado.update({where: {id}, data: {valor}});
        await updateMetadados();
        return
      } catch (e) {
        console.error("Bady body: ", body);
        return e
      }
    /**
     * só substituir o arquivo é uma operação a menos.
     * Isso possui a desvantagem de não podermos manter de quando é o último arquivo, algo que pode ser relevante.
     */
    case "anexo":
      if (!('data' in body && body.data.includes('base64,'))) return new Error("Campo deve ser do tipo adequado")
      try {
        fs.writeFile(
          path.resolve('files/', requested_field.valor), 
          body.data.split('base64,')[1],
          'base64',
          async e=>{
            if (e) {
              console.error(e)
              return e
            }
            return
          })
      } catch (e) {
        console.error("Unexpected type:", field_meta);
        return e
      }
  }
}
export async function deleteCampo({model, tag, idModel, campo, id}) {
  id = parseInt(id)
  idModel = parseInt(idModel)
  let fields_meta = metameta.get().campos[model][tag];
  if (!fields_meta) return new Error("Sem meta info do modelo")
  let field_meta = fields_meta.find(field=>field.campoMeta==campo);
  if (!field_meta) return new Error("Sem meta info do campo")
  let requested_field = metadados.get()
    .find(metadado=>
      metadado.model===model&&
      metadado.campo===campo&&
      metadado.idModel===idModel&&
      metadado.id===id
    )
  if (!requested_field) return new Error("Sem campo de mensagem")
  //if (field_meta.tipo !== 'anexo') return new Error("Apenas campos múltiplos podem ser deletados")
  switch (field_meta.tipo) {
    case 'anexo':
      try {
        await Promise.all([
          fs_promises.unlink(path.resolve('files/', requested_field.valor)),
          prisma.metadado.delete({where:{id}})
            .then(()=>Promise.all([
              resetAutoIncrement('metadado', prisma),
              updateMetadados()
            ]))
        ])
        return
      } catch (e) {
        return e
      }
    default:
      await prisma.metadado.delete({where:{id}})
      updateMetadados();
  }
}
  
export default app