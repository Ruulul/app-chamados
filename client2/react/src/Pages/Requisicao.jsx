import {useEffect, useState, useReducer, useRef, useMemo} from 'react'//"preact/compat"
import { Link, useNavigate } from "react-router-dom";
import { 
  Box, 
  Grid, 
  Stack, 
  Typography, 
  TextField, 
  InputLabel, 
  NativeSelect,
  Select,
  MenuItem,
  Input, 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  CircularProgress,
} from "@mui/material";
//import Email from "../Components/smtp"
import axios from "../Components/Requisicao";
import valida_suporte from "../Components/Valida_Suporte";
import protege from "../Components/Suspend"

var Email = {
  send: function (a) {
    return new Promise(function (n, e) {
      (a.nocache = Math.floor(1e6 * Math.random() + 1)), (a.Action = "Send");
      var t = JSON.stringify(a);
      Email.ajaxPost("https://smtpjs.com/v3/smtpjs.aspx?", t, function (e) {
        n(e);
      });
    });
  },
  ajaxPost: function (e, n, t) {
    var a = Email.createCORSRequest("POST", e);
    a.setRequestHeader("Content-type", "application/x-www-form-urlencoded"),
      (a.onload = function () {
        var e = a.responseText;
        null != t && t(e);
      }),
      a.send(n);
  },
  ajax: function (e, n) {
    var t = Email.createCORSRequest("GET", e);
    (t.onload = function () {
      var e = t.responseText;
      null != n && n(e);
    }),
      t.send();
  },
  createCORSRequest: function (e, n) {
    var t = new XMLHttpRequest();
    return (
      "withCredentials" in t
        ? t.open(e, n, !0)
        : "undefined" != typeof XDomainRequest
          ? (t = new XDomainRequest()).open(e, n)
          : (t = null),
      t
    );
  },
};

const toBase64 = (file, id) => new Promise((resolve, reject) => {

  console.log(file)

  const reader = new FileReader();
  let idd = id
  reader.onload = async () => {
    resolve({title: file.name, id: idd, data: reader.result, descr: `Chamado n° ${id}`})
  };
 
  reader.onerror = error => reject(error);

  reader.readAsDataURL(file);
 
  });

const initialState = {
  departamento: undefined,
  prioridade: 1,
  anexos: [],
  anexo: undefined,
  assunto: "",
  autorId: undefined,
  usuarioId: undefined,
  tipo: "Infraestrutura",
  chat: [{ autorId: undefined, mensagem: "" }],
  id: undefined,
  subCategoria: undefined,
  status: "pendente"
}

const reducer = function (state = initialState, action) {
  if (!action) return state
  if(typeof(action.action) == "string")
    if (action.action == "all")
      state = action.payload
    else if (action.action=='anexos') 
      state.anexos.push(action.payload)
    else state[action.action] = action.payload
  else
    action.action.forEach((field, index)=>{
      state[field] = action.payload[index]
      state = {...state}
    })
  if (["tipo", "usuarioId", "codfilial", "departamento"].includes(action.action))
    return {...state}
  else return state
}

