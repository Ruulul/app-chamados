import React from "react";
import UpBar from "../components/UpBar";
import SideBar from "../components/SideBar";
import Requisicao from "../components/Requisicao";
import Home from "./Home";
import Filtro from "../Pages/FiltroServico";
import Chamado from "./Chamado";

import { Grid, Divider } from "@mui/material";

class TheMain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      servicos: [],
      aberto: -1
    };

    this.servico = this.servico.bind(this);
    this.adicionaservico = this.adicionaservico.bind(this);
    this.abreservico = this.abreservico.bind(this);
    this.removeservico = this.removeservico.bind(this);
    this.atualizaservico = this.atualizaservico.bind(this);
    this.salvaservico = this.salvaservico.bind(this);
    this.altera_status_servico = this.altera_status_servico.bind(this);

    this.exibe_pagina = this.exibe_pagina.bind(this);
    this.ir_para_pagina = this.ir_para_pagina.bind(this);
    this.troca_aba = this.troca_aba.bind(this);
    this.fechar_aba = this.fechar_aba.bind(this);

    this.servicos = this.servicos.bind(this);
  }

  adicionaservico(servico = null) {
    let actualServicos = this.state.servicos;
    let pos = actualServicos.length;
    if (servico) {
      servico.editando = true;
      actualServicos[pos] = servico;
    } else
      actualServicos[pos] = {
        departamento: "Contábil",
        prioridade: 1,
        anexo: undefined,
        assunto: "",
        chat: [{ usuario: "", mensagem: "" }],
        id: this.geraidservico(pos),
        status: "pendente",
        editando: false
      };
    this.setState(
      {
        servicos: [],
        aberto: -1
      },
      () => {
        this.setState({ servicos: actualServicos, aberto: pos });
      }
    );
  }

  abreservico(id) {
    let servico = JSON.parse(localStorage[id]);
    this.adicionaservico(servico);
  }

  troca_aba(pos) {
    this.setState({ aberto: -1 }, () => {
      this.setState({ aberto: pos });
    });
  }

  removeservico(pos) {
    console.log("Removing " + pos + "º element");
    let actualServicos = this.state.servicos;
    let ppos =
      pos === this.state.servicos.length - 1 ? -2 : actualServicos.length - 2;
    actualServicos.splice(pos, 1);
    this.setState(
      {
        servicos: [],
        aberto: -1
      },
      () => {
        this.setState({ servicos: actualServicos, aberto: ppos });
      }
    );
  }

  atualizaservico(pos, atual) {
    let actualServicos = this.state.servicos;
    actualServicos[pos] = atual;
    this.setState({ servicos: actualServicos });

    console.log(
      "Assunto: " +
        atual.assunto +
        "\nMensagem: " +
        atual.chat[0].mensagem +
        "\nUsuário: " +
        atual.chat[0].usuario +
        "\nEditando? " +
        atual.editando +
        "\nPrioridade: " +
        atual.prioridade +
        "\nStatus: " +
        atual.status
    );
  }

  salvaservico(req) {
    if (!req.editando) while (localStorage[req.id]) req.id++;
    localStorage[req.id] = JSON.stringify(req);
    this.setState({}, () => this.setState({}));
  }

  geraidservico(n) {
    return parseInt(((n + 1) / 13) * 1000, 10);
  }

  fechar_aba() {
    this.setState({ servicos: [], aberto: -1 }, () => {
      this.setState({ servicos: [], aberto: -1 });
    });
  }

  servico() {
    let aberto = this.state.aberto;
    console.log("Aberto na posição " + aberto);
    let infos =
      aberto !== -1
        ? this.state.servicos[aberto]
        : {
            departamento: "Contábil",
            prioridade: 1,
            anexo: undefined,
            assunto: "",
            chat: [{ usuario: "", mensagem: "" }],
            id: this.geraidservico(aberto),
            status: "pendente",
            editando: false
          };
    return !infos.editando ? (
      <Requisicao
        infos={infos}
        fechar={this.removeservico}
        atualizar={this.atualizaservico}
        enviar={this.salvaservico}
        pos={aberto}
        this={this}
      />
    ) : (
      <Chamado
        mudastatus={this.altera_status_servico}
        infos={infos}
        atualiza={this.salvaservico}
      />
    );
  }

  home() {
    return <Home />;
  }

  altera_status_servico(servico) {
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
    if (servico) this.salvaservico(servico);
  }

  servicos() {
    return (
      <div style={{ display: "flex" }}>
        <Filtro
          ir_para_pagina={this.abreservico}
          acao={(e, s) => {
            this.altera_status_servico(e, s);
          }}
        />
      </div>
    );
  }

  ir_para_pagina(n) {
    this.setState({ aberto: n });
  }

  exibe_pagina(n) {
    switch (n) {
      case -2:
        return this.servicos();
      case -1:
        return this.home();
      default:
        return this.servico();
    }
  }

  render() {
    let aberto = this.state.aberto;

    return (
      <Grid container orientation="row" spacing={1}>
        <Grid container item xs={12} justifyContent="center">
          <UpBar
            servicos={this.state.servicos}
            plus={this.adicionaservico}
            close={this.fechar_aba}
            switch={this.troca_aba}
          />
        </Grid>
        <Grid item xs={0} md={0} />
        <Grid item xs={12} md={1}>
          <SideBar this={this} ir_para_pagina={this.ir_para_pagina} />
        </Grid>
        <Grid item sx={{ width: 1, padding: 0 }} sm={12} md={10}>
          <Divider />
          {this.exibe_pagina(aberto)}
        </Grid>
      </Grid>
    );
  }
}

export default TheMain;
