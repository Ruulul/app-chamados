import {useEffect, useState, useReducer} from "react"
import { Link, useNavigate } from "react-router-dom";
import { 
  Box, 
  Grid, 
  Stack, 
  Typography, 
  TextField, 
  InputLabel, 
  NativeSelect,
  Input, 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  CircularProgress,
} from "@mui/material";
import Email from "../Components/smtp"
import axios from "../Components/Requisicao";
import FormData from "form-data"

const toBase64 = (file, id) => new Promise((resolve, reject) => {

  console.log(file)

  const reader = new FileReader();
 
  reader.onload = () => {console.log(reader.result); resolve({title: file.name, data: reader.result, descr: `Chamado n° ${id}`})};
 
  reader.onerror = error => reject(error);

  reader.readAsDataURL(file);
 
  });

const initialState = {
  departamento: "Contábil",
  prioridade: 1,
  anexo: undefined,
  assunto: "",
  autorId: undefined,
  tipo: "Infraestrutura",
  chat: [{ autorId: undefined, mensagem: "" }],
  id: undefined,
  subCategoria: undefined,
  atendenteId: undefined,
  status: "pendente",
}

const reducer = function (state = initialState, action) {
  if (!action) return state
  if(typeof(action.action) == "string")
    if (action.action == "all")
      state = action.payload
    else state[action.action] = action.payload
  else
    action.action.forEach((field, index)=>{
      state[field] = action.payload[index]
    })
  if (action.action == "tipo")
    return {...state}
  else return state
}

