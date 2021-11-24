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

export default function servicosStatus() {
    const [filtroStatus, setStatus] = useState("pendente")
    const [filtroTipo, setTipo] = useState("todos")
    const [servicosStatus, setservicosStatus] = useState([])
    const [servicosTipo, setservicosTipo] = useState([])
    const [servicos, setServicos] = useState([])
    const redirect = useNavigate()
    useEffect(()=>filtroStatus === "todos" ?
      axios.get('http://10.0.0.83:5000/api/servicos', { withCredentials: true })
        .then(res => {
          if (res.data === "Não autorizado") redirect("/login")
          console.log("Servicos ", filtroStatus, " ", res.data)
          setservicosStatus(res.data)})
        .catch(err => console.log("Erro obtendo serviços. \n" + err))
    : axios.get('http://10.0.0.83:5000/api/servicos/status/' + filtroStatus, { withCredentials: true })
        .then(res => {
          if (res.data === "Não autorizado") redirect("/login")
          console.log("Servicos ", filtroStatus, " ", res.data)
          setservicosStatus(res.data)
        })
        .catch(err => console.log("Erro obtendo serviços. \n" + err)), [filtroStatus])
    useEffect(()=>filtroTipo === "todos" ?
      axios.get('http://10.0.0.83:5000/api/servicos', { withCredentials: true })
        .then(res => {
          if (res.data === "Não autorizado") redirect("/login")
          console.log("Servicos ", filtroTipo, " ", res.data)
          setservicosTipo(res.data)})
        .catch(err => console.log("Erro obtendo serviços. \n" + err))
    : axios.get('http://10.0.0.83:5000/api/servicos/tipo/' + filtroTipo, { withCredentials: true })
        .then(res => {
          if (res.data === "Não autorizado") redirect("/login")
          console.log("Servicos ", filtroTipo, " ", res.data)
          setservicosTipo(res.data)
        })
        .catch(err => console.log("Erro obtendo serviços. \n" + err)), [filtroTipo])
    useEffect(()=>{
      let temp_servicos = []
      if (servicosStatus.length > 0 && servicosTipo.length > 0)
      for (let x of servicosTipo)
        for (let y of servicosStatus)
          if (x.id === y.id)
            temp_servicos.push(x)
      console.log("Serviços ambos: ", temp_servicos)
      setServicos(temp_servicos)
    },[servicosTipo, servicosStatus])
    return (
        <Grid container direction={{ xs: "column", md: "row" }}>
            <Grid item xs={12}>
                <Card>
                  <Grid container>
                    <Grid item xs={10} md={2}>
                        <Stack p={2}>
                            <InputLabel htmlFor="tipo">Tipo: </InputLabel>
                            <NativeSelect
                              size="small"
                              sx={{ height: "fit-content" }}
                              name="tipo"
                              onChange={(event)=>{
                                setTipo(event.target.value)
                              }}
                            >
                                <option>todos</option>
                                <option>Infraestrutura</option>
                                <option>Sistemas</option>
                            </NativeSelect>
                            <InputLabel htmlFor="filtro">Status: </InputLabel>
                            <NativeSelect
                              size="small"
                              sx={{ height: "fit-content" }}
                              name="filtro"
                              onChange={(event)=>{
                                setStatus(event.target.value)
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
                                {filtroStatus !== "todos"
                                  ? "Serviços " +
                                    filtroStatus +
                                    "s: " +
                                    servicosStatus.length
                                  : "Todos os serviços: " + servicosStatus.length}
                              </Typography>
                            </Card>
                            <Card
                              sx={{ margin: "1em", padding: "1em", placeContent: "center" }}
                              elevation={2}
                            >
                              <Typography variant="caption">
                                {filtroTipo !== "todos"
                                  ? "Serviços de " +
                                    filtroTipo + ": " +
                                    servicosTipo.length
                                  : "Todos os serviços: " + servicosTipo.length}
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