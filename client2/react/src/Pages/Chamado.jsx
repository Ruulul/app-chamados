import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

import { Typography } from "@mui/material";

import axios from "axios";

import {
  Card,
  Grid,
  Button,
  Stack,
  ButtonGroup,
  Box,
  TextField
} from "@mui/material";

import { useParams, Routes, Route, Outlet, Link } from "react-router-dom";


export default function Chamado() {
  const [, forceUpdate] = useState({})
  const [addMensagem, setMensagem] = useState(false)
  const [infos, setInfos] = useState({
    id: useParams().id,
    assunto: "Carregando...",
    departamento: "Carregando...",
    status: "Carregando...",
  })

  useEffect(()=>{
    axios.get('http://10.0.0.83:5000/api/servico/'+ infos.id)
      .then(({data})=>{setInfos(data);console.log(data)})
      .catch(err=>{console.error("Erro obtendo serviço. \n" + err)})
  },[infos]);

    return (
      <Grid container direction={{ xs: "column", sm: "row" }} spacing={3}>
        <Grid item xs={6}>
          <Card>
            <Typography variant="h4" m={2}>
              Chamado Número {infos.id}
            </Typography>
            <Typography variant="h5" m={2}>
              Assunto
            </Typography>
            <Typography m={2}>{infos.assunto}</Typography>
            <Typography variant="h5" m={2}>
              Categoria
            </Typography>
            <Typography m={2}>{infos.departamento}</Typography>
            <Typography variant="h5" m={2}>
              Status
            </Typography>
            <Typography m={2}>{infos.status}</Typography>
          </Card>
        </Grid>
        <Grid item xs={6}>
          {!addMensagem ? <Mensagens
              infos={infos}
              mudastatus={(novasInfos)=>{setInfos(novasInfos); forceUpdate({})}}
              addMensagem={setMensagem}
            /> : <AddMensagem infos={infos} setMensagem={setMensagem} />}
        </Grid>
      </Grid>
    );
  };

  
const Mensagens = (props) => {
    const [scale, setScale] = useState(1);
  
    function scale_to_0() {
      if (props.infos.status === "fechado")
        if (scale) setScale(0);
    }
    return (
      <Card>
        <Stack spacing={3}>
          <Grid container>
            <Grid item xs={1} />
            <Grid item xs={10}>
              <Typography variant="h4" m={2}>
                Mensagens
              </Typography>
  
              <Stack alignItems="stretch" justifyContent="flex-start" direction="column-reverse" spacing={6}>
                {props.infos.chat ? props.infos.chat.map((mensagem)=>{
                    return <Mensagem key={mensagem.id} autor={mensagem.autor} mensagem={mensagem.mensagem} />
                }) : undefined}
              </Stack>
            </Grid>
            <Grid item xs={1} />
          </Grid>
          <ButtonGroup
            sx={{ placeSelf: "center", placeItems: "center" }}
            orientation="vertical"
          >
            <Button
              variant="contained"
              color="secondary"
              sx={{ width: "fit-content",padding: "1em", scale }}
              onClick={
                props.addMensagem
              }
            >
              Adicionar Mensagem: <FontAwesomeIcon icon={faPlusCircle} />
            </Button>
  
            <Button
              variant="contained"
              sx={{ width: "fit-content",padding: "1em", scale }}
              onClick={
                (event)=>{
                  let servico = props.infos
                  switch (servico.status) {
                    case "pendente":
                      servico.status = "resolvido";
                      break;
                    case "resolvido":
                      servico.status = "fechado";
                      break;
                    case "fechado":
                      alert("Isso não devia aparecer");
                      break;
                    default:
                      alert("Isso definitivamente não devia aparecer");
                  }
                  if (servico) 
                  axios.post('http://10.0.0.83:5000/api/update/servico/' + servico.id, servico)
                    .then(res=>props.mudastatus(servico))
                    .catch(err=>console.error('Falha em salvar o serviço \n' + err));;
                }
              }
            >
              {props.infos ? (props.infos.status === "pendente"
                ? "Marcar como Resolvido"
                : props.infos.status === "resolvido"
                ? "Marcar como Fechado"
                : scale_to_0()) : undefined}
            </Button>
          </ButtonGroup>
        </Stack>
      </Card>
    );
  };
  
const AddMensagem = (props) => {
    const [mensagem, setNovaMensagem] = useState("");
    const [autor, setAutor] = useState("");
    function handleChange(event) {
      if (event.target.name === "mensagem") setNovaMensagem(event.target.value);
      else if (event.target.name === "autor") setAutor(event.target.value);
    }
    function handleSubmit(event) {
      event.preventDefault();
      let novasInfos = props.infos;
      novasInfos.chat.push({ autor, mensagem });
      axios.post('http://10.0.0.83:5000/api/update/servico/' + novasInfos.id, novasInfos)
        .then(res=>props.setMensagem(false))
        .catch(err=>console.error("Erro em adicionar mensagem. \n" + err))
    }
  
    return (
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            sx={{ mt: 1 }}
            label="Usuário"
            name="autor"
            type="text"
            required
            onChange={handleChange}
          />
          <TextField
            label="Mensagem"
            multiline
            name="mensagem"
            minRows="15"
            required
            onChange={handleChange}
          />
          <Button
            sx={{ width: "100%" }}
            variant="contained"
            color="secondary"
            type="submit"
          >
            Enviar Mensagem
          </Button>
        </Stack>
      </Box>
    );
  };
  

const Mensagem = (props) => {
    return (
      <Card>
        <Typography variant="h5" m={2}>
          {props.autor ? props.autor : "Teste"}
        </Typography>
        <Typography m={2}>{props.mensagem} </Typography>
      </Card>
    );
  };
  