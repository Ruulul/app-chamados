const { PrismaClient } = require('@prisma/client');

const cookieParser = require('cookie-parser');

const bcrypt = require('bcrypt')
const session = require('express-session')
const _ = require('lodash')

const { PrismaSessionStore } = require('@quixo3/prisma-session-store')

const fs = require('fs')
const SECRET = fs.readFileSync('./key', 'utf-8');

//const key = fs.readFileSync('./certification/key.pem');
//const cert = fs.readFileSync('./certification/cert.pem');

const prisma = new PrismaClient()
const express = require('express');
//const https = require('https')
const app = express();
//const server = https.createServer({key, cert}, app)
const port = process.env.PORT || 5000;

const store = new PrismaSessionStore(
  prisma, {
  checkPeriod: 10 * 60 * 1000,
  dbRecordIdIsSessionId: true,
  dbRecordIdFunction: undefined,
});
app.use(express.json())
app.use(cookieParser())
app.use(session({
  secret: SECRET,
  store,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
  }
}));
app.use(express.static('./public/'))

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://10.0.0.5:3000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware

  next();
});

app.get('/api/mensagem', (req, res) => {
  res.send({ express: 'Hello From Express' });
});
/* 
Serviços
*/
app.post('/api/novo/servico', async (req, res) => {
  let servico = req.body
  let autorId = servico.autorId
  req.session.valid ?
    ((console.log("Salvando novo serviço")),
      (servico.chat[servico.chat.length] = { autorId: 3, mensagem: "Seu chamado será atendido dentro de " + ["uma semana", "3 dias", "um dia", "algumas horas"][servico.prioridade - 1] }),
      (await prisma.chamado.create({
        data: {
          autorId,
          chat: {
            create: servico.chat
          },
          assunto: servico.assunto,
          prazo: servico.prazo,
          metadados: {
            createMany: {
              data: Object.entries({
                departamento: servico.departamento,
                status: servico.status,
                prioridade: servico.prioridade,
                tipo: servico.tipo,
                atendenteId: servico.atendenteId,
                atendimento: String(false),
				subCategoria: servico.subCategoria
              }).map((metadado) => { return { "nome": metadado[0], "valor": String(metadado[1]) } })
            }
          }
        }
      })),

      res.status(200).send(req.body)) : res.send("Não autorizado")
});

app.post('/api/update/servico/:id', async (req, res) => {
  let novo_servico = req.body
  let metadados = Object.entries({
    assunto: novo_servico.assunto,
    departamento: novo_servico.departamento,
    status: novo_servico.status,
    prioridade: novo_servico.prioridade,
    atendimento: (novo_servico.chat ? (novo_servico.chat.length > 1 ? true : false) : undefined),
    tipo: novo_servico.tipo,
    atendenteId: novo_servico.atendenteId
  }).map((metadado) => { return { "nome": metadado[0], "valor": String(metadado[1]) } });
  let validUpdate = await prisma.metadadoChamado.findFirst(
    {
      where: {
        chamadoId: novo_servico.id,
        nome: "atendenteId"
      }
    }).then(async (valor) => {
      console.log(valor)
      let usuario = await prisma.usuario.findUnique({ where: { id: req.session.usuarioId }, select: { id: true, metadados: true } })
      let metadados = Object.fromEntries(usuario.metadados.map((metadado) => [metadado.nome, metadado.valor]))
      if (valor.valor == usuario.id || metadados.cargo == "admin")
        return true;
      else return false;
    })
  console.log("Edição é " + (validUpdate ? "válida" : "inválida"))
  req.session.valid && validUpdate ? (async () => {
    console.log("Atualizando serviço")
    if (novo_servico.chat) {
      novo_servico.chat.forEach((element) => delete element.chamadoId)
      await prisma.chamado.update({
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
        }
      })
    }
    for (let metadado of metadados)
      await prisma.metadadoChamado.updateMany({
        where: {
          chamadoId: parseInt(req.params.id),
          nome: metadado.nome
        },
        data: {
          valor: metadado.valor
        }
      })
    res.status(200).send(req.body)
  })() : res.send("Não autorizado")
});

