import {Grid, Card, Typography, Box, Fade, Divider, Stack} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [servicos, setServicos] = useState(undefined)
  const [contagem, setContagem] = useState({pendentes: 0, novos: 0, atendimento: 0, parados: 0})
  const [nome, setNome] = useState("Carregando...")

  const redirect = useNavigate()

  useEffect(()=>{
    axios.get('http://10.0.0.83:5000/api/servicos/status/pendente', {withCredentials: true})
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
    <Grid container direction="row" width="100%" spacing={2}>
      <Grid item xs={12} md={4} sx={{padding: {xs: 1, md: 3}, minHeight: 1/2}}>
        <Card elevation={6} sx={{padding: {xs: 1, md: 3}, minHeight: 1/3, marginTop: 5}}>
          <Stack spacing={2} pb={2}>
            <Stack direction="row" alignItems="flex-end" justifyContent="space-evenly">
                <Typography variant="h5" component="h5" sx={{fontWeight: 500}}>
                  {nome !== "Carregando..." && nome !== "Falha obtendo nome" 
                  ? "Olá," : undefined }
                </Typography>
                <Typography component="h5" variant="h6" color="secondary" sx={{fontWeight: 700}}>
                  {nome}
                </Typography>
            </Stack>
            <Divider />
            <Typography variant="h5">Serviços pendentes: {contagem.pendentes}</Typography>
            <Typography variant="h6">Serviços parados: {contagem.parados} </Typography>
            <Typography variant="h6">Serviços em atendimento: {contagem.atendimento} </Typography>
            <Divider width="95%"/>
          </Stack>
        </Card>
      </Grid>
      <Grid item xs={2} >
        <Card elevation={6} sx={{padding: {xs: 1, md: 3}, minHeight: 1/3, marginTop: 10}}>
              <Typography variant="h6">Serviço{contagem.novos !== 1 ? 's' : undefined} novo{contagem.novos !== 1 ? 's' : undefined} : </Typography> 
              <Typography variant="h5"> {contagem.novos} </Typography>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Home;
