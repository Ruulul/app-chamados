
import React, {useState, useEffect} from 'react';
import {Bar, Doughnut, Radar} from 'react-chartjs-2';

import {Grid} from '@mui/material';



const BarGraph = ({servicos, tipo}) => {
    const [state, setState] = useState({datasets: []});

    useEffect(()=>{
        let todos = Array(5).fill(0)
        let infra =  Array(5).fill(0)
        let sist = Array(5).fill(0)
        let dev =  Array(5).fill(0)
        servicos.forEach(element => {
            if (tipo === "aberto")
            todos[element.prioridade - 1] += element.status === "resolvido" || element.status === "pendente" ?  1 : 0;
            else
            todos[element.prioridade - 1] += element.status === tipo ? 1 : 0;
            if((tipo === "aberto" ? element.status === "resolvido" || element.status === "pendente" : element.status === tipo))
            switch(element.tipo) {
              case "Infraestrutura":
                infra[element.prioridade - 1] += 1
                break;
              case "Sistemas":
                sist[element.prioridade - 1] += 1
                break;
              case "Desenvolvimento":
                dev[element.prioridade - 1] += 1
                break;
              default:
                console.log(tipo, element)
                console.log("Estranho...")
            }
        });
        setState({
          labels: ["Baixa", "Padrão", "Alta", "Urgente"],
          datasets: [
            {
              label: 'Todos',
              backgroundColor: 'rgba(75,192,192,1)',
              borderColor: 'rgba(0,0,0,1)',
              borderWidth: 1,
              data: todos
            },
            {
              label: 'Infraestrutura',
              backgroundColor: 'rgba(200,50,80,1)',
              borderColor: 'rgba(0,0,0,1)',
              borderWidth: 1,
              data: infra
            },
            {
              label: 'Sistemas',
              backgroundColor: 'rgba(50,100,192,1)',
              borderColor: 'rgba(0,0,0,1)',
              borderWidth: 1,
              data: sist
            },
            {
              label: 'Desenvolvimento',
              backgroundColor: 'rgba(120,120,230,1)',
              borderColor: 'rgba(0,0,0,1)',
              borderWidth: 1,
              data: dev
            },
          ], 
        })
    }, [])

    return (
        <Bar
          data={state}
          options={{
            elements: {
              pointStyle: 'circle'
            },
            title:{
              display:true,
              text:'Average Rainfall per month',
              fontSize:20
            },
            legend:{
              display:true,
              position:'right',
            },
            plugins:{
              legend:{
                labels: {
                  usePointStyle: true
                }
              }
            },
          }}
        />
    );
}

const DoughnutGraph = ({servicos, tipo}) => {
    const labels_departamento = ["Comercial", "Contábil", "Faturamento", "Guarita", "Gerência", "Financeiro", "CCM UBS", "CCM OB", "TI"]
    const [state, setState] = useState({datasets: []});

    useEffect(()=>{
        let departamentos = [0,0,0,0,0,0,0,0,0];
        servicos.forEach(element => {
          if (tipo === "aberto")
          departamentos[labels_departamento.indexOf(element.departamento)] += element.status === "resolvido" || element.status === "pendente" ?  1 : 0;
          else
          departamentos[labels_departamento.indexOf(element.departamento)] += element.status === tipo ? 1 : 0;
        });
        setState({
          labels: labels_departamento,
          datasets: [
            {
              label: "Departamentos",
              backgroundColor: ['#D6363B', '#17F0DF', '#5FC244', '#5CB6C2', '#D9AF30', '#48965C', '#E6BD7E', '#93E6A8', '#E6C087'],
              borderColor: 'rgba(0,0,0,1)',
              borderWidth: 1,
              data: departamentos
            },
          ], 
        })
    }, [])

    return (
      <>
      {console.log("Forced")}
        <Doughnut
          style={{position: 'relative', height: '10em', width: '10em', padding: "3em"}}
          responsive="false"
          options={{
            cutout: "80%",
            maintainAspectRatio: true,
            resizeDelay: 1000,
            title:{
              display:true,
              text:'Average Rainfall per month',
              fontSize:20
            },
            legend:{
              display:true,
              position:'right'
            },
            plugins:{
              legend:{
                labels: false
              }
            }
          }}
          data={state}
        />
      </>
    );
}