app.get('/api/servicos', async (req, res) => {
  req.session.valid ?
	prisma.usuario.findUnique({where: {id: req.session.usuarioId}, select:{metadados: true}})
	.then((usuario)=>{
		if (usuario?.metadados?.find(md=>md.nome=="tipo" && md.valor=="suporte"))
			prisma.chamado
			.findMany({
				select: {
					id: true,
					autorId: true,
					metadados: true,
					chat: true,
					assunto: true,
					createdAt: true,
					prazo: true,
					updatedAt: true
				}
			})
			.then((data) => {
				let Metas = [];
				for (const [index, chamado] of data.entries())
				Metas[index] =
					Object.fromEntries(
						chamado.metadados.map(
							(md) => {
							return [md.nome, md.valor]
							}
						)
					)
				res.send(data.map((chamado, index) => { delete chamado.metadados; return { ...chamado, ...Metas[index] } }))
			})
			.catch("Ocorreu um erro no banco de dados")
		else
			prisma.chamado
			.findMany({
				where: {
					autorId: req.session.usuarioId
				},
				select: {
					id: true,
					autorId: true,
					metadados: true,
					chat: true,
					assunto: true,
					createdAt: true,
					prazo: true,
					updatedAt: true
				}
			})
			.then(data => {
				let Metas = [];
				for (const [index, chamado] of data.entries())
					Metas[index] =
						Object.fromEntries(
							chamado.metadados.map(
								md =>
									[md.nome, md.valor]
							)
						)
				res.send(data.map((chamado,index)=> {delete chamado.metadados; return {...chamado, ...Metas[index]}}))
			})
	})
	.catch((error)=>res.status(500).send({error}))
    : res.send("Não autorizado")
});

app.get('/api/servicos/:tipo/:filtro', async (req, res) => {
  req.session.valid ?
	prisma.usuario.findUnique({where: {id: req.session.usuarioId}, select:{metadados: true}})
	.then((usuario)=>{
		if (usuario?.metadados?.find(md=>md.nome=="tipo" && md.valor=="suporte"))
			prisma.chamado
			.findMany({
				where: {
					metadados:{
						some: {
							nome: req.params.tipo,
							valor: req.params.filtro
						}
					}
				},
				select: {
					id: true,
					autorId: true,
					metadados: true,
					chat: true,
					assunto: true,
					createdAt: true,
					prazo: true,
					updatedAt: true
				}
			})
			.then((data) => {
				let Metas = [];
				for (const [index, chamado] of data.entries())
				Metas[index] =
					Object.fromEntries(
						chamado.metadados.map(
							(md) => {
							return [md.nome, md.valor]
							}
						)
					)
				res.send(data.map((chamado, index) => { delete chamado.metadados; return { ...chamado, ...Metas[index] } }))
			})
			.catch("Ocorreu um erro no banco de dados")
		else
			prisma.chamado
			.findMany({
				where: {
					autorId: req.session.usuarioId,
					metadados:{
						some: {
							nome: req.params.tipo,
							valor: req.params.filtro
						}
					}
				},
				select: {
					id: true,
					autorId: true,
					metadados: true,
					chat: true,
					assunto: true,
					createdAt: true,
					prazo: true,
					updatedAt: true
				}
			})
			.then(data => {
				let Metas = [];
				for (const [index, chamado] of data.entries())
					Metas[index] =
						Object.fromEntries(
							chamado.metadados.map(
								md =>
									[md.nome, md.valor]
							)
						)
				res.send(data.map((chamado,index)=> {delete chamado.metadados; return {...chamado, ...Metas[index]}}))
			})
	})
	.catch((error)=>res.status(500).send({error}))
    : res.send("Não autorizado")
});

