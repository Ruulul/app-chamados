import {
  Grid,
  Card,
  Typography,
  Box,
  Fade,
  Divider,
  Stack,
  Avatar,
  CircularProgress,
  CardMedia
} from "@mui/material";
import axios from "../Components/Requisicao";
import Calendar from '../Components/Calendar';
import { useEffect, useMemo, useState, Fragment } from 'react'//"preact/compat";
import { useNavigate } from "react-router-dom";
import valida from "../Components/Valida_Privilegio";
import protege from "../Components/Suspend";

const conversao = [
    "Jan",    "Jan",
    "Feb",    "Fev",
    "Mar",    "Mar",
    "Apr",    "Abr",
    "May",    "Mai",
    "Jun",    "Jun",
    "Jul",    "Jul",
    "Aug",    "Ago",
    "Sep",    "Set",
    "Oct",    "Out",
    "Nov",    "Nov",
    "Dec",    "Dez",
  ];
/* SmtpJS.com - v3.0.0 */
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
const Home = () => {
  const [contagem, setContagem] = useState({
    pendentes: 0,
    novos: 0,
    atendimento: 0,
    parados: 0,
  });
  const [nome, setNome] = useState("Carregando...");
  const [contagemPrazo, setPrazo] = useState({
    vencidos: 0,
    hoje: 0,
    semana: 0,
  });

  const hoje = valida(Calendar)()

  const redirect = useNavigate();
  useEffect(() => {
    axios(
      "get", "/perfil")
      .then(({ data }) => {
        if (data === "Não autorizado") redirect("/login");
        setNome(data.nome);
      })
      .catch(() => {
        console.log("Erro obtendo nome");
        setNome("Falha obtendo nome");
      });
  }, []);
  useEffect(() => {
    const signal_controller = new AbortController()
    const signal = signal_controller.signal
    const getServicos = () =>
      axios(
        "get", "/servicos?filtro=status,pendente", 1500, {signal})
        .then(({ data }) => {
          if (data === "Não autorizado") redirect("/login");
          let novaContagem = {
            pendentes: data.count,
            novos: 0,
            atendimento: 0,
            parados: 0,
          };
          let novoPrazo = { vencidos: 0, hoje: 0, semana: 0 };
          let hoje = new Date();
          let semana = new Date();
          let amanha = new Date();
          semana.setDate(hoje.getDate() + ((1 + 7 - hoje.getDay()) % 7));
          amanha.setDate(hoje.getDate() + 1);
          hoje = hoje.toISOString();
          semana = semana.toISOString();
          amanha = amanha.toISOString();
          data !== "Não autorizado"
            ? data.page.forEach((servico) => {
              //console.log(i)
              //console.log(hoje)
              //console.log(amanha)
              //console.log(semana)
              let prazo = servico.prazo;
              //console.log(prazo)
              if (prazo < hoje) novoPrazo.vencidos += 1;
              if (prazo.split("T")[0] === hoje.split("T")[0])
                novoPrazo.hoje += 1;
              if (prazo > amanha && prazo <= semana) novoPrazo.semana += 1;
              if (servico.createdAt.split("T")[0] === hoje.split("T")[0])
                novaContagem.novos += 1;
              if (servico.atendimento === "true")
                novaContagem.atendimento += 1;
            })
            : undefined;
          novaContagem.parados =
            novaContagem.pendentes - novaContagem.atendimento;
          setContagem(novaContagem);
          setPrazo(novoPrazo);
        })
        .catch((err)=><Typography>{"Erro obtendo serviços.\n" + err}</Typography>);
    getServicos();
    let interval = setInterval(()=>signal.aborted?console.log("getServicos is aborted"):getServicos(), 500);
    console.log("getServicos cycle created")
    return () => {
      signal_controller.abort()
      clearInterval(interval);
      console.log("getServicos cycle ended")
    };
  }, []);

  return (
    nome == "Carregando..." ?
      <CircularProgress sx={{ display: "grid", margin: "auto", align:"center", marginTop: "30vh", transform: "scale(3)" }} /> :
	<Grid container
        justifyContent="space-evenly"
		margin="auto">
      <Grid
        container
        item
        xs={12}
		lg={3}
        display="flex"
        direction="column"
      >
        <Infos nome={nome} contagem={contagem} vencimento={contagemPrazo} />
          {hoje}
		</Grid>
		<Grid 
		component={Card}
		elevation={5}
		margin={3}
		marginBottom={10}
		item
		xs={12}
		lg={7}
		sx={{'& *':
			{
				padding: 1
			},
		}}
		>
			<Stack direction="row" align="right" justifyContent="flex-end" margin={3} marginBottom={0} paddingBottom={0}>
				<Typography variant="h4" height="fit-content" >
					Atendentes
				</Typography> 
				<CardMedia image="https://10.0.0.5:5000/images/call-center-assistant-pngrepo-com.png" 
				sx={{width:50, height: 50, position: "relative", bottom: 15}} 
				/>
			</Stack>
			<Stack>
				<Divider margin="auto" width="75%" sx={{margin:"auto"}}/>
				<Stack display="flex" direction="row" sx={{margin: "auto"}}>
					<Avatares />
				</Stack>
			</Stack>
		</Grid>
	</Grid>
  );
};

