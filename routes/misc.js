import express from 'express'
import fs from 'fs'
import { fileTypeFromBuffer } from 'file-type'
import memory from '../memory.js'

let {
    variables: {
        usuarios,
        chamados
    }
} = memory

const app = express.Router()

app.get('/api/:codfilial/monitoring', (req, res) => {
    let atendentes =
      usuarios.get()
        .filter(usuario => usuario.tipo == "suporte")
        .map(usuario => ({ id: usuario.id, nome: usuario.nome, sobrenome: usuario.sobrenome, perfil: usuario.fotoPerfil }))
    res.send({
      atendentes,
      chamados: chamados.get()
    })
  })
  
  app.get('/api/:codfilial/atendentes', (req, res) => {
    let atendentes =
      usuarios.get()
        .filter(usuario => usuario.tipo == "suporte")
        .map(usuario => ({ id: usuario.id, nome: usuario.nome, sobrenome: usuario.sobrenome }))
    res.send(atendentes)
  })
  
  app.get('/api/:codfilial/files/:filename', (req, res) => {
    let { filename, codfilial } = req.params
    let { valid, usuarioId: uid } = req.session
      valid &&
      filename != 'undefined' &&
      (usuarios.get()[uid]?.cargo == "admin" ||
      chamados.get().some(chamado => chamado.anexo == filename && (chamado.atendenteId == uid || chamado.autorId == uid|| chamado.usuarioId == uid))) ?
      (() => {
        try {
          fs.readFile(path.resolve('files/', filename), (error, data_raw) => {
            if (error) {
              console.log(error)
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
          console.log("Erro na leitura de arquivo. \n", e)
          return res.status(500).send()
        }
      })()
      : res.send("Não autorizado")
  })
  
export default app