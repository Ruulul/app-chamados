import {Grid, Card, Typography, Box, Fade, Divider, Stack} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";

const Home = ({user}) => {
  const [servicos, setServicos] = useState(undefined)
  const [contagem, setContagem] = useState({pendentes: 0, novos: 0, atendimento: 0, parados: 0})

  useEffect(()=>{
    axios.get('http://10.0.0.83:5000/api/servicos/pendente')
      .then(({data})=>setServicos(data))
      .catch(err=>console.error("Erro obtendo serviços.\n"+err));
    return ()=>{setServicos(undefined)}
  },[])
  return (
    <Grid container direction={{xs: "column", md: "row"}} width="100%">
      <Grid item xs={12} md={10} lg={6} minHeight={{xs:1/2, md: 1}} >
        <Card elevation={3} sx={{ padding: 0, height:"100%", width: 1}} >
            <Grid item container xs={12} md={10} lg={6} sx={{padding: {xs: 1, md: 3}, minHeight: 1/2}}>
              <Grid item xs={10} md={12} >
                <Card width={1} height={1/3} sx={{display: "flex",padding: 2, alignItems: "stretch"}}>
                  <Stack spacing={2} pb={2}>
                    <Grid container alignItems="flex-end" justifyContent="space-between">
                      <Grid item xs={10} md={5} lg={3}>
                        <Typography variant="h4" component="h4" sx={{fontWeight: 500}}>Olá, </Typography>
                      </Grid>
                      <Grid item xs={5} alignItems="flex-start">
                        <Typography component="h5" variant="h5" color="secondary" sx={{fontWeight: 500}}>{user ? " " + user : " Mundo"}</Typography>
                      </Grid>
                    </Grid>
                    <Divider />
                    <Typography variant="h5">Serviços pendentes: {contagem.pendentes}</Typography>
                    <Typography variant="h6">Serviços novos: {contagem.novos} </Typography>
                    <Typography variant="h6">Serviços em atendimento: {contagem.atendimento} </Typography>
                    <Typography variant="h6">Serviços parados: {contagem.parados} </Typography>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
                <Grid item xs={12} sx={{display: "flex", placeContent:"center"}}>
                  <Divider width="95%" sx={{borderWidth: 2, borderColor: "secondary"}} />
                </Grid>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} height="80vh">
        <Fade in={true} timeout={2000}>
          <Box component="img" src="http://10.0.0.83:5000/images/368A0660.jpg" sx={{width: 1, height: 1, borderRadius: 4}} />
        </Fade>
      </Grid>
    </Grid>
  );
};

export default Home;
