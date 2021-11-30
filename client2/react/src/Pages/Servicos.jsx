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
    useEffect(()=>{
      let getServicos = () => filtroStatus === "todos" ?
      axios.get('http://10.0.0.83:5000/api/servicos', { withCredentials: true })
        .then(res => {
          if (res.data === "Não autorizado") redirect("/login")
          setservicosStatus(res.data)})
        .catch(err => console.log("Erro obtendo serviços. \n" + err))
    : axios.get('http://10.0.0.83:5000/api/servicos/status/' + filtroStatus, { withCredentials: true })
        .then(res => {
          if (res.data === "Não autorizado") redirect("/login")
          setservicosStatus(res.data)
        })
        .catch(err => console.log("Erro obtendo serviços. \n" + err))
      let interval = setInterval(getServicos, 500)
      return ()=>{
        clearInterval(interval)
      }
    }, [filtroStatus])
    useEffect(()=>{
      let getServicos = ()=>filtroTipo === "todos" ?
      axios.get('http://10.0.0.83:5000/api/servicos', { withCredentials: true })
        .then(res => {
          if (res.data === "Não autorizado") redirect("/login")
          setservicosTipo(res.data)})
        .catch(err => console.log("Erro obtendo serviços. \n" + err))
    : axios.get('http://10.0.0.83:5000/api/servicos/tipo/' + filtroTipo, { withCredentials: true })
        .then(res => {
          if (res.data === "Não autorizado") redirect("/login")
          setservicosTipo(res.data)
        })
        .catch(err => console.log("Erro obtendo serviços. \n" + err))
        let interval = setInterval(getServicos, 500)
        return ()=>{
          clearInterval(interval)
        }
    }, [filtroTipo])
    useEffect(()=>{
      let temp_servicos = []
      if (servicosStatus.length > 0 && servicosTipo.length > 0)
      for (let x of servicosTipo)
        for (let y of servicosStatus)
          if (x.id === y.id)
            temp_servicos.push(x)
      setServicos(temp_servicos)
    },[servicosTipo, servicosStatus])

    return (
        <Grid container direction={{ xs: "column", md: "row" }} pt={2}>
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
                                <option>Desenvolvimento</option>
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
                              sx={{ marginY: 1, padding: 1, placeContent: "center", }}
                              elevation={2}
                            >
                              <Typography variant="body2">
                                {filtroStatus !== "todos"
                                  ? "Serviços " +
                                    filtroStatus +
                                    "s: " +
                                    servicosStatus.length
                                  : "Todos os serviços: " + servicosStatus.length}
                              </Typography>
                            </Card>
                            <Card
                              sx={{ marginY: 1, padding: 1, placeContent: "center" }}
                              elevation={2}
                            >
                              <Typography variant="body2">
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