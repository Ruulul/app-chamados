import { Button, Grid, TextField, Stack } from "@mui/material";
import axios from "axios";
import { useState } from "react";

export default function Registro() {
    const [nome, setNome] = useState(null)
    const [sobrenome, setSobrenome] = useState(null)
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    function onChangeNome({target}) {
        setNome(target.value)
    }
    function onChangeSobrenome({target}) {
        setSobrenome(target.value)
    }
    function onChangeEmail({target}) {
        setEmail(target.value)
    }
    function onChangeSenha({target}) {
        setSenha(target.value)
    }
    function onSubmit(event) {
        event.preventDefault();
        const cadastro = {nome, sobrenome, email, senha};
        console.log({cadastro})
        axios.post("http://10.0.0.83:5000/api/novo/usuario", cadastro)
            .then(console.log)
            .catch(console.error)
    }
    return (
        <Grid item container component="form" direction="column" xs={10} md={6} lg={4} onSubmit={onSubmit} padding={5}>
            <Stack spacing={3}>
                <TextField label="Nome" name="nome" onChange={onChangeNome} />
                <TextField label="Sobrenome" name="sobrenomenome" onChange={onChangeSobrenome} />
                <TextField label="email" name="email" type="email" onChange={onChangeEmail} required/>
                <TextField label="senha" name="senha" type="password"onChange={onChangeSenha} required/>
                <Button type="submit">
                    Enviar
                </Button>
            </Stack>
        </Grid>
    );
}