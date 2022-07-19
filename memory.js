import prisma_pkg from '@prisma/client'
import { createInterface } from 'readline'
const { PrismaClient } = prisma_pkg
const prisma = new PrismaClient()
export default {
  variables: {
      usuarios:{
          get: ()=>usuarios
      },
      chamados:{
          get: ()=>chamados
      },
      categorias:{
          get: ()=>categorias
      },
      tipos:{
          get: ()=>tipos
      },
      departamentos:{
          get: ()=>departamentos
      },
      filiais:{
          get: ()=>filiais
      },
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
    case '\x03':
      rl.write('Fechando entrada, execute de novo para fechar o servidor')
      rl.close();
      break;
    default:
      rl.write(`
Comando não reconhecido.
  Os comandos disponíveis no momento são:
    'C': atualiza os chamados;
    'u': atualiza os usuários.
  
>`);
  }
});

var usuarios = "vazio"
var chamados = "vazio"
var categorias = "vazio"
var tipos = "vazio"
var departamentos = "vazio"
var filiais = "vazio"

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
              chamado.metadados.map(
                (md) => {
                  return [md.nome, md.valor]
                }
              )
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
        updateUsuarios()
    ])
}
