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
    let chamado_criado;
    req.session.valid && filiais.get().filter(filial=>usuarios.get()[uid]?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==codfilial) ?
      (console.log("Salvando novo serviço"),
        servico.chat[servico.chat.length] = { autorId: 3, mensagem: "Seu chamado será atendido dentro de " + ["uma semana", "3 dias", "um dia", "algumas horas"][servico.prioridade - 1] },
  
        chamado_criado = await prisma.chamado.create({
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
                  status: "pendente",
                  prioridade: servico.prioridade,
                  tipo: servico.tipo,
                  atendimento: String(false),
                  subCategoria: servico.categoria || servico.subCategoria,
                  usuarioId: servico.usuarioId
                }).map((metadado) => { return { "nome": metadado[0], "valor": String(metadado[1]) } })
              }
            }
          }
        }),
        (await updateChamados()),
        res.status(200).send(chamado_criado))
      : res.send("Não autorizado")
  });
  
  app.post('/api/:codfilial/update/servico/:id/arquivo', (req, res) => {
    let filename = (()=>`${Date.now()}-${req.body.title}`)()
    let {usuarioId:uid} = req.session
    let {codfilial, id} = req.params
    let user = usuarios.get()[uid]
    let usuarioId, suporteId, autorId;
    let chamado = chamados.get().find(chamado=>chamado.id === parseInt(id));
    console.log("Salvando arquivo no chamado ", id);
    try {
      usuarioId = chamado.usuarioId;
      suporteId = chamado.suporteId;
      autorId = chamado.autorId;
    }
    catch (e) {
      console.log("Erro em obter campos do chamado: ", chamado);
    }
    console.log(Object.keys(req.body), filename)
    req.session.valid && 
    (user.tipo === 'suporte' || user.cargo==='admin' || [usuarioId, suporteId, autorId].map(a=>a?a.toString():undefined).includes(uid.toString())) ? (
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
      subCategoria: novo_servico.categoria || novo_servico.subCategoria,
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
            prazo: novo_servico.prazo || chamados.get().find(chamado=>chamado.id==novo_servico.id).prazo,
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
      res.status(200).send(chamados.get().find(chamado=>chamado.id===chamado_atualizado.id))
    })() : res.send("Não autorizado")
  });
  
  app.get('/api/:codfilial/servicos', (req, res) => {
    let uid = req.session.usuarioId
    let user = usuarios.get()[uid]
    if (!req.session.valid && filiais.get().filter(filial=>user?.filiais?.includes(filial.id.toString())).find(f=>f.codigo==req.params.codfilial) === undefined) return res.send("Não autorizado")
    let {page = 1, limit = 20, filtro : filtros} = req.query
    let chamados_filtrados = chamados.get().filter(c=>filiais.get().find(f=>f.codigo==req.params.codfilial).id==c.filialId)
    if (filtros)
      if (Array.isArray(filtros))
        for (let filtroUnsplit of filtros) {
          let [tipo, filtro] = filtroUnsplit.split(',')
          chamados_filtrados = chamados_filtrados.filter(chamado=>chamado[tipo]==filtro)
        }
      else {
        let [tipo, filtro] = filtros.split(',')
        chamados_filtrados = chamados_filtrados.filter(chamado=>chamado[tipo]==filtro)
      }
    if (user?.cargo != "admin" && user?.tipo != "suporte") chamados_filtrados = chamados_filtrados.filter(chamado => chamado.autorId == uid || chamado.usuarioId == uid)
    res.send({page: chamados_filtrados.slice((page - 1) * limit, page * limit), pages: Math.ceil(chamados_filtrados.length / limit), count: chamados_filtrados.length})
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
    let user = usuarios.get()[uid]
    let usuarioId, suporteId, autorId;
    let mensagem = chamados.get().reduce((pv, cv)=>[...pv, ...cv.chat], []).find(mensagem=>mensagem.id==id);
    let chamado = chamados.get().find(chamado=>chamado.id==mensagem.chamadoId);
    console.log("Salvando arquivo na mensagem ", id);
    try {
      usuarioId = chamado.usuarioId;
      suporteId = chamado.suporteId;
      autorId = chamado.autorId;
    }
    catch (e) {
      console.log("Erro em obter campos do chamado: ", chamado);
    }
    console.log(Object.keys(req.body), filename)
    console.log({
      uid,
      usuarioId,
      suporteId,
      autorId
    })
    console.log({
      user,
      chamado,
      mensagem
    })
    req.session.valid && 
    (user.tipo === 'suporte' || user.cargo==='admin' || [usuarioId, suporteId, autorId].map(a=>a?a.toString():undefined).includes(uid.toString())) ? (
      console.log("Salvando arquivo em mensagem"),
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
                            id: parseInt(id)
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