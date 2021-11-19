import {useState, useEffect} from "react";
import TabelaServicos from "../Components/TabelaServicos";
import {
    Grid, 
    Card, 
    Stack, 
    InputLabel, 
    NativeSelect,
    Typography
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Servicos() {
    const [filtro, setFiltro] = useState("pendente")
    const [servicos, setServicos] = useState([])
    const redirect = useNavigate()
    useEffect(()=>filtro === "todos" ?
      axios.get('http://10.0.0.83:5000/api/servicos', { withCredentials: true })
        .then(res => {
          if (res.data === "Não autorizado") redirect("/login")
          setServicos(res.data)})
        .catch(err => console.log("Erro obtendo serviços. \n" + err))
    : axios.get('http://10.0.0.83:5000/api/servicos/' + filtro, { withCredentials: true })
        .then(res => {
          if (res.data === "Não autorizado") redirect("/login")
          setServicos(res.data)
        })
        .catch(err => console.log("Erro obtendo serviços. \n" + err)), [filtro])
    return (
        <Grid container direction={{ xs: "column", md: "row" }}>
            <Grid item xs={12}>
                <Card>
                  <Grid container>
                    <Grid item xs={10} md={2}>
                        <Stack p={2}>
                            <InputLabel htmlFor="filtro">Status: </InputLabel>
                            <NativeSelect
                              size="small"
                              sx={{ height: "fit-content" }}
                              name="filtro"
                              onChange={(event)=>{
                                setFiltro(event.target.value)
                              }}
                            >
                                <option name='"pendente"'>pendente</option>
                                <option name='"resolvido"'>resolvido</option>
                                <option name='"fechado"'>fechado</option>
                                <option name='"todos"'>todos</option>
                            </NativeSelect>
                          
                            <Card
                              sx={{ margin: "1em", padding: "1em", placeContent: "center" }}
                              elevation={2}
                            >
                              <Typography variant="caption">
                                {filtro !== "todos"
                                  ? "Serviços " +
                                    filtro +
                                    "s: " +
                                    servicos.length
                                  : "Todos os serviços: " + servicos.length}
                              </Typography>
                            </Card>
                        </Stack>
                    </Grid>
                    <Grid item md={10}>
                      <TabelaServicos
                        servicos={servicos}
                      />
                    </Grid>
                    </Grid>
                </Card>
            </Grid>
        </Grid>
        );
}