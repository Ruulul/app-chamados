import {
  Grid,
  Card,
  Typography,
  Box,
  Fade,
  Divider,
  Stack,
  CardMedia,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chat from "../Components/Chat";
import MChat from "../Components/MuiChat";

/* SmtpJS.com - v3.0.0 */
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
const Home = () => {
  const [contagem, setContagem] = useState({
    pendentes: 0,
    novos: 0,
    atendimento: 0,
    parados: 0,
  });
  const [nome, setNome] = useState("Carregando...");
  const [contagemPrazo, setPrazo] = useState({
    vencidos: 0,
    hoje: 0,
    semana: 0,
  });

  let conversao = [
    "Jan",
    "Jan",
    "Feb",
    "Fev",
    "Mar",
    "Mar",
    "Apr",
    "Abr",
    "May",
    "Mai",
    "Jun",
    "Jun",
    "Jul",
    "Jul",
    "Aug",
    "Ago",
    "Sep",
    "Set",
    "Oct",
    "Out",
    "Nov",
    "Nov",
    "Dec",
    "Dez",
  ];
  let agora = Date().split(" ");

  let geraISOhoje = (agora, conversao) =>
    `${agora[3]}-${conversao.indexOf(agora[1]) / 2 + 1}-${agora[2]}T${
      agora[4]
    }Z`;

  const redirect = useNavigate();
  useEffect(() => {
    axios
      .get("http://10.0.0.83:5000/api/perfil", { withCredentials: true })
      .then(({ data }) => {
        if (data === "Não autorizado") redirect("/login");
        setNome(data.nome);
      })
      .catch((err) => {
        console.log("Erro obtendo nome");
        setNome("Falha obtendo nome");
      });
  }, []);
  useEffect(() => {
    const getServicos = () => {
      axios
        .get("http://10.0.0.83:5000/api/servicos/status/pendente", {
          withCredentials: true,
        })
        .then(({ data }) => {
          if (data === "Não autorizado") redirect("/login");
          let novaContagem = {
            pendentes: data.length,
            novos: 0,
            atendimento: 0,
            parados: 0,
          };
          let novoPrazo = { vencidos: 0, hoje: 0, semana: 0 };
          let hoje = new Date();
          let semana = new Date();
          let amanha = new Date();
          semana.setDate(hoje.getDate() + ((5 + 7 - hoje.getDay()) % 7));
          amanha.setDate(hoje.getDate() + 1);
          hoje = hoje.toISOString();
          semana = semana.toISOString();
          amanha = amanha.toISOString();
          data !== "Não autorizado"
            ? data.forEach((servico) => {
                //console.log(i)
                //console.log(hoje)
                //console.log(amanha)
                //console.log(semana)
                let prazo = servico.prazo;
                //console.log(prazo)
                if (prazo < hoje) novoPrazo.vencidos += 1;
                if (prazo.split("T")[0] === hoje.split("T")[0])
                  novoPrazo.hoje += 1;
                if (prazo > amanha && prazo <= semana) novoPrazo.semana += 1;
                if (servico.createdAt.split("T")[0] === hoje.split("T")[0])
                  novaContagem.novos += 1;
                if (servico.atendimento === "true")
                  novaContagem.atendimento += 1;
              })
            : undefined;
          novaContagem.parados =
            novaContagem.pendentes - novaContagem.atendimento;
          setContagem(novaContagem);
          setPrazo(novoPrazo);
        })
        .catch((err) => console.error("Erro obtendo serviços.\n" + err));
      return () => {
        setServicos(undefined);
      };
    };
    getServicos();
    let interval = setInterval(getServicos, 500);
    return () => {
      clearInterval(interval);
    };
  }, []);

  //useEffect(()=>{
  //  Email.send({
  //    SecureToken: "b799e61b-8a4c-485a-ae41-cad05b498fee",
  //    To: "vamjunior01@gmail.com",
  //    From: "vamjunior01@gmail.com",
  //    Subject: "Teste",
  //    Body: "Teste teste"
  //  }).then(console.log)
  //},[])

  return (
    <Grid
      container
      item
      xs={12}
      display="flex"
      direction="row"
      justifyContent="space-between"
    >
      <Grid
        item
        container
        spacing={2}
        component={Card}
        elevation={5}
        xs={12}
        md={6}
        lg={4}
        xl={3}
        sx={{ padding: 3, marginTop: 3, zIndex: 1 }}
      >
        <Grid item xs={12}>
          <Stack
            direction="row"
            alignItems="flex-end"
            justifyContent="space-evenly"
          >
            <Typography variant="h5" component="h5" sx={{ fontWeight: 500 }}>
              {nome !== "Carregando..." && nome !== "Falha obtendo nome"
                ? "Olá,"
                : undefined}
            </Typography>
            <Typography component="h5" variant="h6" color="secondary">
              <strong>{nome}</strong>
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Tickets abertos</Typography>
          <Divider
            sx={{ backgroundColor: "#2DB5FA", borderWidth: 1, width: 1 }}
          />
        </Grid>
        <Grid item container xs={12}>
          <Grid item xs={6}>
            <Stack spacing={1} align="left" justifyContent="space-evenly">
              <Typography variant="h5">
                <strong>{contagem.pendentes} pendentes</strong>
              </Typography>
              <Typography variant="h6">{contagem.parados} parados</Typography>
              <Typography variant="h6">
                {contagem.atendimento} em atendimento
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Card
              elevation={6}
              sx={{
                paddingTop: 5,
                paddingX: 3,
                width: 100,
                height: 100,
                marginTop: 0,
                marginLeft: { sx: 0, md: 4, lg: 2, xl: 3 },
              }}
            >
              <Typography variant="h4" align="center">
                {" "}
                {contagem.novos}{" "}
              </Typography>
              <Typography variant="h5" align="center">
                {" "}
                novo{contagem.novos !== 1 ? "s" : undefined}{" "}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5">Vencimentos</Typography>
          <Divider
            sx={{ backgroundColor: "#2DB5FA", borderWidth: 1, width: 1 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Stack spacing={1}>
            <Typography>🟥 {contagemPrazo.vencidos} vencidos</Typography>
            <Typography>🟨 {contagemPrazo.hoje} vencem hoje</Typography>
            <Typography>
              🟩 {contagemPrazo.semana} vencem essa semana
            </Typography>
          </Stack>
        </Grid>
      </Grid>
      <Grid
        item
        component={Card}
        xs={2}
        elevation={5}
        sx={{ padding: 0, maxHeight: 250, margin: 10, marginTop: 3, zIndex: 1 }}
      >
        <Typography
          align="center"
          paddingTop={3}
          paddingBottom={2}
          variant="h4"
          sx={{ backgroundColor: "#B71B00", color: "#E6E6E6" }}
        >
          {conversao[conversao.indexOf(agora[1]) + 1]}
        </Typography>
        <Typography align="center" marginTop={3} variant="h1">
          {agora[2]}
        </Typography>
      </Grid>
      <Chat/>
    </Grid>
  );
};

export default Home;

/*
      <MChat
      sx={{
        position: "fixed",
        bottom: 0,
        right: 0,
        margin: 10,
        zIndex: 2
      }}/> */
//<CardMedia image="http://10.0.0.83:5000/images/silos2.jpeg" sx={{zIndex: -1, height:"90vh",width:"100vw", left: 0, opacity: 1, position: "absolute"}} />
