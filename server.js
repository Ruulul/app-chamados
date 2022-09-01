import session from 'express-session'

import { PrismaSessionStore } from '@quixo3/prisma-session-store'

import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from "fs"

const SECRET = fs.readFileSync('./key', 'utf-8');

const key = fs.readFileSync(path.resolve('./ssl/key.pem'));
const cert = fs.readFileSync(path.resolve('./ssl/cert.pem'));

import express from 'express';
import https from 'https';
const app = express();
const port = process.env.PORT || 5000;

import memory from './memory.js'

const {
  variables: {
    filiais,
    usuarios,
    prisma,
    metameta
  },
  updaters : {
    updateAll
  }
} = memory

import servicos_router from './routes/servicos.js'
import departamentos_router from './routes/departamentos.js'
import tipos_router from './routes/tipos.js'
import categorias_router from './routes/categorias.js'
import usuarios_router from './routes/usuarios.js'
import auth_router from './routes/auth.js'
import misc_router from './routes/misc.js'

const store = new PrismaSessionStore(
  prisma, {
  checkPeriod: 2 * 60 * 60 * 1000,
  dbRecordIdIsSessionId: true,
  dbRecordIdFunction: undefined,
});
app.use(express.json({limit:'20mb'}))
app.use(session({
  secret: SECRET,
  store,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true
  }
}));
app.use(express.static('./public/'))
app.use('/', express.static('./client2/react/dist'))

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  if (['https://10.0.0.5:9999', 'https://localhost:3000'].includes(req.headers.origin))
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  else
  res.setHeader('Access-Control-Allow-Origin', 'https://10.0.0.5:9999');

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

await updateAll()

import meta_router from './routes/meta.js'
import processos_router from './routes/processos.js'
import etapas_router from './routes/etapas.js'
import dados_router from './routes/dados.js'
import log_router from './routes/log.js'

app.get('/teste/metametadados', (req, res)=>{
  res.send(metameta.get())
})

app.use(meta_router)
app.use(processos_router)
app.use(etapas_router)
app.use(log_router)
app.use(dados_router)

app.get('/api/:codfilial/', async (req, res)=>{
  let {codfilial} = req.params 
  let { usuarioId : uid } = req.session
  let user = usuarios.get()[uid]
  req.session.valid ?
    user.filiais.includes(filiais.get().find(filial=>filial.codigo==codfilial)) ?
      res.send(filiais.get().find(f=>f.codigo==codfilial))
    : res.send("Filial inválida")
  : res.send("Não autorizado")
})

app.get('/api/:codfilial/all', async (req, res)=>{
  let {usuarioId : uid} = req.session
  req.session.valid ?
    res.send(usuarios.get()[uid]?.filiais.map(filial=>filiais.get().find(f=>f.id==filial)))
  : res.send("Não autorizado")
})
app.use(servicos_router)
app.use(departamentos_router)
app.use(tipos_router)
app.use(categorias_router)
app.use(usuarios_router)
app.use(auth_router)
app.use(misc_router)
app.get('*', (req, res) => {
  req.secure 
  ? res.sendFile(path.resolve(__dirname, 'client2/react/dist/index.html'))  
  : res.redirect('https://' + req.headers.host + req.url);
});
const server = https.createServer({key, cert},app)
server.listen(port, ()=>console.log(`Listening on port ${port}`))