import {useEffect, useState} from "react"
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
} from "@mui/material";
import axios from "../Components/Requisicao";
var Email = { send: function (a) { return new Promise(function (n, e) { a.nocache = Math.floor(1e6 * Math.random() + 1), a.Action = "Send"; var t = JSON.stringify(a); Email.ajaxPost("https://smtpjs.com/v3/smtpjs.aspx?", t, function (e) { n(e) }) }) }, ajaxPost: function (e, n, t) { var a = Email.createCORSRequest("POST", e); a.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), a.onload = function () { var e = a.responseText; null != t && t(e) }, a.send(n) }, ajax: function (e, n) { var t = Email.createCORSRequest("GET", e); t.onload = function () { var e = t.responseText; null != n && n(e) }, t.send() }, createCORSRequest: function (e, n) { var t = new XMLHttpRequest; return "withCredentials" in t ? t.open(e, n, !0) : "undefined" != typeof XDomainRequest ? (t = new XDomainRequest).open(e, n) : t = null, t } };

export default function Requisicao () {
  const redirect = useNavigate()
  const [open, setOpen] = useState(false)
  const [infos, setInfos] = useState({
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
  });
  const [, forceUpdate] = useState({})
  const [nome, setNome] = useState(undefined)
  const [atendentes, setAtendentes] = useState([])
  const [categorias, setCategorias] = useState([])
  const navigate = useNavigate()

  useEffect(()=>{
    const contaServicos = ()=>{
      axios("get",'/api/servicos')
        .then(({data})=>{
          if (data === "Não autorizado") redirect("/login")
          let novasInfos = infos;
          novasInfos.id = data.length !== 0 ? data[data.length-1].id + 1 : 0;
          setInfos(novasInfos)
          forceUpdate({})
        })
        .catch((err)=>{console.log('Erro obtendo serviços. ' + err)})
    }
    let interval = setInterval(contaServicos, 500)
    return ()=>{
      clearInterval(interval)
    }
  }, [])
  
  useEffect(()=>{
	  axios('get','/api/servicos/categorias/') //+ infos.tipo)
		.then(
			({data: categorias})=>{
				setCategorias(categorias.filter(c=>c.tipo==infos.tipo));
				let new_infos = {...infos}; 
				new_infos.subCategoria = categorias.filter(c=>c.tipo==infos.tipo)[0].categoria; 
				setInfos(new_infos)
			}
		)
		.catch(err=>console.log(err))
  },[infos.tipo])

  useEffect(()=>{
    axios("get",'/api/perfil')
      .then(({data})=>{
        setNome(data.nome)
        let novasInfos = infos
        novasInfos.autorId = data.id
        novasInfos.chat[0].autorId = data.id
        setInfos(novasInfos)
      })
      .catch(err=>{console.log("Erro obtendo nome");setNome("Falha obtendo nome")})
  },[])

  useEffect(()=>{
    axios("get",'/api/usuarios/area/' + infos.tipo)
      .then(({data})=>{
        setAtendentes(data)
        let novas_infos = infos
        novas_infos.atendenteId = data[0].id
        setInfos(novas_infos)
      }).catch(err=>{console.log("Erro obtendo atendentes. \n:" + err); setAtendentes([{nome: "Sem atendentes nessa categoria"}])})
  },[infos.tipo])

  function handleChange(event) {
    let novas_infos = infos
    if (event.target.name === "atendente") {
      novas_infos.atendenteId = atendentes[(atendentes.map((atendente)=>{return atendente.nome})).indexOf(event.target.value)].id
    }
    if (event.target.name === "prioridade") {
      let prioridades = ["🟩Baixa", "🟧Média", "🟥Alta", "⬛Urgente"];
      novas_infos[event.target.name] = prioridades.indexOf(event.target.value) + 1;
    } else if (event.target.name === "mensagem")
      novas_infos.chat[0].mensagem = event.target.value;
    else novas_infos[event.target.name] = [event.target.value][0];
    setInfos(novas_infos)
    forceUpdate({})
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
    let requisicao = infos
    requisicao.status = "pendente"
    await getPrazo().then(async (prazo)=>{
      requisicao.prazo=prazo.toISOString()
      await axios("post",'/api/novo/servico', requisicao)
        .then(()=>{
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
                {infos.id === undefined ?  "Carregando..." : ("Ticket nº " + infos.id)}
              </Typography>
              <Typography>
                {nome === undefined ? "Carregando..." : ("Olá, " + nome)}
              </Typography>
              <InputLabel>Tipo do Chamado: </InputLabel>
              <NativeSelect
                name="tipo"
                onChange={handleChange}
              >
              <option key={1} name="infra">
                Infraestrutura
              </option>,
              <option key={2} name="sistemas">
                Sistemas
              </option>,
              <option key={3} name="desenvolvimento">
                Desenvolvimento
              </option>,
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
                onClick={handleChange}
              >
                {atendentes.map((atendente, i)=>{
                  return <option key={i}>{atendente.nome}</option>
                })}
              </NativeSelect>
              <InputLabel>Departamento: </InputLabel>
              <NativeSelect
                component="select"
                name="departamento"
                onChange={handleChange}
              >
              <option key={1} name="contabil">
                Contábil
              </option>,
              <option key={2} name="comercial">
                Comercial
              </option>,
              <option key={3} name="faturamento">
                Faturamento
              </option>,
              <option key={4} name="guarita">
                Guarita
              </option>,
              <option key={5} name="gerencia">
                Gerência
              </option>,
              <option key={6} name="financeiro">
                Financeiro
              </option>,
              <option key={7} name="ccm-ubs">
                CCM UBS
              </option>,
              <option key={8} name="ccm-ob">
                CCM OB
              </option>,
              <option key={9} name="ti">
                TI
              </option>
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
              <InputLabel htmlFor="anexo">Anexo: </InputLabel>
              <Input
                disabled
                name="anexo"
                type="file"
                onChange={handleChange}
                value={infos.anexo}
              />
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