function Avatares(props) {
	const [avatares, setAvatares] = useState(undefined)
	async function getAvatares(signal) {
		return await axios("get", "/monitoring", undefined, {signal})
		.then(({data})=>data?.atendentes?.map(
			(atendente, key)=>{
				let date_today = Date().split(' ')
        let convert = (date)=>`${date[3]}-${String(Math.floor(conversao.indexOf(date[1])/2 + 1)).padStart(2, '0')}-${date[2]}`
        let date_7days = new Date(Date.now()-6.048e8).toString().split(' ')
				let chamados_todos = data.chamados.filter(chamado=> chamado.atendenteId==atendente.id)
        let chamados_abertos = chamados_todos.filter(chamado => chamado.status == 'pendente' || chamado.status == 'resolvido')
        let resolvido = chamados_abertos.filter(chamado=> chamado.status == "resolvido")
        let atendimento = chamados_abertos.filter(chamado=> chamado.atendimento == "true" && chamado.status == 'pendente')
        let fechado_hj = chamados_todos.filter(chamado=> chamado.status == "fechado" && chamado.updatedAt.split('T')[0] == convert(date_today))
        let fechado_7dias = chamados_todos.filter(chamado=> chamado.status == "fechado" && chamado.updatedAt.split('T')[0] >= convert(date_7days))
        return <CAvatar 
				key={key} 
				nome={atendente.nome}
				atendimento={atendimento.length}
				fechado_hj={fechado_hj.length}
        fechado_7dias={fechado_7dias.length - fechado_hj.length}
        resolvido={resolvido.length}
				src={
					atendente.nome == "Valdenor" ?
					'https://10.0.0.5:5000/images/profile/v.jpg'
					:
					atendente.nome == "João Batista" ?
					'https://10.0.0.5:5000/images/profile/joao.jpg'
					: 
					atendente.nome == "Wesley" ?
					'https://10.0.0.5:5000/images/profile/wesley.jpeg'
					: null
				}
				{...props}
				/>
			}))
		.catch(err=><Typography {...props.err}>{(console.log(err), err.message)}</Typography>)
	}
	useEffect(()=>{
    let controller_signal = new AbortController()
    let signal_avatares = controller_signal.signal
		let interval = setInterval(async()=>{
        let avatares = await getAvatares(signal_avatares)
        if (!signal_avatares.aborted)
				  setAvatares(avatares)
		}, 2000)
		return ()=> {
      controller_signal.abort()
      clearInterval(interval)
    }
	}, [])
	return avatares ? avatares : <CircularProgress sx={{mt: "20vh"}}/>
}

function CAvatar({nome="Fulano", atendimento=0, parado=0, fechado_hj=0, fechado_7dias=0, resolvido=0, src, ...props}) {
	return <Card {...props} sx={{height: "fit-content", padding: 0, paddingX: 4, margin: 3, marginX: 1.5, ...props.sx}} elevation={5}>
		<Avatar sx={{margin: "auto", width: 100, height: 100, padding: 0, mt: 1}} {...{src}} alt={nome}/>
		<Typography align="center" mt={1}>{nome}</Typography>
		<Typography variant="body2">Tickets atribuídos</Typography>
		<Divider/>
		<Typography variant="body2" margin={1}> {atendimento} em atendimento </Typography>
		<Typography variant="body2" margin={1}> {fechado_hj} fechados hoje </Typography>
		<Typography variant="body2" margin={1}> outros {fechado_7dias} fechados nessa semana </Typography>
    <Typography variant="body2" margin={1}> {resolvido} aguardando finalização </Typography>
	</Card>
}	

