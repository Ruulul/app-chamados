import React from "react";
import axios from 'axios';
import UpBar from "../components/UpBar";
import SideBar from "../components/SideBar";
import Requisicao from "../components/Requisicao";
import Home from "./Home";
import Filtro from "./FiltroServico";
import Chamado from "./Chamado";
import Indicadores from "./Indicadores";

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
    this.geraidservico = this.geraidservico.bind(this);

    this.exibe_pagina = this.exibe_pagina.bind(this);
    this.ir_para_pagina = this.ir_para_pagina.bind(this);
    this.troca_aba = this.troca_aba.bind(this);
    this.fechar_aba = this.fechar_aba.bind(this);

    this.servicos = this.servicos.bind(this);
    this.indicadores = this.indicadores.bind(this);
  }

  componentDidMount(){ 
    let servicos = [];
    axios.get('/api/servicos')
    .then((res)=>{servicos = res.data})
    .catch((err)=>{servicos[0].assunto = "Erro carregando serviços"; console.error(err)})  
    .finally(() => {this.setState({servicos: []}, ()=>{this.setState({servicos})})});
  }

  adicionaservico(servico = null) {
    let actualServicos = this.state.servicos;
    let pos = 1
    if (servico) {
      servico.editando = true;
      pos = actualServicos.length;
      actualServicos[pos] = servico;
    } else
      actualServicos[pos] = {
        departamento: "Contábil",
        prioridade: 1,
        anexo: undefined,
        assunto: "",
        autor: "",
        chat: [{ autor: "", mensagem: "" }],
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

  async abreservico(id) {
    axios.get('/api/servico/' + id)
      .then((res)=>this.adicionaservico(res.data))
      .catch((err)=>console.log("Erro abrindo serviço. " + err))
  }

  troca_aba(pos) {
    this.setState({ aberto: -1 }, () => {
      this.setState({ aberto: pos });
    });
  }

  removeservico(pos) {
    let actualServicos = this.state.servicos;
    let ppos = -1;
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
  }

  salvaservico(req) {
    axios.post('/api/novo/servico', req)
      .then(res=>{this.setState({}, () => this.setState({}));console.log('Serviço salvo: ' + JSON.stringify(res.data))})
      .catch(err=>console.error('Falha em salvar o serviço'));
    ;
  }

  atualizaservicoservidor(req) {
    axios.post('/api/update/servico/' + req.id, req)
      .then(res=>{this.setState({}, ()=> this.setState({})); console.log('Servico salvo: ' + JSON.stringify(res.data))})
      .catch(err=>console.error('Falha em atualizar o serviço'))
  }

  async geraidservico() {
    let temp_id = 0;
    await axios.get('/api/servicos')
      .then(({data})=>temp_id=data.length)
      .catch((err)=>{console.log('Erro gerando serviços. ' + err)})
    return temp_id;
  }

  fechar_aba() {
    this.setState({ servicos: [], aberto: -1 }, () => {
      this.setState({ servicos: [], aberto: -1 });
    });
  }

  servico() {
    let aberto = this.state.aberto;
    let infos =
      aberto !== -1
        ? (this.state.servicos[this.state.aberto])
        : {
            departamento: "Contábil",
            prioridade: 1,
            anexo: undefined,
            assunto: "",
            autor: "",
            chat: {
              create: [{ autor: "", mensagem: "" }]
            },
            id: this.geraidservico,
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
        atualiza={this.atualizaservicoservidor}
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
        <Filtro
          ir_para_pagina={this.abreservico}
          acao={(e, s) => {
            this.altera_status_servico(e, s);
          }}
        />
    );
  }

  async ir_para_pagina(n) {
    this.setState({ aberto: n });
  }

  indicadores(){
    console.log("Exibir indicadores certamente")
    return <Indicadores />;
  }

  exibe_pagina(n) {
    console.log("Exibir página " + (-n))
    switch (n) {
      case -3:
        console.log("Exibir indicadores")
        return this.indicadores();
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
          />
        </Grid>
        <Grid item xs={0} md={0} />
        <Grid item xs={12} md={1}>
          <SideBar this={this} ir_para_pagina={this.ir_para_pagina} />
        </Grid>
        <Grid item sx={{ padding: 0 }} xs={24} md={10}>
          <Divider />
          {this.exibe_pagina(aberto)}
        </Grid>
      </Grid>
    );
  }
}

export default TheMain;
