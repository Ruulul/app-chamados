import React from "react";
import Servicos from "../components/Servicos";

import {
  InputLabel,
  Select,
  Card,
  Stack,
  Grid,
  Typography
} from "@mui/material";

class Filtro extends React.Component {
  constructor(props) {
    super(props);

    this.geraservicos = this.geraservicos.bind(this);
    this.atualizafiltro = this.atualizafiltro.bind(this);

    this.state = {
      servicos: [],
      filtro: '"todos"'
    };
    this.setState({ servicos: [] }, () => {
      this.setState({ servicos: this.geraservicos() });
    });
  }
  geraservicos() {
    let servicos = [];
    console.log(localStorage);
    Object.keys(localStorage).forEach((k) => {
      if (
        localStorage[k].includes('"tipo":"servico"') &&
        (this.state.filtro !== '"todos"'
          ? localStorage[k].includes('"status":' + this.state.filtro)
          : true)
      )
        servicos = [...servicos, JSON.parse(localStorage[k])];
    });
    servicos.sort((a, b) => {
      return a.prioridade - b.prioridade;
    });
    return servicos;
  }
  atualizafiltro(filtro) {
    console.log("Filtro atual: " + this.state.filtro);
    console.log("Filtro a ser atualizado: " + filtro);
    this.setState({ filtro: '"' + filtro + '"' }, () => {
      console.log("Novo filtro: " + this.state.filtro);
    });

    this.setState({ servicos: [] }, () => {
      this.setState({ servicos: this.geraservicos() });
    });
  }

  componentDidMount() {
    this.atualizafiltro("pendente");
  }

  render() {
    console.log("Atualizado");
    console.log("Serviços: " + JSON.stringify(this.state.servicos));
    return (
      <Card>
        <Grid container direction={{ xs: "column", md: "row" }}>
          <Grid item xs={12} md={1}>
            <Stack p={2}>
              <InputLabel htmlFor="filtro">Status: </InputLabel>
              <Select
                size="small"
                style={{ height: "fit-content" }}
                name="filtro"
                onChange={(e) => {
                  this.atualizafiltro(e.target.value);
                }}
              >
                <Typography>
                  <option name='"pendente"'>pendente</option>
                  <option name='"resolvido"'>resolvido</option>
                  <option name='"fechado"'>fechado</option>
                  <option name='"todos"'>todos</option>
                </Typography>
              </Select>

              <Card
                sx={{ margin: "1em", padding: "1em", placeContent: "center" }}
                elevation="2"
              >
                <Typography variant="caption">
                  {this.state.filtro !== '"todos"'
                    ? "Serviços " +
                      this.state.filtro.replace('"', "").replace('"', "") +
                      "s: " +
                      this.state.servicos.length
                    : "Todos os serviços: " + this.state.servicos.length}
                </Typography>
              </Card>
            </Stack>
          </Grid>
          <Grid item md={8}>
            <Servicos
              servicos={this.state.servicos}
              ir_para_pagina={this.props.ir_para_pagina}
              acao={this.props.acao}
            />
          </Grid>
        </Grid>
      </Card>
    );
  }
}
export default Filtro;
