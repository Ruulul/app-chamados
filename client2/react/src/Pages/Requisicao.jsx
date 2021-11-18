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
  Input, 
  Button 
} from "@mui/material";
import axios from "axios";

export default function Requisicao () {
  const [infos, setInfos] = useState({
    departamento: "Contábil",
    prioridade: 1,
    anexo: undefined,
    assunto: "",
    autorId: undefined,
    chat: [{ autorId: undefined, mensagem: "" }],
    id: undefined,
    status: "pendente",
  });
  const [, forceUpdate] = useState({})
  const [nome, setNome] = useState(undefined)
  const navigate = useNavigate()

  useEffect(async ()=>{
    axios.get('http://10.0.0.83:5000/api/servicos')
      .then(({data})=>{
        let novasInfos = infos;
        novasInfos.id = data.length;
        console.log("Serviços contatos. \ninfos:" + JSON.stringify(infos))
        setInfos(novasInfos)
        forceUpdate({})})
      .catch((err)=>{console.log('Erro obtendo serviços. ' + err)})
  }, [])

  function handleChange(event) {
    let novas_infos = infos
    if (event.target.name === "prioridade") {
      let prioridades = ["Baixa", "Padrão", "Alta", "Urgente"];
      novas_infos[event.target.name] = prioridades.indexOf(event.target.value) + 1;
    } else if (event.target.name === "mensagem")
      novas_infos.chat[0].mensagem = event.target.value;
    else if (event.target.name === "autor") {
    //  novas_infos.chat[0].autor = event.target.value;
    //  novas_infos[event.target.name] = event.target.value;
    }
    else novas_infos[event.target.name] = [event.target.value][0];
    console.log(novas_infos)
    setInfos(novas_infos)
  }
  function handleSubmit(event) {
    event.preventDefault();
    let requisicao = infos
    requisicao.status = "pendente"
    axios.post('http://10.0.0.83:5000/api/novo/servico', requisicao)
      .then(res=>navigate('/servicos'))
      .catch(err=>console.log("Erro em salvar o chamado." + err))
  }

  function handleUser(event) {
    axios.get('http://10.0.0.83:5000/api/usuario/email/' + event.target.value)
      .then(({data})=>{
        let novasInfos = infos
        novasInfos.autorId = data.id
        novasInfos.chat[0].autorId = data.id
        console.log("Usuário: " + JSON.stringify(data))
        setNome(data.nome)
        setInfos(novasInfos)
        forceUpdate({})
      }).catch(()=>{
        setNome("Email não encontrado")
        forceUpdate({})
      })
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
              <Typography>{infos.id === undefined ?  "Carregando..." : ("Ticket nº " + infos.id)}</Typography>
              <Typography>
                {(()=>{
                  if (nome === undefined) return;
                  else if (nome === "Usuário não encontrado") return "Email inválido";
                  else return "Olá, " + nome
                })()}
              </Typography>
              <TextField
                label="Email"
                name="email"
                size="small"
                onBlur={handleUser}
                required
              />
              <InputLabel>Departamento: </InputLabel>
              <NativeSelect
                name="departamento"
                onChange={handleChange}
              >
              <option key={1} name="comercial">
                Comercial
              </option>,
              <option key={2} name="contabil">
                Contábil
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
              <InputLabel>Prioridade: </InputLabel>
              <NativeSelect
                name="prioridade"
                type="dropdown"
                label="Prioridade: "
                onChange={handleChange}
              >
                <option name="1">Baixa</option>
                <option name="2">Padrão</option>
                <option name="3">Alta</option>
                <option name="4">Urgente</option>
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
            color="secondary"
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