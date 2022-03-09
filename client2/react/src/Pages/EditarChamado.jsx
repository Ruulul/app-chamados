import { useEffect, useLayoutEffect, useReducer } from "react"
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
import FormData from "form-data"

const toBase64 = (file, id) => new Promise((resolve, reject) => {

  console.log(file)

  const reader = new FileReader();
 
  reader.onload = () => {console.log(reader.result); resolve({title: file.name, data: reader.result, descr: `Chamado n° ${id}`})};
 
  reader.onerror = error => reject(error);

  reader.readAsDataURL(file);
 
  });

function reducer(/*state*/new_state, action) {
  //let new_state = { ...state };
  switch (action.type) {
    case "setNome": {
      new_state.nome = action.payload;
      return {...new_state};
    }
    case "setAtendentes": {
      new_state.atendentes = action.payload;
      return new_state;
    }
    case "setAtendente": {
      new_state.infos.atendenteId = action.payload.id
      new_state.atendente = action.payload.nome
      return {...new_state};
    }
    case "setInfos": {
      new_state.infos = { ...new_state.infos, ...action.payload }
      return {...new_state};
    }
    case "setCategorias": {
      new_state.categorias = action.payload
      return {...new_state};
    }
  }
}

const initialState = {
  infos: {
    departamento: "Contábil",
    prioridade: 1,
    anexo: undefined,
    assunto: "",
    autorId: undefined,
    tipo: "Infraestrutura",
    subCategoria: "Impressora",
    id: undefined,
    atendenteId: undefined,
    atendente: undefined,
    status: "pendente"
  },
  nome: undefined,
  atendentes: [],
  atendente: undefined,
  categorias: []
}

