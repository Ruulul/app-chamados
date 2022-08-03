import prisma_pkg from '@prisma/client'
import { createInterface } from 'readline'
const { PrismaClient } = prisma_pkg
const prisma = new PrismaClient()
export default {
  variables: {
      usuarios:{
          get: ()=>Array.isArray(usuarios) ? [...usuarios] : []
      },
      chamados:{
          get: ()=>Array.isArray(chamados) ? [...chamados] : []
      },
      categorias:{
          get: ()=>Array.isArray(categorias) ? [...categorias] : []
      },
      tipos:{
          get: ()=>Array.isArray(tipos) ? [...tipos] : []
      },
      departamentos:{
          get: ()=>Array.isArray(departamentos) ? [...departamentos] : []
      },
      filiais:{
          get: ()=>Array.isArray(filiais) ? [...filiais] : []
      },
      metameta:{get:()=>JSON.parse(JSON.stringify(metameta))},
      processos:{get:()=>JSON.parse(JSON.stringify(processos))},
      etapas:{get:()=>JSON.parse(JSON.stringify(etapas))},
      metadados:{get:()=>JSON.parse(JSON.stringify(metadados))},
      log:{get:()=>JSON.parse(JSON.stringify(log))},
      prisma
  },
  updaters: {
      updateCategorias,
      updateChamados,
      updateDepartamentos,
      updateFiliais,
      updateTipos,
      updateUsuarios,
      updateAll,
      updateProcessos, updateEtapas, updateMetadados, updateLog, updateMetaMeta
  }
}

const rl = createInterface({
  input: process.stdin,
  output: process.stderr
});
rl.write('>');
process.stdin.on('keypress', async (event)=>{
  switch(event) {
    case 'C':
      await updateChamados();
      rl.write('\nChamados atualizados.\n');
      break;
    case 'u':
      await updateUsuarios();
      rl.write('\nUsuários atualizados.\n');
      break;
    case 'a':
      await updateAll();
      rl.write('\nTudo atualizado.\n');
      break;
    case '\x03' || 'q':
      rl.close();
      await prisma.$disconnect();
      process.exit();
      break;
    default:
      rl.write(`
Comando não reconhecido.
  Os comandos disponíveis no momento são:
    'C': atualiza os chamados;
    'u': atualiza os usuários.
    'a': atualiza tudo;
  
>`);
  }
});

/** @type {string | import('@prisma/client').Usuario[]} */
var usuarios = "vazio"
/** @type {string | import('@prisma/client').Chamado[]} */
var chamados = "vazio"
/** @type {string | import('@prisma/client').Categoria[]} */
var categorias = "vazio"
/** @type {string | import('@prisma/client').Tipo[]} */
var tipos = "vazio"
/** @type {string | import('@prisma/client').Departamento[]} */
var departamentos = "vazio"
/** @type {string | import('@prisma/client').Filial[]} */
var filiais = "vazio"
/** 
 * @type {string | {{
 *    processo: import('@prisma/client').ProcessoMeta[], 
 *    etapa: import('@prisma/client').EtapaMeta[], 
 *    log: import('@prisma/client').MensagemMeta[], 
 *    campos: import('@prisma/client').CampoMeta[]
 *    }}
 * } 
 * */
var metameta = "vazio"
var processos = "vazio"
async function updateProcessos () {
  processos = await getModelData('processo');
}
var etapas = "vazio"
async function updateEtapas () {
  etapas = await getModelData('etapa');
}
var log = "vazio"
async function updateLog () {
  log = await getModelData('log');
}
var metadados = "vazio"
async function updateMetadados () {
  metadados = await getModelData('metadado');
}


async function updateChamados() {
    chamados = await prisma.chamado.findMany({
      select: {
        id: true,
        autorId: true,
        metadados: true,
        chat: {
          include: {
            metadados: true
          }
        },
        assunto: true,
        createdAt: true,
        prazo: true,
        updatedAt: true,
        filialId: true
      }
    })
      .then((data) => {
        let Metas = [];
        chamados = [];
        for (const [index, chamado] of Object.entries(data))
          Metas[index] =
            Object.fromEntries(
              chamado.metadados.map((md) => [md.nome, md.valor])
            )
        
        return data.map((chamado, index) => { 
          delete chamado.metadados;  
          let chamado_full = { ...chamado, ...Metas[index] }
          return chamado_full
        })
      }).catch((e) => {
        if (chamados === "vazio")
          throw e
        else
          console.log("Erro em updateChamados.\n", e)
      })
  }
  
