import { Button, Grid, TextField, Stack, CircularProgress } from "@mui/material";
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
        <Grid item container component="form" direction="column" xs={10} md={6} lg={4} onSubmit={onSubmit} padding={5}>
            <Stack spacing={3}>
                <TextField label="email" name="email" type="email" onChange={onChangeEmail} required/>
                <TextField label="senha" name="senha" type="password"onChange={onChangeSenha} required/>
                {!enviando ? <Button type="submit">
                    Acessar
                </Button> : <CircularProgress />}
            </Stack>
        </Grid>
    );
}