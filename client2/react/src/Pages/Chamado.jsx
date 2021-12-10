import React, { useEffect, useLayoutEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faPen } from "@fortawesome/free-solid-svg-icons";

import { Typography } from "@mui/material";

import axios from "axios";

import {
  Card,
  Grid,
  Button,
  Stack,
  ButtonGroup,
  Box,
  TextField,
} from "@mui/material";

import { useParams, useNavigate } from "react-router-dom";

var Email = {
  send: function (a) {
    return new Promise(function (n, e) {
      (a.nocache = Math.floor(1e6 * Math.random() + 1)), (a.Action = "Send");
      var t = JSON.stringify(a);
      Email.ajaxPost("https://smtpjs.com/v3/smtpjs.aspx?", t, function (e) {
        n(e);
      });
    });
  },
  ajaxPost: function (e, n, t) {
    var a = Email.createCORSRequest("POST", e);
    a.setRequestHeader("Content-type", "application/x-www-form-urlencoded"),
      (a.onload = function () {
        var e = a.responseText;
        null != t && t(e);
      }),
      a.send(n);
  },
  ajax: function (e, n) {
    var t = Email.createCORSRequest("GET", e);
    (t.onload = function () {
      var e = t.responseText;
      null != n && n(e);
    }),
      t.send();
  },
  createCORSRequest: function (e, n) {
    var t = new XMLHttpRequest();
    return (
      "withCredentials" in t
        ? t.open(e, n, !0)
        : "undefined" != typeof XDomainRequest
        ? (t = new XDomainRequest()).open(e, n)
        : (t = null),
      t
    );
  },
};

export default function Chamado() {
  const [addMensagem, setMensagem] = useState(false);
  const [infos, setInfos] = useState({
    id: useParams().id,
    assunto: "Carregando...",
    departamento: "Carregando...",
    status: "Carregando...",
  });
  const [isCarregado, setCarregado] = useState(false);
  const [atendente, setAtendente] = useState({ nome: "Carregando..." });

  const redirect = useNavigate();

  useLayoutEffect(() => {
    const getInfos = () => {
      axios
        .get("http://10.0.0.83:5000/api/servico/" + infos.id, {
          withCredentials: true,
        })
        .then(({ data }) => {
          if (data === "Não autorizado") redirect("/login");
          setInfos(data);
          setCarregado(true);
        })
        .catch((err) => {
          console.error("Erro obtendo serviço. \n" + err);
        });
    };
    getInfos();
    let interval = setInterval(getInfos, 500);
    return () => {
      clearInterval(interval);
    };
  }, [infos]);
  useLayoutEffect(() => {
    axios
      .get("http://10.0.0.83:5000/api/usuario/" + infos.atendenteId, {
        withCredentials: true,
      })
      .then(({ data }) => {
        setAtendente(data);
      });
  }, [isCarregado]);

  return (
    <Grid container direction={{ xs: "column", sm: "row" }} spacing={3}>
      <Grid item xs={6}>
        <Card>
          <Typography variant="h4" m={2}>
            Chamado Número {infos.id}
            <Box
              component="span"
              sx={{
                backgroundColor: "lightblue",
                padding: 0.7,
                borderRadius: 2,
                fontSize: 15,
                margin: 3,
              }}
              onClick={() => {
                redirect("/chamado/" + infos.id + "/editar");
              }}
            >
              <FontAwesomeIcon icon={faPen} />
            </Box>
          </Typography>
          <Typography variant="h5" m={2}>
            Assunto
          </Typography>
          <Typography m={2}>{infos.assunto}</Typography>
          <Typography variant="h5" m={2}>
            Atendente
          </Typography>
          <Typography m={2}>{atendente.nome}</Typography>
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
        {!addMensagem ? (
          <Mensagens
            infos={infos}
            mudastatus={(novasInfos) => {
              setInfos(novasInfos);
              axios
                .get(
                  "http://10.0.0.83:5000/api/usuario/" + novasInfos.atendenteId,
                  { withCredentials: true }
                )
                .then(({data}) => {
                  console.log(data)
                  Email.send({
                    SecureToken: "b799e61b-8a4c-485a-ae41-cad05b498fee",
                    To: data.email,
                    From: "vamjunior01@gmail.com",
                    Subject: `Chamado sobre "${novasInfos.assunto}" modificado`,
                    Body: `O chamado de id ${novasInfos.id} teve seu status modificado para ${novasInfos.status}.`,
                  }).then(console.log);
                });
            }}
            addMensagem={setMensagem}
          />
        ) : (
          <AddMensagem infos={infos} setMensagem={setMensagem} />
        )}
      </Grid>
    </Grid>
  );
}