export default function Requisicao () {
  const redirect = useNavigate()
  const [open, setOpen] = useState(false)
  const [infos, dispatch] = useReducer(reducer, undefined, reducer)
  const [, forceUpdate] = useState({})
  const [nome, setNome] = useState(undefined)
  const [id, setId] = useState(undefined)
  const [atendentes, setAtendentes] = useState([])
  const [categorias, setCategorias] = useState([])
  const [tipos, setTipos] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [loadingAnexo, setLoadingAnexo] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{
    let handle; 
    axios("get",'/api/usuarios/area/' + infos.tipo)
    .then(async ({data: atendentes})=>{
      setAtendentes(atendentes)
      let novas_infos = {...infos}
      novas_infos.atendenteId = atendentes[0].id
      return await axios('get','/api/servicos/categorias/') //+ infos.tipo)
      .then(
        ({data: categorias})=>{
          let novas_categorias = categorias.filter(c=>c.tipo==infos.tipo)
          setCategorias(novas_categorias);
          novas_infos.subCategoria = novas_categorias[0].categoria;
          dispatch({action: ["atendenteId", "subCategoria"], payload: [novas_infos.atendenteId, novas_infos.subCategoria]})
          axios('get', '/api/tipos/').then(({data})=>setTipos(data))
          axios('get', '/api/departamentos').then(({data})=>setDepartamentos(data))
          const contaServicos = ()=>{
            axios("get",'/api/monitoring')
              .then(({data})=>{
                if (data === "Não autorizado") redirect("/login")
                novas_infos.id = data.chamados.length !== 0 ? data.chamados.at(-1).id + 1 : 0;
                dispatch({action: "id", payload: novas_infos.id})
                setId(novas_infos.id)
              })
              .catch((err)=>{console.log('Erro obtendo serviços. ' + err)})
          }
          contaServicos()
          handle = setInterval(contaServicos, 2000)
        }
      )
    }).catch(err=>{console.log("Erro obtendo atendentes. \n:" + err); setAtendentes([{nome: "Sem atendentes nessa categoria"}])})
		.catch(err=>console.log(err))
    return ()=>clearInterval(handle)
  },[infos.tipo])

  useEffect(()=>{
    axios("get",'/api/perfil')
      .then(({data})=>{
        setNome(data.nome)
        console.log(data.id)
        let chat = infos.chat
        dispatch({action: "autorId", payload: data.id})
        chat[0].autorId = data.id
        dispatch({action:"chat", payload: chat})
      })
      .catch(err=>{console.log("Erro obtendo nome");setNome("Falha obtendo nome")})
  },[])

  function handleChange(event) {
    //console.log({name: event.target.name, value: event.target.value, target: event.target})
    if (event.target.name === "atendente") {
      let atendenteId = atendentes[(atendentes.map((atendente)=>{return atendente.nome})).indexOf(event.target.value)].id
      dispatch({action:"atendenteId", payload: atendenteId})
    }
    else if (event.target.name === "prioridade") {
      let prioridades = ["🟩Baixa", "🟧Média", "🟥Alta", "⬛Urgente"];
      dispatch({action: "prioridade", payload: prioridades.indexOf(event.target.value) + 1});
    } else if (event.target.name === "mensagem") {
      let chat = infos.chat
      chat[0].mensagem = event.target.value;
      dispatch({action: "chat", payload: chat})
    } else if (event.target.name === "anexo") {
      setLoadingAnexo(true)
      toBase64(event.target.files[0], infos.id)
        .then(file64=>{
          dispatch({action:"anexo", payload: file64})
          setLoadingAnexo(false)
        })
        .catch(e=>setLoadingAnexo(null))
    }
    else dispatch({action: [event.target.name][0], payload: [event.target.value][0] });
  }

  async function getPrazo() {
    let data = new Date()
    switch (infos.prioridade) {
      case 1:
        data.setDate(data.getDate()+7)
        return data;
      case 2:
        data.setDate(data.getDate()+3)
        return data;
      case 3:
        data.setDate(data.getDate()+1)
        return data;
      case 4:
        data = new Date(data.getTime()+28800000)
        return data;
      default:
        return "Isso não devia acontecer"
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setOpen(true)
    let requisicao = {...infos}
    delete requisicao.anexo
    requisicao.status = "pendente"
    await getPrazo().then(async (prazo)=>{
      requisicao.prazo=prazo.toISOString()
      await axios("post",'/api/novo/servico', requisicao)
        .then(()=>{
          if (infos.anexo) {
            let anexo = new FormData(infos.anexo)
            axios("post", `/api/update/servico/${infos.id}/arquivo`, anexo, {headers: {'Content-Type': 'multipart/form-data'}})
            .then(data=>{
              console.log("Arquivo salvo com sucesso")
              Email.send({
                SecureToken: "59fa2524-23b0-4dc1-af39-82ac290ca35c",
                To: atendentes.find(a=>a.id==infos.atendenteId).email,
                From: "suporte.ti@ourobrancoagronegocios.com.br",
                Subject: "Chamado aberto",
                Body: 
                `Um chamado acaba de ser aberto <br/>
                por ${nome} <br/>
                na categoria ${infos.tipo} <br/>
                no departamento ${infos.departamento}<br/> 
                com o título ${infos.assunto}.<br/> <br/> 
                Conteúdo do chamado: ${infos.chat[0].mensagem}<br/><br/>
                Urgência: ${
                  (["Baixa", "Média", "Alta", "Urgente"])
                  [(["Baixa", "Média", "Alta", "Urgente"]).indexOf(infos.prioridade - 1)]}`
              }).then(console.log)
            })
            .catch(err=>console.log("Erro em salvar o arquivo.\n",err))
          }
        })
        .catch(err=>console.log("Erro em salvar o chamado." + err))
    }).catch(console.log)
  }
  return (
    <Box sx={{ mt: "1em" }} component="form" onSubmit={handleSubmit}>
      <Dialog open={open} onClose={()=>{redirect('/servicos');setOpen(false)}}>
        <DialogContent p={2}>
          <DialogContentText>
            Seu chamado será atendido dentro de {["uma semana", "3 dias", "um dia", "algumas horas"][infos.prioridade - 1]}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" padding={3} onClick={()=>{redirect('/servicos');setOpen(false)}} autoFocus sx={{width:"fit-content"}}>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
      <Grid
        container
        item
        direction={{ xs: "column-reverse", sm: "row" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Grid item container xs={11} spacing={2} direction={{ xs: "column", sm: "row" }} justifyContent="space-between">
          <Grid item xs={3}>
            <Stack spacing={2}>
              <Typography>
                {id === undefined ?  "Carregando..." : ("Ticket nº " + infos.id)}
              </Typography>
              <Typography>
                {nome === undefined ? "Carregando..." : ("Olá, " + nome)}
              </Typography>
              <InputLabel>Tipo do Chamado: </InputLabel>
              <NativeSelect
                name="tipo"
                onChange={handleChange}
              >
                {tipos.map((tipo, key)=><option {...{key}}>{tipo.tipo}</option>)}
              </NativeSelect>
			  {categorias.filter(c=>c.tipo == infos.tipo).length > 0 ? <>
			  <InputLabel>
				Categoria:
			  </InputLabel>
			  <NativeSelect
				name="subCategoria"
				onChange={handleChange}
			  >
				{categorias.map((categoria,key)=><option key={key}>{categoria.categoria}</option>)}
			  </NativeSelect>
			  </> : undefined}
              <InputLabel>Atendente: </InputLabel>
              <NativeSelect
                name="atendente"
                onChange={handleChange}
              >
                {atendentes.map((atendente, i)=>{
                  return <option key={i} name="atendente">{atendente.nome}</option>
                })}
              </NativeSelect>
              <InputLabel>Departamento: </InputLabel>
              <NativeSelect
                component="select"
                name="departamento"
                onChange={handleChange}
              >
                {departamentos.map((dept, key)=><option {...{key}}>{dept.departamento}</option>)}
              </NativeSelect>
              <InputLabel>Urgência: </InputLabel>
              <NativeSelect
                name="prioridade"
                type="dropdown"
                label="Prioridade: "
                onChange={handleChange}
              >
                <option name="1" style={{}}>🟩Baixa</option>
                <option name="2" style={{}}>🟧Média</option>
                <option name="3" style={{}}>🟥Alta</option>
                <option name="4" style={{}}>⬛Urgente</option>
              </NativeSelect>
              <Stack>
              {loadingAnexo ?
                <CircularProgress/>
              : loadingAnexo === null ?
                <CircularProgress color="error" determinated value={100}/>
                : undefined}
              <InputLabel htmlFor="anexo">Anexo: </InputLabel>
                <Input
                  name="anexo"
                  type="file"
                  onChange={handleChange}
                />
                { infos.anexo &&
                <img src={infos.anexo?.data} width="100%" /> }
              </Stack>
            </Stack>
          </Grid>
          <Grid item container xs={9} justifyContent="space-between">
            <Grid item xs={12} alignItems="stretch">
            <Stack spacing={2}>
              <TextField
                name="assunto"
                size="small"
                label="Assunto"
                type="text"
                onChange={handleChange}
                required
              />
              <TextField
                multiline
                size="small"
                name="mensagem"
                type="text"
                label="Descreva a situação aqui"
                onChange={handleChange}
                minRows="17"
              />
              <Button
                variant="contained"
                sx={{ width: "100%" }}
                name="submit"
                type="submit"
              >
                Enviar
              </Button>
            </Stack>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={0.5}>
          <Button
            variant="contained"
            color="warning"
            component={Link}
            padding={5}
            sx={{
              minWidth: 0,
              minHeight: 0,
              paddingX: 1,
              width: "fit-content",
              height: "fit-content",
              position: "absolute",
            }}
            to="/"
          >
            X
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}