export default function EditarChamado() {
  const idChamado = useParams().id
  const navigate = useNavigate()

  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    axios("get", '/api/perfil')
      .then(({ data }) => {
        dispatch({ type: "setNome", payload: data.nome })
      })
      .catch(err => {
        console.log("Erro obtendo nome");
        dispatch({ type: "setNome", payload: "Erro obtendo nome" })
      })
  }, [])

  useEffect(() => {
    axios("get", "/api/servico/" + idChamado)
      .then(async ({ data: chamado }) => {
        dispatch({ type: "setInfos", payload: chamado });
        axios("get", "/api/usuario/" + chamado.atendenteId)
          .then(({ data: payload }) => {
            dispatch({ type: "setAtendente", payload })
          });
      })
      .catch(err => console.log(err));
  }, [])

  useEffect(()=>{
    axios('get', '/api/servicos/categorias/') //+ infos.tipo)
    .then(
      ({ data: categorias }) => {
        dispatch({ type: "setCategorias", payload: categorias.filter(c => c.tipo == state.infos.tipo) });
        axios("get", '/api/usuarios/area/' + state.infos.tipo)
          .then(
            ({ data: payload }) => {
              dispatch({ type: "setAtendentes", payload });
            }
          )
          .catch(
            err => {
              console.log("Erro obtendo atendentes. \n" + err);
              dispatch({
                type: "setAtendentes",
                payload: [
                  { nome: "Sem atendentes nessa categoria" }
                ]
              })
            }
          )
      }
    )
    .catch(err => console.log(err))
  }, [state.infos.tipo])

  async function handleChange(event) {
    let novas_infos = { ...state.infos }
    if (event.target.name === "atendente") {
      novas_infos.atendenteId = state.atendentes[(state.atendentes.map((atendente) => { return atendente.nome })).indexOf(event.target.value)].id
      novas_infos.atendente = event.target.value
    }
    else if (event.target.name === "prioridade") {
      let prioridades = ["🟩Baixa", "🟧Média", "🟥Alta", "⬛Urgente"];
      novas_infos[event.target.name] = prioridades.indexOf(event.target.value) + 1;
    }
  else if (event.target.name === "anexo") {
    novas_infos.anexo = await toBase64(event.target.files[0], state.infos.id)
  }
    else novas_infos[event.target.name] = [event.target.value][0];
    dispatch({ type: "setInfos", payload: novas_infos })
    console.log("Infos atualizadas")
  }

  async function getPrazo() {
    let data = new Date()
    switch (state.infos.prioridade) {
      case 1:
        data.setDate(data.getDate() + 3)
        return data;
      case 2:
        data.setDate(data.getDate() + 2)
        return data;
      case 3:
        data.setDate(data.getDate() + 1)
        return data;
      case 4:
        data = new Date(data.getTime() + 28800000)
        return data;
      default:
        return "Isso não devia acontecer"
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    let infos = {...state.infos}
    delete infos.anexo
    await getPrazo().then(async (prazo) => {
      if (typeof (state.infos.prazo) === "object")
        state.infos.prazo = prazo.toISOString()
      await axios("post", '/api/update/servico/' + idChamado, infos)
        .then(res => {
          if (state.infos.anexo) {
            let anexo = new FormData()
            anexo.append('title', state.infos.anexo.title)
            anexo.append('data', state.infos.anexo.data)
            anexo.append('descr', state.infos.anexo.descr)
            axios("post", `/api/update/servico/${infos.id}/arquivo`, anexo, {headers: {'Content-Type': 'multipart/form-data'}})
            .then(data=>{console.log("Arquivo salvo com sucesso"); navigate('/servicos')})
            .catch(err=>console.log("Erro em salvar o arquivo.\n",err))
          } else
          navigate('/servicos')
        })
        .catch(err => console.log("Erro em salvar o chamado." + err))
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
                      {state.nome === undefined ? "Carregando..." : ("Olá, " + state.nome)}
                    </Typography>
                    <Typography variant="h5">
                      {state.infos.id === undefined ? "Carregando..." : ("Ticket nº " + state.infos.id)}
                    </Typography>
                    <Typography>
                      {state.atendente === undefined ? "Carregando..." : ("Designado para: " + state.atendente)}
                    </Typography>
                    <Typography variant="h5">
                      {state.infos.assunto === undefined ? "Carregando..." : state.infos.assunto}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack component={Card} alignItems="left" width="fit-content" p={5} pb={3} spacing={1} pt={2}>
                    <Typography variant="h6">
                      Dados a serem enviados
                    </Typography>
                    {state.infos ?
                      Object.entries(state.infos)
                        .filter(info =>
                          info[0] == "departamento" ||
                          info[0] == "prioridade" ||
                          info[0] == "departamento" ||
                          info[0] == "tipo" ||
                          info[0] == "subCategoria" ||
                          info[0] == "atendente")
                        .map(info => <Typography>
                          {info[0] == "prioridade"
                            ? "Urgência"
                            : info[0] == "subCategoria"
                              ? "Sub-Categoria"
                              : info[0] == "tipo"
                                ? "Categoria"
                                : `${info[0][0].toUpperCase()}${info[0].slice(1)}`}: {" "}
                          {info[0] == "prioridade"
                            ? `${["Baixa", "Média", "Alta", "Urgente"][parseInt(info[1]) - 1]}`
                            : info[1]}</Typography>)
                      : undefined}
                  </Stack>
                </Grid>
              </Grid>
              <InputLabel>Categoria: </InputLabel>
              <NativeSelect
                name="tipo"
                onChange={handleChange}
                value={state.infos.tipo || "Infraestrutura"}
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
              <InputLabel>
                Sub-Categoria:
              </InputLabel>
              <NativeSelect
                name="subCategoria"
                onChange={handleChange}
                value={state.infos.subCategoria || "Carregando..."}
              >
                {state.categorias.map((categoria, key) => <option key={key}>{categoria.categoria}</option>)}
              </NativeSelect>
              <InputLabel>Atendente: </InputLabel>
              <NativeSelect
                name="atendente"
                onChange={handleChange}
                onClick={handleChange}
                value={state.infos.atendente || "Carregando..."}
              >
                {state.atendentes.map((atendente, i) => {
                  return <option key={i} name="atendente">{atendente.nome}</option>
                })}
              </NativeSelect>
              <InputLabel>Departamento: </InputLabel>
              <NativeSelect
                name="departamento"
                onChange={handleChange}
                value={state.infos.departamento || "Carregando"}
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
                <option key={10}>
                  Classificação
                </option>
                <option key={11}>
                  Almoxarifado
                </option>
                <option key={12}>
                  Compras
                </option>
              </NativeSelect>
              <InputLabel>Urgência: </InputLabel>
              <NativeSelect
                name="prioridade"
                type="dropdown"
                label="Prioridade: "
                onChange={handleChange}
                value={["🟩Baixa", "🟧Média", "🟥Alta", "⬛Urgente"][state.infos.prioridade - 1]}
              >
                <option name="1" style={{}}>🟩Baixa</option>
                <option name="2" style={{}}>🟧Média</option>
                <option name="3" style={{}}>🟥Alta</option>
                <option name="4" style={{}}>⬛Urgente</option>
              </NativeSelect>
              <InputLabel htmlFor="anexo">Anexo: </InputLabel>
              <Input
                name="anexo"
                type="file"
                onChange={handleChange}
              />
              <img src={state.infos.anexo?.data} width="100%"/>
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