app.get('/api/servico/:id', async (req, res) => {
  req.session.valid ? prisma.chamado.findUnique({
    where: {
      id: parseInt(req.params.id)
    }
  }).then(
    async (chamado) => {
      let meta = Object.fromEntries((await prisma.metadadoChamado.findMany({ where: { chamado } })).map((md) => { return [md.nome, md.valor] }))
      chamado.chat =
        await prisma.mensagem
          .findMany({
            where: {
              chamadoId: parseInt(req.params.id)
            }
          }
          )
      chamado = { ...chamado, ...meta }
      res.send(chamado)
    })
    .catch((e) => res.status(500).send({ erro: "Falha em encontrar serviço " + req.params.id + `\n${e}` }))
    : res.send("Não autorizado")
})

/*
Categorias
*/

app.get('/api/servicos/categorias/:tipo', async (req,res)=>{
	console.log(req.params)
	req.session.valid ?
	prisma.categoria.findMany({
		where:{
			tipo: req.params.tipo
		}
	})
	.then(categorias=>res.send(categorias))
	.catch(err=>{
		console.log(error), 
		res
			.status(500)
			.send({error})
		}
	) : res.send("Não autorizado")
})

app.get('/api/servicos/categorias', async (req, res)=>{
	prisma.categoria.findMany({
	})
	.then(categorias=>res.send(categorias))
	.catch(err=>{
		console.log(error), 
		res
			.status(500)
			.send({error})
		}
	)})

app.post('/api/servicos/novo/subcategoria/', async (req, res) =>{
	let sub = req.body
	let usuario = await prisma
		.usuario
		.findUnique({
			where:{
				id: req.session.usuarioId
			}, 
			select:{
				metadados: true
			}
		})
	req.session.valid ?
		usuario.metadados.find(md=>md.nome=="tipo"&&md.valor=="suporte") ?
		prisma.categoria.create({
			data: {
				tipo: sub.tipo,
				categoria: sub.newCategoria
			}
		})
		.then(r=>res.status(200).send("OK" + r))
		.catch(error=>res.status(505).send({error})) : res.send("Não autorizado")
	: res.send("Não autorizado")
})

app.post('/api/servicos/editar/subcategoria/:c/:sc', async (req, res) =>{
	let sub = req.body
	let usuario = await prisma
		.usuario
		.findUnique({
			where:{
				id: req.session.usuarioId
			}, 
			select:{
				metadados: true
			}
		}).catch(error=>console.log(error))
	req.session.valid && usuario ?
		usuario.metadados.find(md=>md.nome=="tipo"&&md.valor=="suporte") ?
		prisma.categoria.updateMany({
			where: {
				tipo: req.params.c,
				categoria: req.params.sc
			},
			data: {
				tipo: sub.tipo,
				categoria: sub.newCategoria
			}
		})
		.then(r=>res.status(200).send("OK" + JSON.stringify(r)))
		.catch(error=>res.status(505).send({error})) : res.send("Não autorizado")
	: res.send("Não autorizado")
})

app.post('/api/servicos/excluir/subcategoria/:c/:sc', async (req, res) =>{
	let sub = req.body
	let usuario = await prisma
		.usuario
		.findUnique({
			where:{
				id: req.session.usuarioId
			}, 
			select:{
				metadados: true
			}
		})
	req.session.valid ?
		usuario.metadados.find(md=>md.nome=="tipo"&&md.valor=="suporte") ?
		prisma.categoria.deleteMany({
			where: {
				tipo: req.params.c,
				categoria: req.params.sc
			}
		})
		.then(r=>res.status(200).send("OK" + r))
		.catch(error=>res.status(505).send({error})) : res.send("Não autorizado")
	: res.send("Não autorizado")
})

/*
Usuários
*/