function Nome({ nome }) {
  let cumpr = 
  <Typography variant="h5" component="h5" sx={{ fontWeight: 500 }}>
    {nome !== "Carregando..." && nome !== "Falha obtendo nome"
      ? "Olá,"
      : undefined}
  </Typography>
  let exibe_nome =
  <Typography component="h5" variant="h6" color="secondary">
    <strong>{nome}</strong>
  </Typography>
  return (
    <Grid item xs={12}>
      <Stack
        direction="row"
        alignItems="flex-end"
        justifyContent="space-evenly"
      >
        {cumpr}
        {exibe_nome}
      </Stack>
    </Grid>
  )
}

function Contagem({ contagem }) {
  let card_novos =
    <Grid item xs={6}>
      <Card
        elevation={6}
        sx={{
          paddingTop: 5,
          paddingX: 3,
          width: 100,
          height: 100,
          marginTop: 0,
          marginLeft: { sx: 0, md: 4, lg: 2, xl: 3 },
        }}
      >
        <Typography variant="h4" align="center">
          {" "}
          {contagem.novos}{" "}
        </Typography>
        <Typography variant="h5" align="center">
          {" "}
          novo{contagem.novos !== 1 ? "s" : undefined}{" "}
        </Typography>
      </Card>
    </Grid>
  let tickets =
    <Grid item xs={6}>
      <Stack spacing={1} align="left" justifyContent="space-evenly">
        <Typography variant="h5">
          <strong>{contagem.pendentes} pendentes</strong>
        </Typography>
        <Typography variant="h6">
          {contagem.parados} parados
        </Typography>
        <Typography variant="h6">
          {contagem.atendimento} em atendimento
        </Typography>
      </Stack>
    </Grid>
  let title =
    <Grid item xs={12}>
      <Typography variant="h5">Tickets abertos</Typography>
      <Divider
        sx={{ backgroundColor: "#2DB5FA", borderWidth: 1, width: 1, mb: 3 }}
      />
    </Grid>
  return (
    <Grid item container xs={12}>
      {title}
      {tickets}
      {card_novos}
    </Grid>
  )
}

function Vencimento({ vencimento }) {
  let title =
    <Grid item xs={12}>
      <Typography variant="h5">Vencimentos</Typography>
      <Divider
        sx={{ backgroundColor: "#2DB5FA", borderWidth: 1, width: 1 }}
      />
    </Grid>
  let vencimentos =
    <Grid item xs={12}>
      <Stack spacing={1} mt={3}>
        <Typography>🟥 {vencimento.vencidos} vencidos</Typography>
        <Typography>🟨 {vencimento.hoje} vencem hoje</Typography>
        <Typography>
          🟩 {vencimento.semana} vencem essa semana
        </Typography>
      </Stack>
    </Grid>
  return (
    <Grid item container xs={12}>
      {title}
      {vencimentos}
    </Grid>
  )
}

function Infos({ nome, contagem, vencimento }) {
  return (

    <Grid
      item
      container
      spacing={2}
      component={Card}
      elevation={5}
      sx={{ padding: 3, marginTop: 3 }}
    >
      <Nome nome={nome} />
      <Contagem contagem={contagem} />
      <Vencimento vencimento={vencimento} />
    </Grid>
  )
}

function DiaDeHoje() {
  console.log("Dia de hoje re-render")
  let agora = Date().split(" ");
  let mes =
    <Typography
      align="center"
      paddingTop={3}
      paddingBottom={2}
      variant="h4"
      sx={{ backgroundColor: "#B71B00", color: "#E6E6E6" }}
    >
      {conversao[conversao.indexOf(agora[1]) + 1]}
    </Typography>
  let dia =
    <Typography align="center" marginTop={3} pb={3} variant="h1">
      {agora[2]}
    </Typography>
  return (
    <Grid
      item
      component={Card}
	  display={{xs: 'none', lg: 'block'}}
      elevation={5}
      sx={{ padding: 0, maxHeight: 250, margin: 10, marginLeft: {xs: "30%", lg: -2}, marginRight: {xs: "30%", lg: 22} }}
    >
      {mes}
      {dia}
    </Grid>
  )
}

export default Home;

/*
      <MChat
      sx={{
        position: "fixed",
        bottom: 0,
        right: 0,
        margin: 10,
        zIndex: 2
      }}/> */
//<CardMedia image="https://10.0.0.83:5000/images/silos2.jpeg" sx={{zIndex: -1, height:"90vh",width:"100vw", left: 0, opacity: 1, position: "absolute"}} />