const Mensagens = (props) => {
  const [zoom, setScale] = useState(1);
  const redirect = useNavigate();

  useEffect(() => {
    if (props.infos.status === "fechado") {
      setScale(0);
    } else setScale(1);
  }, [props.infos.status]);
  return (
    <Card>
      <Stack spacing={3}>
        <Grid container>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <Typography variant="h4" m={2}>
              Mensagens
            </Typography>

            <Stack
              alignItems="stretch"
              justifyContent="flex-start"
              direction="column-reverse"
              spacing={6}
            >
              {props.infos.chat
                ? props.infos.chat.map((mensagem) => {
                    return (
                      <Mensagem
                        key={mensagem.id}
                        autorId={mensagem.autorId}
                        mensagem={mensagem.mensagem}
                      />
                    );
                  })
                : undefined}
            </Stack>
          </Grid>
          <Grid item xs={2} />
        </Grid>
        <Stack
          alignItems="right"
          paddingLeft={{
            xs: "30%",
            sm: "40%",
            md: "50%",
            lg: "60%",
            xl: "70%",
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            sx={{
              width: 200,
              padding: "2em",
              transform: `scale(${zoom})`,
              borderRadius: 5,
              fontSize: 10,
            }}
            onClick={props.addMensagem}
          >
            Adicionar Mensagem: <FontAwesomeIcon icon={faPlusCircle} />
          </Button>

          <Button
            variant="contained"
            sx={{
              width: 200,
              padding: "2em",
              transform: `scale(${zoom})`,
              borderRadius: 5,
              fontSize: 10,
            }}
            onClick={(event) => {
              let servico = props.infos;
              switch (servico.status) {
                case "pendente":
                  servico.status = "resolvido";
                  break;
                case "resolvido":
                  servico.status = "fechado";
                  redirect("/servicos");
                  break;
                case "fechado":
                  alert("Isso não devia aparecer");
                  break;
                default:
                  alert("Isso definitivamente não devia aparecer");
              }
              if (servico)
                axios
                  .post(
                    "http://10.0.0.83:5000/api/update/servico/" + servico.id,
                    servico,
                    { withCredentials: true }
                  )
                  .then((res) => props.mudastatus(servico))
                  .catch((err) =>
                    console.error("Falha em salvar o serviço \n" + err)
                  );
            }}
          >
            {props.infos
              ? props.infos.status === "pendente"
                ? "Marcar como Resolvido"
                : props.infos.status === "resolvido"
                ? "Marcar como Fechado"
                : undefined
              : undefined}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};

const AddMensagem = (props) => {
  const [mensagem, setNovaMensagem] = useState("");
  const [autorId, setAutor] = useState(undefined);
  const [nome, setNome] = useState(undefined);

  useEffect(async () => {
    await axios
      .get("http://10.0.0.83:5000/api/perfil", { withCredentials: true })
      .then(({ data }) => {
        setNome(data.nome);
        setAutor(data.id);
      })
      .catch((err) => {
        console.log("Erro obtendo nome\n" + err);
        setNome("Falha obtendo nome");
      });
  }, []);

  function handleChange(event) {
    setNovaMensagem(event.target.value);
  }
  function handleSubmit(event) {
    event.preventDefault();
    let novasInfos = props.infos;
    novasInfos.chat.push({ autorId: autorId, mensagem });
    axios
      .post(
        "http://10.0.0.83:5000/api/update/servico/" + novasInfos.id,
        novasInfos,
        { withCredentials: true }
      )
      .then((res) => props.setMensagem(false))
      .catch((err) => console.error("Erro em adicionar mensagem. \n" + err));
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Typography pt={3}>
          {(() => {
            if (nome === undefined) return;
            else if (nome === "Usuário não encontrado") return "Email inválido";
            else return nome;
          })()}
        </Typography>
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
  const [autor, setAutor] = useState(undefined);
  useEffect(() => {
    axios
      .get("http://10.0.0.83:5000/api/usuario/" + props.autorId, {
        withCredentials: true,
      })
      .then(({ data }) => setAutor(data))
      .catch(({ erro }) => setAutor(erro));
  }, []);
  return (
    <Card>
      <Typography variant="h5" m={2}>
        {autor ? autor.nome : "Carregando..."}
      </Typography>
      <Typography m={2}>{props.mensagem} </Typography>
    </Card>
  );
};
