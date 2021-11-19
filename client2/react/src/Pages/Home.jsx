import {Grid, Card, Typography, Box, Fade, Divider, Stack} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { read_cookie } from "sfcookies";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [servicos, setServicos] = useState(undefined)
  const [contagem, setContagem] = useState({pendentes: 0, novos: 0, atendimento: 0, parados: 0})
  const [nome, setNome] = useState("Carregando...")

  const redirect = useNavigate()

  useEffect(()=>{
    axios.get('http://10.0.0.83:5000/api/servicos/pendente', {withCredentials: true})
      .then(({data})=>{
        if (data === "Não autorizado") redirect("/login")
        console.log(data)
        setServicos(data)
        let novaContagem = {pendentes: data.length, novos: 0, atendimento: 0, parados: 0}
        let hoje = new Date()
        data !== "Não autorizado" ? data.forEach((servico) => {
          if (servico.createdAt.split('T')[0] === hoje.toISOString().split('T')[0])
            novaContagem.novos += 1
          if (servico.atendimento)
            novaContagem.atendimento += 1
        }) : undefined
        novaContagem.parados = novaContagem.pendentes - novaContagem.atendimento
        setContagem(novaContagem)
      })
      .catch(err=>console.error("Erro obtendo serviços.\n"+err));
    return ()=>{setServicos(undefined)}
  },[])
  useEffect(()=>{
    axios.get('http://10.0.0.83:5000/api/perfil', { withCredentials: true })
      .then(({data})=>{
        if (data === "Não autorizado") redirect("/login")
        setNome(data.nome)
      })
      .catch(err=>{console.log("Erro obtendo nome");setNome("Falha obtendo nome")})
  },[])
  return (
    <Grid container direction={{xs: "column", md: "row"}} width="100%">
      <Grid item xs={12} md={10} lg={6} minHeight={{xs:1/2, md: 1}} >
        <Card elevation={3} sx={{ padding: 0, height:"100%", width: 1}} >
            <Grid item container xs={12} md={10} lg={6} sx={{padding: {xs: 1, md: 3}, minHeight: 1/2}}>
              <Grid item xs={10} md={12} >
                <Card width={1} height={1/3} sx={{display: "flex",padding: 2, alignItems: "stretch"}}>
                  <Stack spacing={2} pb={2}>
                    <Grid container alignItems="flex-end" justifyContent="space-evenly">
                      <Grid item xs={10} md={5} lg={3}>
                        <Typography variant="h5" component="h5" sx={{fontWeight: 500}}>{nome !== "Carregando..." && nome !== "Falha obtendo nome" ? "Olá," : undefined }</Typography>
                      </Grid>
                      <Grid item xs={5} alignItems="flex-start">
                        <Typography component="h4" variant="h4" color="secondary" sx={{fontWeight: 500}}>{nome}</Typography>
                      </Grid>
                    </Grid>
                    <Divider />
                    <Typography variant="h5">Serviços pendentes: {contagem.pendentes}</Typography>
                    <Typography variant="h6">Serviços novos: {contagem.novos} </Typography>
                    <Typography variant="h6">Serviços parados: {contagem.parados} </Typography>
                    <Typography variant="h6">Serviços em atendimento: {contagem.atendimento} </Typography>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
                <Grid item xs={12} sx={{display: "flex", placeContent:"center"}}>
                  <Divider width="95%" sx={{borderWidth: 2, borderColor: "secondary"}} />
                </Grid>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Home;