async function updateUsuarios() {
    await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        sobrenome: true,
        senha: false,
        email: true,
        metadados: true,
        filialId: true
      },
      where: {
        id: {
          gte: 3
        }
      }
    }).then(function (usuarios_array) {
      usuarios = []
      for (let usuario of usuarios_array)
        usuarios[usuario.id] = usuario
      for (let [index, usuario] of Object.entries(usuarios_array)) {
        let Metas =
          Object.fromEntries(
            usuario.metadados.map(
              (md) => {
                return [md.nome, md.valor]
              }
            )
          )
        usuario = { ...usuario, ...Metas }
        usuario.area = usuario.metadados.filter(({nome}) => nome == "area").map(({valor}) => valor)
        usuario.filiais = usuario.metadados.filter(({nome}) => nome == "acessa_filial").map(({valor}) => valor)
        usuario.dept = usuario.metadados.filter(({nome}) => nome == "dept").map(({valor}) => valor)
        delete usuario.metadados
        usuarios[usuario.id] = usuario
      }
    }).catch((e) => {
      if (usuarios === "vazio")
        throw e
      else
        console.log("Erro em updateUsuarios.\n", e)
    })
}

async function updateCategorias() {
    await prisma.categoria.findMany({
    }).then(function (data) {
      categorias = data
    }).catch((e) => {
      if (categorias === "vazio")
        throw e
      else
        console.log("Erro em updateCategorias.\n", e)
    })
}

async function updateDepartamentos() {
    await prisma.departamento.findMany({
    }).then(function (data) {
      departamentos = data
    }).catch((e) => {
      if (departamentos === "vazio")
        throw e
      else
        console.log("Erro em updateDepartamentos.\n", e)
    })
}

async function updateTipos() {
    await prisma.tipo.findMany({
    }).then(function (data) {
      tipos = data
    }).catch((e) => {
      if (tipos === "vazio")
        throw e
      else
        console.log("Erro em updateTipos.\n", e)
    })
}
async function updateFiliais() {
    await prisma.filial.findMany({
    }).then(function (data) {
      filiais = data
    }).catch((e) => {
      if (categorias === "vazio")
        throw e
      else
        console.log("Erro em updateFiliais.\n", e)
    })
}

async function updateAll() {
    return Promise.all([
        updateCategorias(),
        updateChamados(),
        updateDepartamentos(),
        updateFiliais(),
        updateTipos(),
        updateUsuarios(),
        updateMetaMeta(),
        updateProcessos(), updateEtapas(), updateMetadados(), updateLog()
    ])
}

async function updateMetaMeta() {
  try {
    metameta = await getMetaMeta()
  }
  catch (e) {
    if (categorias === "vazio")
      throw e
    else
      console.error("Erro em updateMetaMeta.\n", e)
  }
}

async function getMetaMeta () {
  let thing = {};
  thing.processo = await getProcessosMeta();
  thing.etapa = await getEtapasMeta();
  thing.log = await getLogMeta();
  
  thing.campos = Object.fromEntries(Object.keys(thing).map((key)=>[key, {}]))
  for (let kind in thing.campos) {
      for (let tag of [...new Set(Object.values(thing[kind]).map(being=>being.Tag))]) {
        thing.campos[kind][tag] = await getCamposMeta(kind, tag)
      }
      thing[kind] = assemblyByTag(thing[kind])
  }
  return thing
}

function assemblyByTag (array, tagField = 'Tag') {
  return Object.fromEntries(
    array.map(item=>[item[tagField], (delete item[tagField], item)])
  )
}

async function getCamposMeta (model, tagModel) {
  let campos = await prisma.campoMeta.findMany({where: {model, tagModel}, select: {id: true, campoMeta: true, tipo: true, hasDict: true, notifica: true}})
  for (let campo of campos) {
    if (!campo.hasDict) continue
    campo.opcoes = await prisma.campoMetaOpcao.findMany({where:{idCampoMeta: campo.id}})
    campo.opcoes = campo.opcoes?.map(({opcao})=>opcao)
  }
  return campos
}

async function getProcessosMeta () {
  let processos = await prisma.processoMeta.findMany()

  for (let processo of processos) {
    let etapas = await prisma.etapaMeta.findMany({where: {processoTag: processo.Tag}})
    processo.etapas = [etapas.find(etapa=>!etapa.prev)]
    while (processo.etapas.at(-1).next) processo.etapas.push(etapas.find(etapa=>etapa.id==processo.etapas.at(-1).next))
  }

  return processos
}

async function getEtapasMeta () {
  let etapas = await prisma.etapaMeta.findMany()

  for (let etapa of etapas) {
    if (etapa.dept) {
      etapa.dept = await prisma.departamento.findUnique({where: {id: etapa.dept}});
    }
    else {
      etapa.depts = await prisma.etapaMetaListDept.findMany({where: {idEtapa: etapa.id}});
      for (let i in etapa.depts) {
         etapa.depts[i] = await prisma.departamento.findUnique({where: {id: etapa.depts[i].dept}});
      }
    }
  }
  return etapas
}

async function getLogMeta () {
  let logs = await prisma.mensagemMeta.findMany()

  return logs
}

async function getModelData (model) {
  console.error("Getting model of", model)
  let data = await prisma[model].findMany();
  return data;
}