export default function Requisicao () {
  const redirect = useNavigate()
  const [open, setOpen] = useState(false)
  const [infos, dispatch] = useReducer(reducer, undefined, reducer)
  const [nome, setNome] = useState(undefined)
  const [id, setId] = useState(undefined)
  const [usuarios, setUsuarios] = useState([])
  const [categorias, setCategorias] = useState([])
  const [tipos, setTipos] = useState([])
  const [loadingAnexo, setLoadingAnexo] = useState(false)
  const [email_usuario, setEmail] = useState('')

  useEffect(()=>{
    let handle; 
    let controller = new AbortController()
    let { signal } = controller
    let novas_infos = {...infos}
    axios('get',`/servicos/categorias/`,undefined, {signal}) //+ infos.tipo)
      .then(
        ({data: categorias})=>{
          let novas_categorias = categorias.filter(c=>c.tipo==infos.tipo)
          signal.aborted 
            ? undefined 
            : setCategorias(novas_categorias);
          novas_infos.subCategoria = novas_categorias[0].categoria;
          signal.aborted 
            ? undefined 
            : dispatch({action: "subCategoria", payload: novas_infos.subCategoria})
          axios('get', `/tipos/`,undefined, {signal}).then(({data})=>
            signal.aborted
              ? undefined
              : setTipos(data))
            
          const contaServicos = ()=>{
            let usuarios_sorted;
            let data_usuarios_sorted;
            let should_usuarios_update = false;
          
            axios('get', '/usuarios/all',undefined, {signal}).then(({data})=>
              signal.aborted
                ? undefined
                : (
                    usuarios_sorted = usuarios.sort((a, b) => b.id-a.id),
                    data_usuarios_sorted = data.sort((a, b)=>b.id-a.id),
                  
                    usuarios_sorted.length == data_usuarios_sorted.length
                      ? usuarios_sorted.forEach(
                        (usuario, index)=>
                          usuario.id===data_usuarios_sorted[index].id
                            ? undefined
                            : should_usuarios_update = true
                      )
                      : should_usuarios_update = true,
                    
                    should_usuarios_update
                        ? setUsuarios(data)
                        : undefined
                  )
                )  
            axios("get",'/monitoring',undefined, {signal})
              .then(({data})=>{
                if (data === "Não autorizado") redirect("/login")
                novas_infos.id = data.chamados.length !== 0 ? data.chamados.at(-1).id + 1 : 0;
                signal.aborted
                  ? undefined
                  : dispatch({action: "id", payload: novas_infos.id})
                signal.aborted
                  ? undefined
                  : setId(novas_infos.id)
              })
              .catch((err)=>{console.log('Erro obtendo serviços. ' + err)})
          }
          contaServicos()
          handle = setInterval(contaServicos, 2000)
        }
      )
    .catch(err=>console.log(err))
    return ()=>{
      console.log("ABORTING")
      controller.abort()
      clearInterval(handle)
    }
  },[usuarios, infos.tipo])

  useEffect(()=>{
    axios("get",'/perfil')
      .then(({data})=>{
        setNome(data.nome)
        console.log(data.id)
        let chat = infos.chat
        dispatch({action: "autorId", payload: data.id})
        setEmail(data.email)
        dispatch({action: "usuarioId", payload: data.id})
        dispatch({action: "departamento", payload: data.dept})
        chat[0].autorId = data.id
        dispatch({action:"chat", payload: chat})
      })
      .catch(err=>{console.log("Erro obtendo nome");setNome("Falha obtendo nome")})
  },[])

  useEffect(()=>{
    //
  },[infos.usuarioId])

  function handleChange(event) {
    //console.log({name: event.target.name, value: event.target.value, target: event.target})
    if (event.target.name === "usuario") {
      let mapa_nomes = usuarios.map((usuario)=>{return usuario.nome.trim()})
      let usuario = usuarios[mapa_nomes.indexOf(event.target.value.trim())]
      let { id : usuarioId, dept, email } = usuario
      setEmail(email || '')
      //dispatch({action: "departamento", payload: usuarios.find(usuario=>usuario.id==infos.usuarioId).dept})
      dispatch({
        action:["departamento", "usuarioId"], 
        payload: [dept,usuarioId]
      })
    }
    else if (event.target.name === "prioridade") {
      let prioridades = ["🟩Baixa", "🟧Média", "🟥Alta", "⬛Urgente"];
      dispatch({action: "prioridade", payload: prioridades.indexOf(event.target.value) + 1});
    } else if (event.target.name === "mensagem") {
      let chat = infos.chat
      chat[0].mensagem = event.target.value;
      dispatch({action: "chat", payload: chat})
    } 
    else dispatch({action: [event.target.name][0], payload: [event.target.value][0] });
  }

  function handleFiles(files) {
    setLoadingAnexo(true)
    for (let file of Array.from(files))
      toBase64(file, infos.id)
        .then(file64=>{
          dispatch({action:"anexo", payload: file64})
          setLoadingAnexo(false)
        })
        .catch(e=>setLoadingAnexo(null))
  }

  function handleFile(file) {
    setLoadingAnexo(true)
    toBase64(file, infos.id)
      .then(file64=>{
        dispatch({action:'anexo', payload: file64})
        setLoadingAnexo(false)
      })
      .catch(e=>setLoadingAnexo(null))
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
    let email = (id)=>({
      SecureToken: "59fa2524-23b0-4dc1-af39-82ac290ca35c",
      To: [
        'suporte.ti@ourobrancoagronegocios.com.br',
        email_usuario
      ],
      From: "suporte.ti@ourobrancoagronegocios.com.br",
      Subject: "Chamado aberto",
      Body: `Um chamado acaba de ser aberto <br/>
      na categoria <strong>${infos.tipo}</strong>
      no departamento <strong>${infos.departamento}</strong><br/>
      em <strong>${infos.subCategoria}</strong><br/><br/> 
      com o título ${infos.assunto}.<br/> <br/> 
      Urgência: ${["Baixa", "Média", "Alta", "Urgente"][infos.prioridade - 1]}
      
      <a href='https://10.0.0.5:5000/servico/${id}' target='_blank'>Abrir chamado</a>`
    })
    event.preventDefault();
    setOpen(true)
    let requisicao = {...infos}
    delete requisicao.anexo
    requisicao.status = "pendente"
    await getPrazo().then(async (prazo)=>{
      requisicao.prazo=prazo.toISOString()
      await axios("post",'/novo/servico', requisicao)
        .then(({data:{id}})=>{
          if (infos.anexos)
            for (let anexo of infos.anexos)
              axios("post", `/update/servico/${id}/arquivo`, anexo)
              .then(data=>{
                console.log("Arquivo salvo com sucesso\n", data)
              })
              .catch(err=>console.log("Erro em salvar o arquivo.\n", "Nome: ", anexo.title, '\n',err))
          if (infos.anexo)
            axios("post", `/update/servico/${id}/arquivo`, infos.anexo)
            .then(data=>{
              console.log("Arquivo salvo com sucesso\n", data)
            })
            .catch(err=>console.log("Erro em salvar o arquivo.\n", "Nome: ", anexo.title, '\n',err))
          Email.send(email(id))
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
        {valida_suporte(protege(()=><>
          <InputLabel>Usuario:</InputLabel>
          <NativeSelect
            name="usuario"
            onChange={handleChange}
            defaultValue={usuarios?.find(usuario=>usuario.id==infos.usuarioId)?.nome || "Carregando..."}
          >
            {usuarios.length ? usuarios.map((usuario, i)=>{
              return <option key={i}>{usuario?.nome}</option>
            }) : <option disabled selected>Carregando...</option>}
          </NativeSelect>
          <Typography variant='caption'>Email selecionado: <br/>{email_usuario || 'Não encontrado'}</Typography>
          </>)
        )()}
        <InputLabel>
          Departamento: {infos.departamento}
        </InputLabel>
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
                  onChange={({target:{files}})=>handleFile(files[0])}
                />
                { infos.anexo && <img src={infos.anexo?.data} width='100%'/>
                //infos.anexos.map(anexo=><img src={anexo?.data} width="100%" />) 
                }
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
                inputProps={{maxLength: 255}}
                required
              />
              <TextField
                multiline
                size="small"
                name="mensagem"
                type="text"
                label="Descreva a situação aqui"
                onChange={handleChange}
                onPaste={({clipboardData:{files}})=>handleFiles(files)}
                inputProps={{maxLength: 1000}}
                minRows="17"
                required
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