app.post('/api/novo/usuario', (req, res) => {
  req.session.valid ? prisma.usuario.findMany({
    where: {
      email: req.body.email
    }
  }).then(async (usuario) => {
    if (usuario.length !== 0) {
      res.status(302).send("Email já registrado")
      return
    }
    console.log(JSON.stringify(req.body))
    req.body.senha = await bcrypt.hash(req.body.senha, 12)
    return req.body
  }, (err) => { res.status(500).send("Erro acessando o banco de dados") })
    .then(async (data) => {
      await prisma.usuario.create({
        data: {
          email: data.email,
          senha: data.senha,
          nome: data.nome,
          sobrenome: data.sobrenome
        }
      })
      res.status(200).send("Usuário criado com sucesso")
      return
    }, (err) => { res.status(500).send("Erro criando o usuário. \n" + err) })
    : res.send("Não autorizado")
})

app.get('/api/usuarios/', async (req, res) => {
  req.session.valid ?
    prisma.usuario.findMany(
      {
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          senha: false,
          email: true,
        }
      }
    )
      .then(
        async (data) => {
          let Metas = [];
          data = data.filter(({ id }) => id > 3)
          for (const [index, usuario] of data.entries())
            await prisma.metadadoUsuario.findMany({ where: { usuario } })
              .then(
                (mds) => {
                  Metas[index] =
                    Object.fromEntries(
                      mds.filter((md) => md.nome !== "area").map(
                        (md) => {
                          return [md.nome, md.valor]
                        }
                      )
                    )
                  Metas[index].area = mds.filter((md) => md.nome === "area").map(md => md.valor)
                }
              )
          res.send(
            data.map(
              (usuario, index) => {
                return { ...usuario, ...Metas[index] }
              }
            )
          )
        }
      )
    : res.send("Não autorizado")
});

app.get('/api/usuario/email/:email', (req, res) => {
  req.session.valid ? prisma.usuario.findUnique({
    where: {
      email: req.params.email
    }
  }).then((usuario) => {
    usuario !== "" ? res.send(usuario) : res.send("Usuário não encontrado")
  }).catch((err) => {
    res.status(500).send({ erro: "Falha em obter usuário " })
  }) : res.send("Não autorizado")
})

app.get('/api/usuarios/:tipo/:filtro', async (req, res) => {
  req.session.valid ?
    prisma.usuario.findMany(
      {
        where: {
          metadados: {
            some: {
              nome: req.params.tipo,
              valor: req.params.filtro
            },
          }
        },
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          senha: false,
          email: true,
        }
      }
    )
      .then(
        async (data) => {
          let Metas = [];
          for (const [index, usuario] of data.entries())
            await prisma.metadadoUsuario.findMany({ where: { usuario } })
              .then(
                (mds) => {
                  Metas[index] =
                    Object.fromEntries(
                      mds.filter((md) => md.nome !== "area").map(
                        (md) => {
                          return [md.nome, md.valor]
                        }
                      )
                    )
                  Metas[index].area = mds.filter((md) => md.nome === "area").map(md => md.valor)
                }
              )
          res.send(
            data.map(
              (usuario, index) => {
                return { ...usuario, ...Metas[index] }
              }
            )
          )
        }
      )
    : res.send("Não autorizado")
});

app.get('/api/usuario/:id', (req, res) => {
  req.session.valid ? prisma.usuario.findUnique({
    where: {
      id: parseInt(req.params.id)
    },
    select: {
      id: true,
      nome: true,
      sobrenome: true,
      senha: false,
      email: true,
    }
  }).then((usuario) => {
    res.send(usuario)
  }).catch((err) => {
    res.status(500).send({ erro: "Falha em obter usuário " })
  }) : res.send("Não autorizado")
})
/*
chat
*/
app.post('/api/novo/chat', (req, res) => {
  let chat = req.body
  let atendidoId = req.session.usuarioId
  let atendenteId = 1
  let status = "pendente"
  let assunto = chat.assunto
  let descr = chat.descr

  console.log({ chat })

  req.session.valid ?
    prisma.chat.create({
      data: {
        atendido: {
          connect: {
            id: atendidoId
          }
        },
        atendente: {
          connect: {
            id: atendenteId
          }
        },
        status,
        metadados: {
          createMany: {
            data: Object.entries({
              assunto, descr
            }).map(md => ({ nome: md[0], valor: md[1] }))
          }
        }
      }
    })
      .then(r => res.status(200).send(req.body))
      .catch(err => {
        console.log(err)
        res.status(500).send(err)
      })
    : res.send("Não autorizado")
})

