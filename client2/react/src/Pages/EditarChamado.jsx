import {useEffect, useLayoutEffect, useState} from "react"
import { Link, useNavigate, useParams } from "react-router-dom";
import { 
  Box, 
  Grid, 
  Stack, 
  Typography, 
  Card, 
  InputLabel, 
  NativeSelect,
  Input, 
  Button 
} from "@mui/material";
import axios from "../Components/Requisicao";

export default function Requisicao () {
  const redirect = useNavigate()
  const idChamado = useParams().id
  const [infos, setInfos] = useState({
    departamento: "Contábil",
    prioridade: 1,
    anexo: undefined,
    assunto: "",
    autorId: undefined,
    tipo: "Infraestrutura",
    id: undefined,
    atendenteId: undefined,
    status: "pendente",
  });
  const [nome, setNome] = useState(undefined)
  const [atendentes, setAtendentes] = useState([])
  const [atendente, setAtendente] = useState(undefined)
  const navigate = useNavigate()


  useLayoutEffect(()=>{
     axios("get",'/api/usuarios/area/' + infos.tipo)
      .then(({data})=>{
        setAtendentes(data)
        let novas_infos = {...infos}
        novas_infos.atendenteId = data[0].id
        novas_infos.atendente = data[0].nome
        console.log("Atualizando atendentes: ", infos, " para ", novas_infos)
        setInfos(novas_infos)
      }).catch(err=>{console.log("Erro obtendo atendentes. \n" + err); setAtendentes([{nome: "Sem atendentes nessa categoria"}])})
  },[infos.tipo])

  useEffect(()=>{
     axios("get",'/api/perfil')
      .then(({data})=>{
        setNome(data.nome)
      })
      .catch(err=>{console.log("Erro obtendo nome");setNome("Falha obtendo nome")})
  },[])

  useEffect(()=>{
    console.log(idChamado)
    axios("get","/api/servico/" + idChamado)
    .then(async ({data})=>{
    let chamado = data
    console.log("Puxando servico: ", data)
    setInfos({
      departamento: chamado.departamento,
      prioridade: chamado.prioridade,
      anexo: chamado.anexo,
      assunto: chamado.assunto,
      autorId: chamado.autorId,
      tipo: chamado.tipo,
      id: chamado.id,
      atendenteId: parseInt(chamado.atendenteId),
      status: chamado.status,
    })
    axios("get","/api/usuario/" + chamado.atendenteId)
        .then(({data})=>{
            setAtendente(data.nome)
            console.log("Puxando atendente: ", infos)
        })
  })
  .catch(err=>console.log(err));
},[infos.id])

  function handleChange(event) {
    let novas_infos = {...infos}
    if (event.target.name === "atendente") {
      novas_infos.atendenteId = atendentes[(atendentes.map((atendente)=>{return atendente.nome})).indexOf(event.target.value)].id
      novas_infos.atendente = event.target.value
    }
    else if (event.target.name === "prioridade") {
      let prioridades = ["🟩Baixa", "🟧Média", "🟥Alta", "⬛Urgente"];
      novas_infos[event.target.name] = prioridades.indexOf(event.target.value) + 1;
    }
    else novas_infos[event.target.name] = [event.target.value][0];
    console.log(novas_infos)
    setInfos(novas_infos)
    console.log("Infos atualizadas")
  }

  async function getPrazo() {
    let data = new Date()
    switch (infos.prioridade) {
      case 1:
        data.setDate(data.getDate()+3)
        return data;
      case 2:
        data.setDate(data.getDate()+2)
        return data;
      case 3:
        data.setDate(data.getDate()+1)
        return data;
      case 4:
        data = new Date(data.getTime()+28800000)
        return data;
      default:
        return "Isso não devia acontecer"
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await getPrazo().then(async (prazo)=>{
      if (typeof(infos.prazo) === "object")
      infos.prazo=prazo.toISOString()
      await axios("post",'/api/update/servico/' + idChamado, infos)
        .then(res=>navigate('/servicos'))
        .catch(err=>console.log("Erro em salvar o chamado." + err))
    }).catch(console.log)
  }
  return (
    <Box sx={{ mt: "1em" }} component="form" onSubmit={handleSubmit}>
      <Grid
        container
        item
        direction={{ xs: "column-reverse", sm: "row" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Grid item container xs={11} spacing={2} direction={{ xs: "column", sm: "row" }} justifyContent="space-between">
            <Grid item xs={12}>
              
                <Stack spacing={1} pb={3}>
                  <Grid container>
                    <Grid item xs={4}>
                    <Stack component={Card} alignItems="left" width="fit-content" p={5} pt={3} spacing={1}>
                      <Typography>
                        {nome === undefined ? "Carregando..." : ("Olá, " + nome)}
                      </Typography>
                      <Typography variant="h5">
                        {infos.id === undefined ?  "Carregando..." : ("Ticket nº " + infos.id)}
                      </Typography>
                      <Typography>
                        {atendente === undefined ? "Carregando..." : ("Designado para: " + atendente)}
                      </Typography>
                      <Typography variant="h5">
                        {infos.assunto === undefined ? "Carregando..." : infos.assunto}
                      </Typography>
                    </Stack>
                    </Grid>
                    <Grid item xs={4}>
                      <Stack component={Card} alignItems="left" width="fit-content" p={5} pb={3} spacing={1} pt={2}>
                          <Typography variant="h6">
                              Dados a serem enviados
                          </Typography>
                          {infos ? 
                          Object.entries(infos)
                          .filter(info=>
                            info[0]=="departamento" || 
                            info[0] == "prioridade" || 
                            info[0] == "departamento" ||
                            info[0] == "tipo" ||
                            info[0] == "atendente")
                          .map(info=><Typography>
                            {info[0] == "prioridade" 
                            ? "Urgência" 
                            : `${info[0][0].toUpperCase()}${info[0].slice(1)}`}: {" "} 
                            {info[0] == "prioridade"
                            ? `${["Baixa", "Média", "Alta", "Urgente"][parseInt(info[1]) - 1]}`
                            : info[1]}</Typography>) 
                          : undefined}
                      </Stack>
                      </Grid>
                    </Grid>
                  <InputLabel>Tipo do Chamado: </InputLabel>
                  <NativeSelect
                name="tipo"
                onChange={handleChange}
                value={infos.tipo}
              >
              <option key={1} name="infra">
                Infraestrutura
              </option>,
              <option key={2} name="sistemas">
                Sistemas
              </option>,
              <option key={3} name="desenvolvimento">
                Desenvolvimento
              </option>,
                  </NativeSelect>
                  <InputLabel>Atendente: </InputLabel>
                  <NativeSelect
                name="atendente"
                onChange={handleChange}
                onClick={handleChange}
                value={infos.atendente}
              >
                {atendentes.map((atendente, i)=>{
                  return <option key={i} name="atendente">{atendente.nome}</option>
                })}
                  </NativeSelect>
                  <InputLabel>Departamento: </InputLabel>
                  <NativeSelect
                name="departamento"
                onChange={handleChange}
                value={infos.departamento}
              >
              <option key={1} name="contabil">
                Contábil
              </option>,
              <option key={2} name="comercial">
                Comercial
              </option>,
              <option key={3} name="faturamento">
                Faturamento
              </option>,
              <option key={4} name="guarita">
                Guarita
              </option>,
              <option key={5} name="gerencia">
                Gerência
              </option>,
              <option key={6} name="financeiro">
                Financeiro
              </option>,
              <option key={7} name="ccm-ubs">
                CCM UBS
              </option>,
              <option key={8} name="ccm-ob">
                CCM OB
              </option>,
              <option key={9} name="ti">
                TI
              </option>
                  </NativeSelect>
                  <InputLabel>Urgência: </InputLabel>
                  <NativeSelect
                name="prioridade"
                type="dropdown"
                label="Prioridade: "
                onChange={handleChange}
                value={["🟩Baixa", "🟧Média", "🟥Alta", "⬛Urgente"][infos.prioridade-1]}
              >
                <option name="1" style={{}}>🟩Baixa</option>
                <option name="2" style={{}}>🟧Média</option>
                <option name="3" style={{}}>🟥Alta</option>
                <option name="4" style={{}}>⬛Urgente</option>
                  </NativeSelect>
                  <InputLabel htmlFor="anexo">Anexo: </InputLabel>
                  <Input
                    disabled
                name="anexo"
                type="file"
                onChange={handleChange}
                    value={infos.anexo}
                  />
                </Stack>
            </Grid>
            <Button
                variant="contained"
                sx={{ width: "100%" }}
                name="submit"
                type="submit"
              >
                Enviar
            </Button>
        </Grid>
        <Grid item xs={12} sm={0.5}>
          <Button
            variant="contained"
            color="warning"
            component={Link}
            padding={5}
            sx={{
              minWidth: 0,
              minHeight: 0,
              paddingX: 1,
              width: "fit-content",
              height: "fit-content",
              position: "absolute",
            }}
            to="/"
          >
            X
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}