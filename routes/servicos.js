import express from 'express'
import fs from 'fs'
import path from 'path'
import memory from '../memory.js'

const {
    variables: {
        chamados,
        filiais,
        usuarios,
        prisma
    },
    updaters: {
        updateChamados
    }
} = memory

const app = express.Router()

app.post('/api/:codfilial/novo/servico', async (req, res) => {
    let servico = req.body
    let autorId = servico.autorId
    let { usuarioId : uid } = req.session
    let { codfilial } = req.params
    req.session.valid && filiais.get().filter(filial=>usuarios.get()[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==codfilial) ?
      (console.log("Salvando novo serviço"),
        servico.chat[servico.chat.length] = { autorId: 3, mensagem: "Seu chamado será atendido dentro de " + ["uma semana", "3 dias", "um dia", "algumas horas"][servico.prioridade - 1] },
  
        await prisma.chamado.create({
          data: {
            autorId,
            chat: {
              create: servico.chat
            },
            assunto: servico.assunto,
            prazo: servico.prazo,
            filialId: parseInt(filiais.get().find(f=>f.codigo==req.params.codfilial).id),
            metadados: {
              createMany: {
                data: Object.entries({
                  departamento: servico.departamento,
                  status: servico.status,
                  prioridade: servico.prioridade,
                  tipo: servico.tipo,
                  atendimento: String(false),
                  subCategoria: servico.subCategoria,
                  usuarioId: servico.usuarioId
                }).map((metadado) => { return { "nome": metadado[0], "valor": String(metadado[1]) } })
              }
            }
          }
        }),
        (updateChamados()),
        res.status(200).send(req.body))
      : res.send("Não autorizado")
  });
  
  app.post('/api/:codfilial/update/servico/:id/arquivo', (req, res) => {
    let filename = (()=>`${Date.now()}-${req.body.title}`)()
    let {usuarioId:uid} = req.session
    let {codfilial, id} = req.params
    console.log(Object.keys(req.body), filename)
    req.session.valid && filiais.get().filter(filial=>usuarios.get()[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ? (
      console.log("Salvando arquivo no serviço"),
      req.body.data ? 
        (console.log("Iniciando a escrita"),
          fs.writeFile(
            path.resolve(`files/`, filename),
            req.body.data.split('base64,')[1],
            'base64',
            (error) => {
              if (error) {
                console.log(error)
                console.log({ error })
                res.send({ error })
                return
              }
              console.log(`Arquivo ${filename} salvo com sucesso`)
              prisma.metadadoChamado.updateMany({
                where: {
                  chamadoId: parseInt(req.params.id),
                  nome: "anexo"
                },
                data: {
                  valor: filename
                }
              })
                .then(async data => {
                  console.log(`${data.count} registro alterado`)
                  if (data.count == 0)
                    await prisma.metadadoChamado.create({
                      data: {
                        nome: "anexo",
                        valor: filename,
                        chamado: {
                          connect: {
                            id: parseInt(req.params.id)
                          }
                        }
                      }
                    }).then(() => {
                      console.log("Registro raiz criado")
                      res.send()
                      updateChamados()
                    })
                      .catch(() => { console.log("Erro na criação do registro raiz"); res.status(500).send() })
                  else
                    res.send()
                  updateChamados()
                })
                .catch(error => {
                  console.log(error)
                  res.send({ error })
                })
            }
          ))
        : res.send()
    )
      : res.send("Não autorizado")
  })
  
  app.post('/api/:codfilial/update/servico/:id', async (req, res) => {
    let novo_servico = req.body
    let chamado_atualizado = undefined
    let { usuarioId : uid } = req.session 
    let user = usuarios.get()[uid]
    let metadados = Object.entries({
      departamento: novo_servico.departamento,
      status: novo_servico.status,
      prioridade: novo_servico.prioridade,
      atendimento: 
        novo_servico.atendimento 
        ? novo_servico.atendimento
        : (novo_servico.chat 
          ? (novo_servico.chat.length > 2 
            ? true 
            : false) 
          : false),
      tipo: novo_servico.tipo,
      atendenteId: novo_servico.atendenteId,
      usuarioId: novo_servico.usuarioId,
      assumido_em: novo_servico.assumido_em,
      resolvido_em: novo_servico.resolvido_em,
      fechado_em: novo_servico.fechado_em
    }).map((metadado) => { return { nome: metadado[0], valor: String(metadado[1]) } });
    let valuidpdate;
    try {
      let chamado =
        chamados.get()
          .filter(chamado => chamado)
          .find(chamado => chamado.id == novo_servico.id)
      valuidpdate =
        (((chamado
          .atendenteId || uid) == uid && user.tipo=="suporte")
        ||chamado
          .usuarioId == uid
        || user.cargo == "admin")
        && filiais.get().filter(filial=>user?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined
    } catch (e) {
      console.log(e)
      valuidpdate = false
    }
    console.log("Edição é " + (valuidpdate ? "válida" : "inválida"))
    req.session.valid && valuidpdate ? (async () => {
      console.log("Atualizando serviço " + novo_servico.id)
      if (novo_servico.chat) {
        novo_servico.chat.forEach((element) => {delete element.chamadoId;delete element.metadados})
        chamado_atualizado = await prisma.chamado.update({
          where: {
            id: parseInt(req.params.id)
          },
          data: {
            autor: novo_servico.autor,
            chat: {
              createMany: {
                data: novo_servico.chat,
                skipDuplicates: true
              }
            },
            updatedAt: new Date()
          },
          include: {
            chat: true
          }
        }).catch((e) => console.log("Erro na atualização do chamado.\n", e))
      }
      console.log("Atualizando metadados...")
      for (let {nome, valor} of metadados){
        console.log(`${nome} para ${valor}`)
        if (chamados.get().find(chamado=>chamado.id==novo_servico.id)[nome])
          await prisma.metadadoChamado.updateMany({
            where: {
              chamadoId: parseInt(novo_servico.id),
              nome
            },
            data: {
              valor
            }
          }).catch((e) => console.log("Erro na atualização dos metadados do chamado. \n", e))
        else {
          console.log(`Criando campo ${nome}...`)
          await prisma.metadadoChamado.create({
            data:{
              nome, valor,
              chamadoId: parseInt(novo_servico.id)
            }
          })
        }
      }
      await updateChamados()
      console.log("Chamado atualizado")
      res.status(200).send(chamado_atualizado)
    })() : res.send("Não autorizado")
  });
  
  app.get('/api/:codfilial/servicos', (req, res) => {
    let uid = req.session.usuarioId
    let user = usuarios.get()[uid]
    req.session.valid && filiais.get().filter(filial=>user?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ?
      user?.cargo == "admin" 
      ? res.send(chamados.get().filter(c=>filiais.get().find(f=>f.codigo==req.params.codfilial).id==c.filialId))
      : user?.tipo == "suporte"
        ? res.send(chamados.get().filter(c=>filiais.get().find(f=>f.codigo==req.params.codfilial).id==c.filialId).filter(chamado => chamado.autorId == uid || (chamado.atendenteId || uid) == uid || chamado.usuarioId == uid))
        : res.send(chamados.get().filter(c=>filiais.get().find(f=>f.codigo==req.params.codfilial).id==c.filialId).filter(chamado => chamado.autorId == uid || chamado.usuarioId == uid))
    : res.send("Não autorizado")
  });
  
  app.get('/api/:codfilial/servicos/:tipo/:filtro', (req, res) => {
    let { tipo, filtro, codfilial } = req.params
    let { valid, usuarioId: uid } = req.session
    let user = usuarios.get()[uid]
    valid 
    ? filiais.get()
        .filter(
          filial=>
            user
            ?.filiais
            .includes(filial.id.toString())
        ).find(f=>f.codigo==codfilial) 
      ? user?.cargo == "admin" 
        ? res.send(chamados.get().filter(c=>filiais.get().find(f=>f.codigo==req.params.codfilial).id==c.filialId).filter(chamado => chamado[tipo] == filtro))
        : user?.tipo == "suporte"
          ? res.send(chamados.get().filter(c=>filiais.get().find(f=>f.codigo==req.params.codfilial).id==c.filialId).filter(chamado => chamado[tipo] == filtro).filter(chamado => chamado.autorId == uid || (chamado.atendenteId || uid) == uid || chamado.usuarioId == uid))
          : res.send(chamados.get().filter(c=>filiais.get().find(f=>f.codigo==req.params.codfilial).id==c.filialId).filter(chamado => chamado[tipo] == filtro).filter(chamado => chamado.autorId == uid || chamado.usuarioId == uid))
      : res.send([])
    : res.send("Não autorizado")
  });
  
  app.get('/api/:codfilial/servico/:id', (req, res) => {
    let { usuarioId: uid } = req.session
    let chamado = chamados.get().find(chamado => chamado.id == req.params.id);
    let user = usuarios.get()[uid]
    req.session.valid && 
    filiais.get().filter(filial=>user?.filiais?.includes(filial.id.toString()))
    .find(f=>f.codigo==req.params.codfilial) && 
    (chamado.autorId == uid || chamado.usuarioId == uid || user.tipo == "suporte") 
    ? res.send(chamado)
    : res.send("Não autorizado")
  });
  
  app.post('/api/:codfilial/update/mensagem/:id/arquivo', (req, res) => {
    let filename = (()=>`${Date.now()}-${req.body.title}`)()
    let {usuarioId : uid} = req.session
    let { codfilial, id } = req.params
    id = parseInt(id)
    console.log(Object.keys(req.body), filename)
    req.session.valid && filiais.get().filter(filial=>usuarios[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) !== undefined ? (
      console.log("Salvando arquivo no serviço"),
      req.body.data ? 
        (console.log("Iniciando a escrita"),
          fs.writeFile(
            path.resolve(`files/`, filename),
            req.body.data.split('base64,')[1],
            'base64',
            (error) => {
              if (error) {
                console.log(error)
                console.log({ error })
                res.send({ error })
                return
              }
              console.log(`Arquivo ${filename} salvo com sucesso`)
              prisma.metadadoMensagem.updateMany({
                where: {
                  mensagemId: parseInt(req.params.id),
                  nome: "anexo"
                },
                data: {
                  valor: filename
                }
              })
                .then(async data => {
                  console.log(`${data.count} registro alterado`)
                  if (data.count == 0)
                    await prisma.metadadoMensagem.create({
                      data: {
                        nome: "anexo",
                        valor: filename,
                        mensagem: {
                          connect: {
                            id
                          }
                        }
                      }
                    }).then(() => {
                      console.log("Registro raiz criado")
                      res.send()
                      updateChamados()
                    })
                      .catch((e) => { console.log("Erro na criação do registro raiz\n", e); res.status(500).send() })
                  else
                    res.send()
                  updateChamados()
                })
                .catch(error => {
                  console.log(error)
                  res.send({ error })
                })
            }
          ))
        : res.send()
    )
      : res.send("Não autorizado")
  })  

export default app