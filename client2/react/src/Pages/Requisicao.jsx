import {useEffect, useState} from "react"
import { Link, useNavigate } from "react-router-dom";
import { 
  Box, 
  Grid, 
  Stack, 
  Typography, 
  TextField, 
  InputLabel, 
  NativeSelect,
  Select,
  Input, 
  Button 
} from "@mui/material";
import axios from "axios";

export default function Requisicao () {
  const redirect = useNavigate()
  const [infos, setInfos] = useState({
    departamento: "Contábil",
    prioridade: 1,
    anexo: undefined,
    assunto: "",
    autorId: undefined,
    tipo: "Infraestrutura",
    chat: [{ autorId: undefined, mensagem: "" }],
    id: undefined,
    status: "pendente",
  });
  const [, forceUpdate] = useState({})
  const [nome, setNome] = useState(undefined)
  const navigate = useNavigate()

  useEffect(async ()=>{
    axios.get('http://10.0.0.83:5000/api/servicos', { withCredentials: true })
      .then(({data})=>{
        console.log(data)
        if (data === "Não autorizado") redirect("/login")
        let novasInfos = infos;
        novasInfos.id = data.length !== 0 ? data[data.length-1].id + 1 : 0;
        console.log("Dados do servidor: " + JSON.stringify(data))
        console.log("Serviços contados. \ninfos:" + JSON.stringify(infos))
        setInfos(novasInfos)
        forceUpdate({})
      })
      .catch((err)=>{console.log('Erro obtendo serviços. ' + err)})
  }, [])

  useEffect(()=>{
    axios.get('http://10.0.0.83:5000/api/perfil', { withCredentials: true })
      .then(({data})=>{
        setNome(data.nome)
        let novasInfos = infos
        novasInfos.autorId = data.id
        novasInfos.chat[0].autorId = data.id
        setInfos(novasInfos)
      })
      .catch(err=>{console.log("Erro obtendo nome");setNome("Falha obtendo nome")})
  },[])

  function handleChange(event) {
    let novas_infos = infos
    if (event.target.name === "prioridade") {
      let prioridades = ["🟩Baixa", "🟧Média", "🟥Alta", "⬛Urgente"];
      novas_infos[event.target.name] = prioridades.indexOf(event.target.value) + 1;
    } else if (event.target.name === "mensagem")
      novas_infos.chat[0].mensagem = event.target.value;
    else if (event.target.name === "autor") {
    //  novas_infos.chat[0].autor = event.target.value;
    //  novas_infos[event.target.name] = event.target.value;
    }
    else novas_infos[event.target.name] = [event.target.value][0];
    console.log(infos)
    setInfos(novas_infos)
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
    let requisicao = infos
    requisicao.status = "pendente"
    console.log(requisicao)
    await getPrazo().then(async (prazo)=>{
      requisicao.prazo=prazo.toISOString()
      await axios.post('http://10.0.0.83:5000/api/novo/servico', requisicao, { withCredentials: true })
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
      >
        <Grid item container xs={10} spacing={2} direction={{ xs: "column", sm: "row" }} justifyContent="space-between">
          <Grid item xs={3}>
            <Stack spacing={2}>
              <Typography>
                {infos.id === undefined ?  "Carregando..." : ("Ticket nº " + infos.id)}
              </Typography>
              <Typography>
                {nome === undefined ? "Carregando..." : ("Olá, " + nome)}
              </Typography>
              <InputLabel>Tipo do Chamado: </InputLabel>
              <NativeSelect
                name="tipo"
                onChange={handleChange}
              >
              <option key={1} name="infra">
                Infraestrutura
              </option>,
              <option key={2} name="sistemas">
                Sistemas
              </option>,
              </NativeSelect>
              <InputLabel>Departamento: </InputLabel>
              <NativeSelect
                name="departamento"
                onChange={handleChange}
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
          <Grid item />
          <Grid item xs={8} justifyContent="space-between">
            <Stack spacing={2}>
              <TextField
                name="assunto"
                size="small"
                label="Assunto"
                type="text"
                onChange={handleChange}
                required
              />
              <TextField
                multiline
                size="small"
                name="mensagem"
                type="text"
                label="Corpo da Mensagem"
                onChange={handleChange}
                minRows="10"
                required
              />
              <Button
                variant="contained"
                sx={{ width: "100%" }}
                name="submit"
                type="submit"
              >
                Enviar
              </Button>
            </Stack>
          </Grid>
        </Grid>
        <Grid item sm={1} xs={12}>
          <Button
            variant="contained"
            color="warning"
            component={Link}
            to="/"
          >
            X
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}