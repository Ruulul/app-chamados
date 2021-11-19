import { Button, Grid, TextField, Stack, CircularProgress, Fade, Box } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [enviando, setEnviando] = useState(false)
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
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
        await axios.post("http://10.0.0.83:5000/api/login", login, { withCredentials: true })
            .then(({data})=>{
            console.log(data)
            redirect("/")}
            )
            .catch(console.error)
    }
    return (
        <Grid container direction={{xs: "column", md: "row"}} width="100%">
          <Grid item component="form" onSubmit={onSubmit} xs={12} md={10} lg={6} minHeight={{xs:1/2, md: 1}} >
            <Stack spacing={3} mt={20} mr={15} mb={5} ml={5}>
                <TextField label="email" name="email" type="email" onChange={onChangeEmail} required/>
                <TextField label="senha" name="senha" type="password"onChange={onChangeSenha} required/>
                {!enviando ? 
                <Button 
                    type="submit"
                    variant="contained">
                    Acessar
                </Button> : <CircularProgress />}
            </Stack>
        </Grid>
      <Grid item xs={6} md={10} lg={6} height="80vh">
        <Fade in={true} timeout={2000}>
          <Box component="img" src="http://10.0.0.83:5000/images/368A0660.jpg" sx={{width: 1, height: 1, borderRadius: 4}} />
        </Fade>
      </Grid>
    </Grid>
    );
}