import {Grid, Card, Typography, Box, Fade, Divider, Stack, CardMedia} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [contagem, setContagem] = useState({pendentes: 0, novos: 0, atendimento: 0, parados: 0})
  const [nome, setNome] = useState("Carregando...")
  const [contagemPrazo, setPrazo] = useState({vencidos: 0, hoje: 0, semana: 0})

  const redirect = useNavigate()
  useEffect(()=>{
    axios.get('http://10.0.0.83:5000/api/perfil', { withCredentials: true })
      .then(({data})=>{
        if (data === "Não autorizado") redirect("/login")
        setNome(data.nome)
      })
      .catch(err=>{console.log("Erro obtendo nome");setNome("Falha obtendo nome")})
  },[])
  useEffect(()=>{
    const getServicos = ()=>{
      axios.get('http://10.0.0.83:5000/api/servicos/status/pendente', {withCredentials: true})
        .then(({data})=>{
          if (data === "Não autorizado") redirect("/login")
          let novaContagem = {pendentes: data.length, novos: 0, atendimento: 0, parados: 0}
          let novoPrazo = {vencidos: 0, hoje: 0, semana: 0}
          let hoje = new Date()
          let semana = new Date()
          let amanha = new Date()
          semana.setDate(hoje.getDate() + (5 + 7 - hoje.getDay()) % 7)
          amanha.setDate(hoje.getDate() + 1)
          data !== "Não autorizado" ? data.forEach((servico, i) => {
            //console.log(i)
            //console.log(hoje)
            //console.log(amanha)
            //console.log(semana)
            let prazo = new Date(servico.prazo)
            //console.log(prazo)
            if (prazo < hoje)
              novoPrazo.vencidos += 1
            if (prazo.toDateString() === hoje.toDateString())
              novoPrazo.hoje += 1
            if (prazo > amanha && prazo <= semana)
              novoPrazo.semana += 1
            if (servico.createdAt.split('T')[0] === hoje.toISOString().split('T')[0])
              novaContagem.novos += 1
            if (servico.atendimento === "true")
              novaContagem.atendimento += 1
          }) : undefined
          novaContagem.parados = novaContagem.pendentes - novaContagem.atendimento
          setContagem(novaContagem)
            setPrazo(novoPrazo)
        })
        .catch(err=>console.error("Erro obtendo serviços.\n"+err));
      return ()=>{setServicos(undefined)}
    }
    let interval = setInterval(getServicos, 500)
    return ()=>{
      clearInterval(interval)
    }
  },[])
  return (
    <>
    <Grid container spacing={2} component={Card} elevation={5} xs={12} md={6} lg={4} xl={3} sx={{padding: 3, marginTop: 3, zIndex:1}}>
      <Grid item xs={12}>
            <Stack direction="row" alignItems="flex-end" justifyContent="space-evenly">
                <Typography variant="h5" component="h5" sx={{fontWeight: 500}}>
                  {nome !== "Carregando..." && nome !== "Falha obtendo nome" 
                  ? "Olá," : undefined }
                </Typography>
                <Typography component="h5" variant="h6" color="secondary" sx={{fontWeight: 700}}>
                  {nome}
                </Typography>
            </Stack>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5">
          Tickets abertos:
        </Typography>
        <Divider sx={{backgroundColor: "#2DB5FA", borderWidth:1, width:1}} />
      </Grid>
      <Grid item container xs={12}>
        <Grid item xs={6}>
            <Stack spacing={1} align="left" justifyContent="space-evenly">
            <Typography variant="h6">{contagem.pendentes} pendentes</Typography>
            <Typography variant="h6">{contagem.parados} parados</Typography>
            <Typography variant="h6">{contagem.atendimento} em atendimento</Typography>
            </Stack>
        </Grid>
        <Grid item xs={6}>
            <Card elevation={6} sx={{paddingTop: 5, paddingX: 3, width: 100, height: 100, marginTop: 0, marginLeft: {sx: 0, md: 4, lg: 2, xl: 3}}}>
                  <Typography variant="h4" align="center"> {contagem.novos} </Typography>
                  <Typography variant="h5" align="center"> novo{contagem.novos !== 1 ? 's' : undefined} </Typography> 
            </Card>
        </Grid>
      </Grid>
      
      <Grid item xs={12}>
        <Divider sx={{backgroundColor: "#2DB5FA", borderWidth:1, width:1}} />
      </Grid>

      <Grid item xs={12}>
        <Stack spacing={1}>
        <Typography variant="h5" pb={3}>
          Vencimentos
        </Typography>
        <Typography>
        🟥 {contagemPrazo.vencidos} vencidos
        </Typography>
        <Typography>
        🟨 {contagemPrazo.hoje} vencem hoje
        </Typography>
        <Typography>
        🟩 {contagemPrazo.semana} vencem essa semana
        </Typography>
        </Stack>
      </Grid>
    </Grid>
    </>
  );
};

export default Home;

//<CardMedia image="http://10.0.0.83:5000/images/silos2.jpeg" sx={{zIndex: -1, height:"90vh",width:"100vw", left: 0, opacity: 1, position: "absolute"}} />
    