app.post('/api/chat/:id/novo/mensagem', (req, res) => {
  console.log("Nova mensagem")
  let mensagem = req.body
  let chatId = parseInt(req.params.id)
  let autorId = req.session.usuarioId
  delete mensagem.author
  req.session.valid ?
    prisma.mensagemChat.create({
      data: {
        chatId,
        autorId,
        mensagem: JSON.stringify(
          mensagem
        )
      }
    })
      .then(r => res.status(200).send(req.body))
      .catch(err => {
        console.log(err)
        res.status(500).send(err)
      })
    : (console.log("Não autorizado"),
      res.send("Não autorizado"))
})

app.post('/api/update/chat/:id', (req, res) => {
  let chatId = req.params.id
  let novo_chat = req.body
  let status = novo_chat.status
  let atendenteId = novo_chat.atendenteId
  let metadados = Object.entries({
    assunto: novo_chat.assunto,
    descr: novo_chat.descr
  }).map(md => ({ nome: md[0], valor: md[1] }))

  req.session.valid ?
    (prisma.chat.update({
      where: {
        id: parseInt(chatId)
      },
      data: {
        status,
        atendenteId: parseInt(atendenteId)
      }
    }).catch(err => console.log(err)),
      ((() => {
        for (let md of metadados)
          prisma.metadadoChat.updateMany({
            where: {
              chatId: parseInt(chatId),
              nome: md.nome
            },
            data: {
              valor: md.valor
            }
          }).catch(err => console.log(err))
      })()),
      (res.status(200).send(req.body)))
    : res.send("Não autorizado")
})

app.get('/api/chat/:id/mensagens', (req, res) => {
  if (req.session.valid)
    prisma.mensagemChat.findMany({
      where: {
        chatId: parseInt(req.params.id)
      }
    }).then(mensagens => res.status(200).send(mensagens))
      .catch(err => res.status(500).send(err))
  else res.send("Não autorizado")
})

app.get('/api/chats/atendente/:id', (req, res) => {
  if (req.session.valid)
    prisma.chat.findMany({
      where: {
        atendenteId: parseInt(req.params.id)
      },
      select: {
        id: true,
        atendenteId: true,
        atendidoId: true,
        status: true,
        mensagens: true,
        metadados: true
      }
    }).then(chats => {
      res.status(200).send(chats)
    })
      .catch(err => {
        console.log(err)
        res.status(500).send(err)
      })
  else res.send("Não autorizado")
})

app.get('/api/chats/atendido/:id', (req, res) => {
  if (req.session.valid)
    prisma.chat.findMany({
      where: {
        atendidoId: parseInt(req.params.id)
      },
      select: {
        id: true,
        atendenteId: true,
        atendidoId: true,
        status: true,
        mensagens: true,
        metadados: true
      }
    }).then(chats => res.status(200).send(chats))
      .catch(err => res.status(500).send(err))
  else res.send("Não autorizado")
})

app.get('/api/chats/pendentes', (req, res) => {
  req.session.valid ? (
    (prisma.usuario
      .findUnique({
        where: {
          id: req.session.usuarioId
        },
        select: {
          metadados: true
        }
      })
    ).then(usuario => {
      if (usuario.metadados.find(md => md.nome == "tipo" && md.valor == "suporte"))
        prisma.chat.findMany({
          where: {
            atendenteId: 1
          },
          select: {
            id: true, atendenteId: true, mensagens: true, atendidoId: true, status: true, metadados: true
          }
        })
          .then(chats => res.send(chats))
	  else res.send([{id: 0, atendenteId: 0,  metadados: [{nome:"assunto",valor: "Não autorizado"}, {nome:"descr", valor:"Você não é suporte"}]}])
    })
  ) : res.send("Não autorizado")
})
/*
perfil e auth
*/
app.get('/api/perfil', async (req, res) => {
  req.session.valid ? await prisma.usuario.findUnique({ where: { id: req.session.usuarioId }, select: { id: true, nome: true, sobrenome: true, metadados: true, email: true } })
    .then(usuario => {
      delete usuario.senha
      res.send(usuario)
    })
    .catch(err => {
      res.send("Não autorizado")
    }) : res.send("Não autorizado")
})

