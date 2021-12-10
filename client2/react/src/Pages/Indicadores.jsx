import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Card,
  Typography,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Skeleton,
  Stack,
  Divider,
} from "@mui/material";

import IndicadorGrafico from "../Components/IndicadoresGraficos";
import {
  Donut,
  Bar,
  BarLabelled,
  RadialBar,
} from "../Components/IndGraficosMui";
import { PrioridadeTodos } from "../Components/IndicadoresGraficos";

import { useNavigate } from "react-router-dom";

async function Servicos(filtro) {
  let Tabela = "Não autorizado";
  await axios
    .get("http://10.0.0.83:5000/api/servicos", { withCredentials: true })
    .then(({ data }) => {
      if (data === "Não autorizado") return "Não autorizado";
      switch (filtro) {
        case "abertos":
          let servicos_abertos = [];
          data.forEach((servico) => {
            if (servico.status === "pendente" || servico.status === "resolvido")
              servicos_abertos = [...servicos_abertos, servico];
          });

          Tabela = servicos_abertos;
          break;
        case "pendentes":
          let servicos_pendentes = [];
          data.forEach((servico) => {
            if (servico.status === "pendente")
              servicos_pendentes = [...servicos_pendentes, servico];
          });

          Tabela = servicos_pendentes;
          break;
        case "resolvidos":
          let servicos_resolvidos = [];
          data.forEach((servico) => {
            if (servico.status === "resolvido")
              servicos_resolvidos = [...servicos_resolvidos, servico];
          });

          Tabela = servicos_resolvidos;
        default:
          Tabela = data;
      }
    })
    .catch((err) => {
      Tabela = (
        <Typography>
          Ocorreu um erro ao carregar a tabela de {filtro}
        </Typography>
      );
    });
  return Tabela;
}

