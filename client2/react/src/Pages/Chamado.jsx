import React, { useEffect, useLayoutEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faPen } from "@fortawesome/free-solid-svg-icons";

import { Input, Typography } from "@mui/material";

import axios from "../Components/Requisicao";

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

const toBase64 = (file, id) => new Promise((resolve, reject) => {

  const reader = new FileReader();
 
  reader.onload = () => resolve({title: file.name, data: reader.result, descr: `Anexo de mensagem do chamado ${id}`});
 
  reader.onerror = error => reject(error);

  reader.readAsDataURL(file);
 
  });

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
  const [usuario, setUsuario] = useState({nome: "Carregando..."})
  const [urlanexo, setAnexo] = useState(undefined)

  const redirect = useNavigate();

  useLayoutEffect(() => {
    const getInfos = () => {
      axios("get", "/servico/" + infos.id)
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
    let interval = setInterval(getInfos, 2000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  useLayoutEffect(() => {
    axios("get", "/usuario/" + infos.atendenteId).then(({ data }) => {
      setAtendente(data);
    });
    axios("get", "/usuario/" + infos.usuarioId).then(({ data }) => {
      setUsuario(data);
    });
  }, [isCarregado]);

  useEffect(()=>
    axios("get", `/files/${infos.anexo}`)
    .then(({data})=>{
      setAnexo(data)
    }).catch(err=>console.log(err)),[infos.anexo])

  return (
    <Grid container direction={{ xs: "column", sm: "row" }} spacing={3}>
      <Grid item xs={6}>
        <Card>
          <Typography variant="h4" mt={2} ml={2} sx={{display:"grid-inline"}}>
            Chamado Número {infos.id} {" "}
            {/*<Box
              component="span"
              sx={{
                backgroundColor: "lightblue",
				margin: "auto",
                padding: 0.8,
                borderRadius: 2,
                fontSize: 15,
              }}
              onClick={() => {
                redirect("/chamado/" + infos.id + "/editar");
              }}
            >
              <FontAwesomeIcon icon={faPen} />
            </Box>*/}
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
            Atendido
          </Typography>
          <Typography m={2}>{usuario.nome}</Typography>
          <Typography variant="h5" m={2}>
            Categoria
          </Typography>
          <Typography m={2}>{infos.departamento}</Typography>
          <Typography variant="h5" m={2}>
            Status
          </Typography>
          <Typography m={2}>{infos.status}</Typography>
          {
            infos.anexo ? <>
              <Typography variant="h5" m={2}> Anexo </Typography>
              <img src={urlanexo} width="90%" style={{margin: "auto", display: "grid", paddingBottom: "2em"}} />
              </>
            : <Typography m={4}>Nenhum anexo nesse chamado</Typography>
          }
        </Card>
      </Grid>
      <Grid item xs={6}>
        {!addMensagem ? (
          <Mensagens
            infos={infos}
            mudastatus={(novasInfos) => {
              setInfos(novasInfos);
              axios("get", "/usuario/" + novasInfos.atendenteId).then(
                ({ data }) => {
                  Email.send({
                    SecureToken: "59fa2524-23b0-4dc1-af39-82ac290ca35c",
                    To: data.email,
                    From: "suporte.ti@ourobrancoagronegocios.com.br",
                    Subject: `Chamado sobre "${novasInfos.assunto}"(id ${novasInfos.id}) modificado`,
                    Body: `O chamado de id ${novasInfos.id} teve seu status modificado para ${novasInfos.status}.`,
                  }).then(console.log);
                }
              );
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
                        anexo={mensagem.metadados?.find(({nome})=>nome=="anexo")?.valor}
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
                axios("post", "/update/servico/" + servico.id, servico)
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
  const [anexo, setAnexo] = useState(undefined);
  const { id } = useParams()

  useEffect(async () => {
    await axios("get", "/perfil")
      .then(({ data }) => {
        setNome(data.nome);
        setAutor(data.id);
      })
      .catch((err) => {
        console.log("Erro obtendo nome\n" + err.message);
        setNome("Falha obtendo nome");
      });
  }, []);

  function handleChange(event) {
    setNovaMensagem(event.target.value);
  }

  function getAnexo(file) {
    toBase64(file, id)
      .then((anexo)=>setAnexo(anexo))
      .catch(console.error)
  }

  function handleSubmit(event) {
    event.preventDefault();
    let novasInfos = props.infos;
    novasInfos.chat.push({ autorId: autorId, mensagem });
    axios("post", "/update/servico/" + novasInfos.id, novasInfos)
      .then(({data: res}) => {
        props.setMensagem(false)
        let new_chat = res.chat 
        let last_message = new_chat.sort((a, b)=>b.id-a.id)[0]
        if (anexo) {
          //let anexo_form_data = new FormData(anexo)
          axios("post", `/update/mensagem/${last_message.id}/arquivo`, anexo)//, {headers: {'Content-Type': 'multipart/form-data'}})
          .then(data=>console.log("Arquivo salvo com sucesso\n", data))
          .catch(err=>console.log("Erro em salvar o arquivo.\n",err))
        }
      })
      .catch((err) => console.error("Erro em adicionar mensagem. \n" + err));
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Typography pt={3}>
          {
            (nome === undefined) ? undefined :
            (nome === "Usuário não encontrado") ? "Email inválido" :
            nome
          }
        </Typography>
        <TextField
          label="Mensagem"
          multiline
          name="mensagem"
          minRows="15"
          required
          onChange={handleChange}
          onPaste={(pasteEvent)=>getAnexo(pasteEvent.clipboardData.files[0])}
        />
        <img src={anexo?.data} style={{width:"100%"}}/>
        <Input 
          sx={{ width: "30%" }}
          variant="contained"
          name="anexo"
          color="info"
          type="file"
          onChange={({target:{files}})=>getAnexo(files[0])}
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
  const [anexo, setAnexo] = useState(undefined);
  useEffect(() => {
    axios("get", "/usuario/" + props.autorId)
      .then(({ data: autor }) => setAutor(autor))
      .catch(({ erro }) => setAutor(erro));
  }, []);
  useEffect(()=>{
    axios("get", "/files/" + props.anexo)
      .then(({ data: anexo }) => anexo=="Não autorizado" ? setAnexo(null) : setAnexo(anexo))
      .catch(({ erro }) => setAnexo(null))
  })
  return (
    <Card>
      <Typography variant="h5" m={2}>
        {autor ? autor.nome : "Carregando..."}
      </Typography>
      <Typography m={2}>{props.mensagem} </Typography>
      {
        anexo===null
        ? undefined 
        : anexo 
        ? <img src={anexo} width="90%" style={{margin: "auto", display: "grid", paddingBottom: "2em"}} />
        : <Typography>Carregando...</Typography>
      }
    </Card>
  );
};