const Indicador = ({servicos, tipo}) => {
  const [, forceUpdate] = useState({})

  const update = ()=> {console.log("forcing update");forceUpdate({})}

  useEffect(()=>{
    let interval = setInterval(update, 500)
    return ()=>{
      clearInterval(interval)
    }
  },[])
  return (
    <>
      <BarGraph servicos={servicos} tipo={tipo} />
      <DoughnutGraph servicos={servicos} tipo={tipo} />
    </>
  )
}

const PrioridadeTodos = ({servicos}) => {
  var [dados_prioridade_aberto, dados_prioridade_pendente, dados_prioridade_resolvido, dados_prioridade_fechado] = [[],[],[], []]

  const [state, setState] = useState({datasets: []});
    const [, forceUpdate] = useState({})

    const update = ()=> {console.log("forcing update");forceUpdate({})}

    useEffect(()=>{
      let interval = setInterval(update, 500)
      return ()=>{
        clearInterval(interval)
      }
    },[])

  useEffect(()=>{
    let tipo = "aberto"
    let prioridades = [0,0,0,0,0]
    servicos.forEach(element => {
        prioridades[element.prioridade - 1] += element.status === "resolvido" || element.status === "pendente" ?  1 : 0;
    });
    dados_prioridade_aberto = prioridades
    tipo = "pendente"
    prioridades = [0,0,0,0,0]
    servicos.forEach(element => {
        prioridades[element.prioridade - 1] += element.status === tipo ? 1 : 0;
    });
    dados_prioridade_pendente = prioridades
    tipo = "resolvido"
    prioridades = [0,0,0,0,0]
    servicos.forEach(element => {
        prioridades[element.prioridade - 1] += element.status === tipo ? 1 : 0;
    });
    dados_prioridade_resolvido = prioridades
    tipo = "fechado"
    prioridades = [0,0,0,0,0]
    servicos.forEach(element => {
        prioridades[element.prioridade - 1] += 
          element.status === tipo && 
          (new Date(element.updatedAt)).toISOString().split('T')[0] === (new Date().toISOString()).split('T')[0] 
          ? 1 : 0;
    });
    dados_prioridade_fechado = prioridades
    
    setState( {
      labels: ["Baixa", "Padrão", "Alta", "Urgente"],
      datasets: [
        {
          label: 'Abertos',
          backgroundColor: '#E6E586',
          borderColor: 'rgba(0,0,0,1)',
          borderWidth: 1,
          fill: true,
          data: dados_prioridade_aberto
        },
        {
          label: 'Pendentes',
          backgroundColor: '#E67F57',
          borderColor: 'rgba(0,0,0,1)',
          borderWidth: 1,
          fill: true,
          data: dados_prioridade_pendente
        },
        {
          label: 'Resolvidos',
          backgroundColor: '#89E6B3',
          borderColor: 'rgba(0,0,0,1)',
          borderWidth: 1,
          fill: true,
          data: dados_prioridade_resolvido
        },
        {
          label: 'Fechados Hoje',
          backgroundColor: '#893322',
          borderColor: 'rgba(0,0,0,1)',
          borderWidth: 1,
          fill: true,
          data: dados_prioridade_fechado
        },
      ], 
    })
  },[])

  return (
    <Grid container>
      <Grid item xs={12} md={7}>
      <Bar
        data={state}
        options={{
          title:{
            display:true,
            text:'Average Rainfall per month',
            fontSize:20
          },
          legend:{
            display:true,
            position:'right',
          },
          plugins:{
            legend:{
              labels: {
                usePointStyle: true
              }
            }
          },
        }}
      />
      </Grid>
      <Grid item xs={12} md={5}>
      <Radar
        data={state}
        options={{
          title:{
            display:true,
            text:'Average Rainfall per month',
            fontSize:20
          },
          legend:{
            display:true,
            position:'right',
          },
          plugins:{
            legend:{
              labels: {
                usePointStyle: true
              }
            }
          },
          datasets: {
            fill: true
          },
          scales: {
            r: {
              min: 0
            }
          }
        }}
      />
      </Grid>
    </Grid>
  );
}

export { PrioridadeTodos };

export default Indicador;