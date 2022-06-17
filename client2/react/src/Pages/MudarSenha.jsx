import { Typography, Alert, Button, Grid, TextField, Stack, CircularProgress } from "@mui/material";
import axios from "../Components/Requisicao";
import { useReducer, useState } from 'react'//"preact/compat";
import { useNavigate } from "react-router-dom";

export default function MudarSenha() {
    const initialState = {
        campos: {
            email: "",
            senhaatual: "", 
            confirmasenha: "", 
            senha: ""
        }, 
        enviando: false, 
        error: undefined
    }
    const [, update] = useState({})
    function reducer(state, action) {
        if (action.type === "enviando" || action.type === "error")
            state[action.type] = action.payload
        else
            state[action.type][action.payload.name] = action.payload.value
        update({})
        return state
    }

    const [state, dispatch] = useReducer(reducer, initialState);
    const redirect = useNavigate()

    function handleChange({target}) {
        dispatch({type: "campos", payload: target})
    }

    async function onSubmit(event) {
        function limpacampos() {
            dispatch({type: "enviando", payload: false})
            dispatch({type: "campos", payload: {name: "senhaatual", value: ""}})
            dispatch({type: "campos", payload: {name: "confirmasenha", value: ""}})
            dispatch({type: "campos", payload: {name: "senha", value: ""}})
        }
        event.preventDefault();
        let {email, senhaatual, confirmasenha, senha} = state.campos
        const login = {email, senhaatual, senha};
        dispatch({type: "enviando", payload: true})
        dispatch({type: "error", payload: undefined})
        update({})
        if (senhaatual === confirmasenha)
        await axios("post","/alterasenha", login)
            .then(({data})=>{
                dispatch({type: "error", payload: data.error})
                if(!data.error) 
                  redirect("/")
                dispatch({type: "enviando", payload: false})
                }
            )
            .catch((e)=>{
                console.error(e);
                }
            )
        else dispatch({type: "error", payload: "Campos não correspondem"})
        limpacampos()
        update({})
    }
    return (
    <Stack>
        <Grid container direction={{xs: "column", md: "row"}} width="100%">
          <Grid item component="form" onSubmit={onSubmit} xs={12} md={10} lg={4} minHeight={{xs:1/2, md: 1}} >
            <Stack spacing={3} mr={15} mb={5} ml={5} sx={{placeContent: "center"}}>
              <Typography variant="h4" component="h1" mt={5} sx={{placeSelf: "center"}} fontFamily='Road Rage'>Help Vase</Typography>
                <TextField 
                    label="Email" 
                    name="email"  
                    type="email"
                    value={state.campos.email}
                    onChange={handleChange} required
                />
                <TextField 
                    label="Senha Atual" 
                    name="senhaatual" 
                    type="password" 
                    value={state.campos.senhaatual}
                    onChange={handleChange} required
                />
                <TextField 
                    label="Confirmar Senha" 
                    name="confirmasenha" 
                    type="password" 
                    value={state.campos.confirmasenha}
                    onChange={handleChange} required
                />
                <TextField 
                    label="Nova Senha" 
                    name="senha" 
                    type="password" 
                    value={state.campos.senha}
                    onChange={handleChange} required
                />
                {state.error ? (console.log(state.error), <Alert severity="error">{state.error + "."}</Alert>) : undefined}
                {!state.enviando ? 
                <Button 
                    type="submit"
                    variant="contained">
                    Mudar senha
                </Button> : <CircularProgress sx={{placeSelf: "center"}} />}
            </Stack>
        </Grid>
    </Grid>
    </Stack>
    );
}