const IndicadoresMui = (props) => {
  const redirect = useNavigate();
  const [servicos_abertos, setServicosAbertos] = useState([]);
  const [servicos_pendentes, setServicosPendentes] = useState([]);
  const [servicos_resolvidos, setServicosResolvidos] = useState([]);
  const [servicosTodos, setTodos] = useState([]);
  const [tiposA, setTiposA] = useState([]);
  const [tiposP, setTiposP] = useState([]);
  const [tiposR, setTiposR] = useState([]);
  const [departamentosA, setDepartamentosA] = useState([]);
  const [departamentosP, setDepartamentosP] = useState([]);
  const [departamentosR, setDepartamentosR] = useState([]);

  const values_abertos_tipo = tiposA.map((tipo) => ({
    label: tipo,
    value: Math.floor(
      (100 * servicos_abertos.filter((s) => s.tipo === tipo).length) /
        servicos_abertos.length
    ),
  }));
  const values_pendentes_tipo = tiposP.map((tipo) => ({
    label: tipo,
    value: Math.floor(
      (100 * servicos_pendentes.filter((s) => s.tipo === tipo).length) /
        servicos_pendentes.length
    ),
  }));
  const values_resolvidos_tipo = tiposR.map((tipo) => ({
    label: tipo,
    value: Math.floor(
      (100 * servicos_resolvidos.filter((s) => s.tipo === tipo).length) /
        servicos_resolvidos.length
    ),
  }));
  const values_abertos_departamento = departamentosA.map((dep) => ({
    label: dep,
    value: Math.floor(
      (100 * servicos_abertos.filter((s) => s.departamento === dep).length) /
        servicos_abertos.length
    ),
  }));
  const values_pendentes_departamento = departamentosP.map((dep) => ({
    label: dep,
    value: Math.floor(
      (100 * servicos_pendentes.filter((s) => s.departamento === dep).length) /
        servicos_pendentes.length
    ),
  }));
  const values_resolvidos_departamento = departamentosR.map((dep) => ({
    label: dep,
    value: Math.floor(
      (100 * servicos_resolvidos.filter((s) => s.departamento === dep).length) /
        servicos_resolvidos.length
    ),
  }));

  function setarServicosAbertos(servicos) {
    if (servicos === "Não autorizado") redirect("/login");
    let servicosa = servicos.filter(
      (s) => s.status === "pendente" || s.status === "resolvido"
    );
    setTiposA([...new Set(servicosa.map((s) => s.tipo))]);
    setDepartamentosA([...new Set(servicosa.map((s) => s.departamento))]);
    setServicosAbertos(servicosa);
  }
  function setarServicosPendentes(servicos) {
    if (servicos === "Não autorizado") redirect("/login");
    let servicosp = servicos.filter((s) => s.status === "pendente");
    setServicosPendentes(servicosp);
    setTiposP([...new Set(servicosp.map((s) => s.tipo))]);
    setDepartamentosP([...new Set(servicosp.map((s) => s.departamento))]);
  }
  function setarServicosResolvidos(servicos) {
    if (servicos === "Não autorizado") redirect("/login");
    let servicosr = servicos.filter((s) => s.status === "resolvido");
    setServicosResolvidos(servicosr);
    setTiposR([...new Set(servicosr.map((s) => s.tipo))]);
    setDepartamentosR([...new Set(servicosr.map((s) => s.departamento))]);
  }
  async function setarServicosTodos() {
    let servicos = await Servicos("");
    if (servicos === "Não autorizado") redirect("/login");
    setTodos(servicos);
    return servicos;
  }

  useEffect(() => {
    const setAll = () => {
      setarServicosTodos().then((s) => {
        setarServicosAbertos(s);
        setarServicosPendentes(s);
        setarServicosResolvidos(s);
      });
    };
    setAll()
    let interval = setInterval(setAll, 2000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid key={1} item container xs={12} spacing={5} mt={5}>
        <Grid key={1} item xs={12}>
          <Divider key={1} />
          <Typography key={2} variant="h4">
            Status
          </Typography>
        </Grid>
        <Grid key={2} item container xs={12}>
          <Grid key={1} item xs={4}>
            <Card elevation={5} sx={{ width: "fit-content", padding: 3 }}>
              <Typography key={1} variant="h4" mb={2}>
                {servicos_abertos.length} serviços abertos
              </Typography>
              <Typography key={2} variant="h5">
                Categoria
              </Typography>
              <RadialBar
                key={3}
                label="teste"
                size={100}
                values={values_abertos_tipo}
              />

              {values_abertos_tipo.map((a, i, ar) => {
                let color_factor = (i / (ar.length - 1)) * 195;
                let color_color = `rgb(${195 - color_factor}, ${
                  195 - color_factor
                }, ${color_factor})`;
                return (
                  <Typography
                    key={i}
                    variant="subtitle1"
                    sx={{ color: color_color }}
                  >{`${a.label}: ${a.value}%`}</Typography>
                );
              })}
              <Typography key={4} variant="h5">
                Departamento
              </Typography>
              <RadialBar
                key={5}
                label="teste"
                size={75}
                values={values_abertos_departamento}
              />

              {values_abertos_departamento.map((a, i, ar) => {
                let color_factor = (i / (ar.length - 1)) * 195;
                let color_color = `rgb(${195 - color_factor}, ${
                  195 - color_factor
                }, ${color_factor})`;
                return (
                  <Typography
                    key={i}
                    variant="subtitle1"
                    sx={{ color: color_color }}
                  >{`${a.label}: ${a.value}%`}</Typography>
                );
              })}
            </Card>
          </Grid>
          <Grid key={2} item xs={4}>
            <Card elevation={5} sx={{ width: "fit-content", padding: 3 }}>
              <Typography key={1} variant="h4" mb={2}>
                {servicos_pendentes.length} serviços pendentes
              </Typography>
              <Typography key={2} variant="h5">
                Categoria
              </Typography>
              <RadialBar
                key={3}
                label="teste"
                size={100}
                values={values_pendentes_tipo}
              />

              {values_pendentes_tipo.map((a, i, ar) => {
                let color_factor = (i / (ar.length - 1)) * 195;
                let color_color = `rgb(${195 - color_factor}, ${
                  195 - color_factor
                }, ${color_factor})`;
                return (
                  <Typography
                    key={i}
                    variant="subtitle1"
                    sx={{ color: color_color }}
                  >{`${a.label}: ${a.value}%`}</Typography>
                );
              })}
              <Typography key={4} variant="h5">
                Departamento
              </Typography>
              <RadialBar
                key={5}
                label="teste"
                size={75}
                values={values_pendentes_departamento}
              />

              {values_pendentes_departamento.map((a, i, ar) => {
                let color_factor = (i / (ar.length - 1)) * 195;
                let color_color = `rgb(${195 - color_factor}, ${
                  195 - color_factor
                }, ${color_factor})`;
                return (
                  <Typography
                    key={i}
                    variant="subtitle1"
                    sx={{ color: color_color }}
                  >{`${a.label}: ${a.value}%`}</Typography>
                );
              })}
            </Card>
          </Grid>
          <Grid key={3} item xs={4}>
            <Card elevation={5} sx={{ width: "fit-content", padding: 3 }}>
              <Typography key={1} variant="h4" mb={2}>
                {servicos_resolvidos.length} serviços resolvidos
              </Typography>
              <Typography key={2} variant="h5">
                Categoria
              </Typography>
              <RadialBar
                key={3}
                label="teste"
                size={100}
                values={values_resolvidos_tipo}
              />

              {values_resolvidos_tipo.map((a, i, ar) => {
                let color_factor = (i / (ar.length - 1)) * 195;
                let color_color = `rgb(${195 - color_factor}, ${
                  195 - color_factor
                }, ${color_factor})`;
                return (
                  <Typography
                    key={i}
                    variant="subtitle1"
                    sx={{ color: color_color }}
                  >{`${a.label}: ${a.value}%`}</Typography>
                );
              })}
              <Typography key={4} variant="h5">
                Departamento
              </Typography>
              <RadialBar
                key={5}
                label="teste"
                size={75}
                values={values_resolvidos_departamento}
              />

              {values_resolvidos_departamento.map((a, i, ar) => {
                let color_factor = (i / (ar.length - 1)) * 195;
                let color_color = `rgb(${195 - color_factor}, ${
                  195 - color_factor
                }, ${color_factor})`;
                return (
                  <Typography
                    key={i}
                    variant="subtitle1"
                    sx={{ color: color_color }}
                  >{`${a.label}: ${a.value}%`}</Typography>
                );
              })}
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid key={2} item xs={12}>
        <Divider key={1} />
        <Typography key={2} variant="h4" padding={3}>
          Urgência
        </Typography>
        <Card key={3} elevation={5}>
          <Grid key={1} container spacing={2} padding={2}>
            {["Baixa", "Média", "Alta", "Urgente"].map((prioridade, i) => {
              let valor = Math.floor(
                (100 *
                  servicosTodos.filter(
                    (s) =>
                      s.prioridade == String(i + 1).valueOf() &&
                      (s.status == "pendente" || s.status == "resolvido")
                  ).length) /
                  servicosTodos.filter(
                    (s) => s.status == "pendente" || s.status == "resolvido"
                  ).length
              );
              return (
                <>
                  <Grid item xs={6} key={i * 2 + 2}>
                    <Typography variant="h5">
                      {`${valor}% ${prioridade}`}
                    </Typography>
                  </Grid>
                  <Grid key={i * 2 + 3} item xs={12}>
                    <Bar size={100} value={valor} label={prioridade} />
                  </Grid>
                </>
              );
            })}
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
};

export default IndicadoresMui;
