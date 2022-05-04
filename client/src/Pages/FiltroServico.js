import React from "react";
import Servicos from "../components/Servicos";
import axios from 'axios';

import {
  InputLabel,
  NativeSelect,
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
      filtro: "todos"
    };
  }

  componentDidMount(){
    this.geraservicos()
  }

  geraservicos() {
    let servicos = [];
    if (this.state.filtro === "todos") 
      axios.get('/servicos')
        .then((res)=>{servicos = res.data})
        .catch((err)=>{servicos[0].assunto = "Erro carregando serviços"; console.error(err)})  
        .finally(() => {this.setState({servicos: []}, ()=>{this.setState({servicos})})});
    else 
      axios.get('/servicos/' + this.state.filtro)
        .then((res)=>{servicos = res.data; console.log('Serviços recebidos: ' + JSON.stringify(servicos))})
        .catch((err)=>{servicos[0] = {}; servicos[0].assunto = "Erro carregando serviços"; console.error(err)}) 
        .finally(() => {this.setState({servicos}, ()=>{this.setState({servicos})})});
  }
  atualizafiltro(filtro) {
    console.log("Filtro atual: " + this.state.filtro);
    console.log("Filtro a ser atualizado: " + filtro);
    this.setState({filtro}, () => {
      console.log("Novo filtro: " + this.state.filtro);
      this.geraservicos();
    });

  }

  componentDidMount() {
    this.atualizafiltro("pendente");
  }

  render() {
    console.log("Atualizado");
    console.log("Serviços: " + JSON.stringify(this.state.servicos));
    return (
        <Grid container direction={{ xs: "column", md: "row" }}>
          <Grid item xs={12}>
      <Card>
        <Grid container>
          <Grid item xs={10} md={2}>
            <Stack p={2}>
              <InputLabel htmlFor="filtro">Status: </InputLabel>
              <NativeSelect
                size="small"
                sx={{ height: "fit-content" }}
                name="filtro"
                onChange={(e) => {
                  this.atualizafiltro(e.target.value);
                }}
              >
                  <option name='"pendente"'>pendente</option>
                  <option name='"resolvido"'>resolvido</option>
                  <option name='"fechado"'>fechado</option>
                  <option name='"todos"'>todos</option>
              </NativeSelect>

              <Card
                sx={{ margin: "1em", padding: "1em", placeContent: "center" }}
                elevation="2"
              >
                <Typography variant="caption">
                  {this.state.filtro !== '"todos"'
                    ? "Serviços " +
                      this.state.filtro +
                      "s: " +
                      this.state.servicos.length
                    : "Todos os serviços: " + this.state.servicos.length}
                </Typography>
              </Card>
            </Stack>
          </Grid>
          <Grid item md={10}>
            <Servicos
              servicos={this.state.servicos}
              ir_para_pagina={this.props.ir_para_pagina}
              acao={this.props.acao}
            />
          </Grid>
          </Grid>
      </Card>
      </Grid>
        </Grid>
    );
  }
}
export default Filtro;
