import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

import Mensagem from "../components/Mensagem";

import { Typography } from "@mui/material";

import {
  Card,
  Grid,
  Button,
  Stack,
  ButtonGroup,
  Divider,
  Box,
  TextField
} from "@mui/material";

const Chamado = (props) => {
  const [atualizado, setAtualiza] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [inserirMensagem, setMensagem] = useState(false);
  const [leuMensagens, lerMensagem] = useState(false);

  function atualiza() {
    setAtualiza(!atualizado);
  }

  function le_mensagens() {
    let m = [];
    if (props.infos.chat ) props.infos.chat.forEach((mensagem) => {
      m = [
        ...m,
        <Divider orientation="vertical" flexItem />,
        <Mensagem autor={mensagem.autor} mensagem={mensagem.mensagem} />
      ];
    });
    m.reverse();
    setMensagens(m);
    lerMensagem(true);
  }

  function add_e_atualiza() {
    lerMensagem(false);
    setMensagem(false);
    le_mensagens();
    atualiza();
  }

  useEffect(() => (!leuMensagens ? le_mensagens() : undefined));

  return (
    <Grid container direction={{ xs: "column", sm: "row" }} spacing={3}>
      <Grid item xs={6}>
        <Card>
          <Typography variant="h4" m={2}>
            Chamado Número {props.infos.id}
          </Typography>
          <Typography variant="h5" m={2}>
            Assunto
          </Typography>
          <Typography m={2}>{props.infos.assunto}</Typography>
          <Typography variant="h5" m={2}>
            Categoria
          </Typography>
          <Typography m={2}>{props.infos.departamento}</Typography>
          <Typography variant="h5" m={2}>
            Status
          </Typography>
          <Typography m={2}>{props.infos.status}</Typography>
        </Card>
      </Grid>
      <Grid item xs={6}>
        {inserirMensagem ? (
          <AddMensagem
            infos={props.infos}
            salvaMensagem={props.atualiza}
            setMensagem={add_e_atualiza}
          />
        ) : (
          <Mensagens
            mensagens={mensagens}
            setMensagem={setMensagem}
            infos={props.infos}
            mudastatus={props.mudastatus}
            atualiza={atualiza}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default Chamado;

const Mensagens = (props) => {
  const [scale, setScale] = useState(1);

  function scale_to_0() {
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

            <Stack alignItems="stretch" justifyContent="flex-start" spacing={6}>
              {props.mensagens}
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
            sx={{ width: "fit-content", scale }}
            onClick={() => {
              props.setMensagem(true);
            }}
          >
            Adicionar Mensagem: <FontAwesomeIcon icon={faPlusCircle} />
          </Button>

          <Button
            variant="contained"
            sx={{ width: "fit-content", scale }}
            onClick={() => {
              props.mudastatus(props.infos);
              props.atualiza();
            }}
          >
            {props.infos.status === "pendente"
              ? "Marcar como Resolvido"
              : props.infos.status === "resolvido"
              ? "Marcar como Fechado"
              : scale_to_0()}
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
    props.setMensagem();
    props.salvaMensagem(novasInfos);
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing>
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