app.post('/api/login', async (req, res) => {
  await prisma.usuario.findMany({
    where: {
      email: req.body.email
    }
  }).then(async (usuario) => {
    if (usuario.length === 0) {
      res.send(JSON.stringify({ "status": 404, "error": "Usuário com esse email não encontrado" }))
      return
    }
    req.session.valid = false
    req.session.valid = await bcrypt.compare(req.body.senha, usuario[0].senha)
    if (req.session.valid) req.session.usuarioId = usuario[0].id
    if (!req.session.valid) {
      res.send(JSON.stringify({ "status": 404, "error": "Senha incorreta" }))
      return
    }
    req.session.save((e) => { res.send(JSON.stringify({ "status": 200, "error": e })) })
  }).catch((err) => {
    console.log(err)
    res.send(JSON.stringify({ "status": 500, "error": "Erro no login" }))
    return false
  })
})

app.post('/api/alterasenha', async (req, res) => {
  await prisma.usuario.findMany({
    where: {
      email: req.body.email
    }
  }).then(async (usuario) => {
    if (usuario.length === 0) {
      res.send(JSON.stringify({ "status": 404, "error": "Usuário com esse email não encontrado" }))
      return
    }
    req.session.valid = false
    if (usuario[0].senha !== "")
      req.session.valid = await bcrypt.compare(req.body.senhaatual, usuario[0].senha)
    else
      req.session.valid = true
    if (req.session.valid) {
      req.session.usuarioId = usuario[0].id
      req.body.senha = await bcrypt.hash(req.body.senha, 12)
      await prisma.usuario.update({
        where: {
          id: usuario[0].id
        },
        data: {
          senha: req.body.senha
        }
      })
    }
    if (!req.session.valid) {
      res.send(JSON.stringify({ "status": 404, "error": "Senha incorreta" }))
      return
    }
    req.session.save((e) => { res.send(JSON.stringify({ "status": 200, "error": e })) })
  }).catch((err) => {
    console.log(err)
    res.send(JSON.stringify({ "status": 500, "error": "Erro no login" }))
    return false
  })
})

app.post('/api/logout', async (req, res) => {
  //req.session.destroy((err) => { if (!err) { res.status(200).send("Logout com sucesso"); console.log("Logout com sucesso") } else { res.status(500).send("Algum erro ocorreu."); console.log("Algum erro ocorreu.") } })
  try {
    req.session.valid = false
    req.session.save()
    res.status(200).send("OK")
  } catch (e) {
    console.log("Falha em logout. \n" + e)
    res.status(500).send("Error")
  }
})

/*
misc
*/

app.get('/api/monitoring', async (req, res)=>{
	try {
	prisma.usuario.findMany({
		where: {
			metadados: {
				some: {
					nome: "tipo",
					valor: "suporte"
				}
			}
		},
		select: {
			nome: true,
			sobrenome: true,
			id: true,
		}
	})
	.then(atendentes=>{
		prisma.chamado.findMany({
			include: {
				metadados: true
			}
		})
		.then(chamados=>{
		res.send({atendentes, chamados})
		})
		.catch(err=>{
			console.log("Error at fetching chamados: ", err)
			res.status(500).send("Error at fetching chamados")
		})
	})
	.catch(err=>{
		console.log("Error at fetching atendentes: ", err)
		res.status(500).send("Error at fetching atendentes")
	})
	} catch(e) {
		console.log(e)
	}
})

app.listen(port, () => console.log(`Listening on port ${port}`));