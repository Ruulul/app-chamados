import { Typography, Alert, Button, Grid, TextField, Stack, CircularProgress, Fade, Box } from "@mui/material";
import axios from "../Components/Requisicao";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const burl = "http://10.0.0.83:5000"

export default function Login() {
    const [enviando, setEnviando] = useState(false)
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [error, setError] = useState(undefined)
    const redirect = useNavigate()
    function onChangeEmail({target}) {
        setEmail(target.value)
    }
    function onChangeSenha({target}) {
        setSenha(target.value)
    }
    async function onSubmit(event) {
        event.preventDefault();
        const login = {email, senha};
        setEnviando(true)
        await axios("post","/api/login", login)
            .then(({data})=>{
              setError(data.error)
              if(!data.error) redirect("/")
              setEnviando(false)
            }
            )
            .catch((e)=>{console.error(e);
              setEnviando(false)})
    }
    return (
    <Stack>
      <Grid container direction={{xs: "column", md: "row"}} width="100%">
        <Grid item component="form" onSubmit={onSubmit} xs={12} md={10} lg={4} minHeight={{xs:1/2, md: 1}} >
          <Stack spacing={3} mr={15} mb={5} ml={5} sx={{placeContent: "center"}}>
              <Typography variant="h4" component="h1" mt={5} sx={{placeSelf: "center"}} fontFamily='Road Rage'>Help Vase</Typography>
              <Box component="img" src={burl + "/images/suporte.jpg"} sx={{width: 1, height: 1, borderRadius: 4}} />
                <TextField label="email" name="email" type="email" onChange={onChangeEmail} required/>
                <TextField label="senha" name="senha" type="password"onChange={onChangeSenha} required/>
                {error ? <Alert severity="error">{error + "."}</Alert> : undefined}
                {!enviando ? 
                <Button 
                    type="submit"
                    variant="contained">
                    Acessar
                </Button> : <CircularProgress sx={{placeSelf: "center"}} />}
            </Stack>
        </Grid>
        <Grid item xs={6} md={10} mt={10} lg={7.8} height="80vh" sx={{opacity: 1}}>
          <Fade in={true} timeout={2000}>
            <Box component="img" src={burl + "/images/DJI_0097.jpg"} sx={{width: 1, height: 1, borderRadius: 4}} />
          </Fade>
        </Grid>
      </Grid>
    </Stack>
    );
}