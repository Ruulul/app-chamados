import React from "react";
import {
  Grid,
  Stack,
  Box,
  Button,
  TextField,
  Input,
  InputLabel,
  NativeSelect
} from "@mui/material";

class Requisicao extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pos: props.pos,
      enviar: props.enviar,
      fechar: props.fechar,
      atualizar: props.atualizar,
      visivel: true,
      infos: props.infos,
      lista_options: [
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
      ]
    };

    console.log("Infos: " + JSON.stringify(this.state.infos));
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    let infos = this.state.infos;
    if (event.target.name === "prioridade") {
      let prioridades = ["Baixa", "Padrão", "Alta", "Urgente"];
      infos[event.target.name] = prioridades.indexOf(event.target.value) + 1;
    } else if (event.target.name === "mensagem")
      infos.chat[0].mensagem = event.target.value;
    else if (event.target.name === "usuario")
      infos.chat[0].usuario = event.target.value;
    else infos[event.target.name] = [event.target.value][0];
    this.setState({ infos });
    this.state.atualizar(this.state.pos, infos);
  }

  handleSubmit(event) {
    event.preventDefault();
    let requisicao = this.state.infos;
    requisicao.status = "pendente";
    requisicao.tipo = "servico";
    this.state.enviar(requisicao);
    this.state.fechar(this.state.pos);
  }

  render() {
    let prioridades = ["Baixa", "Padrão", "Alta", "Urgente"];
    return (
      <Box sx={{ mt: "1em" }} component="form" onSubmit={this.handleSubmit}>
        <Grid
          container
          item
          spacing={2}
          direction={{ xs: "column-reverse", sm: "row" }}
        >
          <Grid item container xs={10} direction={{ xs: "column", sm: "row" }}>
            <Grid item xs={3}>
              <Stack spacing>
                <TextField
                  label="Usuário"
                  name="usuario"
                  size="small"
                  onChange={this.handleChange}
                  value={this.state.infos.chat[0].assunto}
                  required
                />
                <InputLabel>Departamento: </InputLabel>
                <NativeSelect
                  name="departamento"
                  onChange={this.handleChange}
                  value={this.state.infos.departamento}
                >
                  {this.state.lista_options}
                </NativeSelect>
                <InputLabel>Prioridade: </InputLabel>

                <NativeSelect
                  name="prioridade"
                  type="dropdown"
                  label="Prioridade: "
                  onChange={this.handleChange}
                  value={prioridades[this.state.infos.prioridade - 1]}
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
                  onChange={this.handleChange}
                  value={this.state.infos.anexo}
                />
              </Stack>
            </Grid>
            <Grid item xs={8.75}>
              <Stack spacing justifyContent="space-between">
                <TextField
                  name="assunto"
                  size="small"
                  label="Assunto"
                  type="text"
                  onChange={this.handleChange}
                  value={this.state.infos.assunto}
                  required
                />
                <TextField
                  multiline
                  size="small"
                  name="mensagem"
                  type="text"
                  label="Corpo da Mensagem"
                  onChange={this.handleChange}
                  value={this.state.infos.chat[0].mensagem}
                  minRows="6"
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
              onClick={() => this.state.fechar(this.state.pos)}
            >
              X
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  }
}

export default Requisicao;
