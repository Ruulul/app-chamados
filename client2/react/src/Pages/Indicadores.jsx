import React, {useState, useEffect, useMemo} from "react";
import axios from "axios";
import {Card, Typography, Grid, Table, TableHead,TableRow, TableBody, TableCell, Skeleton, Stack, Divider} from "@mui/material";

import IndicadorGrafico from "../Components/IndicadoresGraficos";
import { Donut, Bar, BarLabelled, RadialBar } from "../Components/IndGraficosMui";
import { PrioridadeTodos } from "../Components/IndicadoresGraficos";

import { useNavigate } from "react-router-dom";


const Indicadores = (props) => {
    const redirect = useNavigate()
    const [servicos_abertos, setServicosAbertos] = useState([])
    const [tabelaAbertos, setTabelaAbertos] = useState(undefined)
    const [servicos_pendentes, setServicosPendentes] = useState([])
    const [tabelaPendentes, setTabelaPendentes] = useState(undefined)
    const [servicos_resolvidos, setServicosResolvidos] = useState([])
    const [tabelaResolvidos, setTabelaResolvidos] = useState(undefined)
    const [tabelaTodos, setTabelaTodos] = useState(undefined)

    async function setarServicosAbertos() {
        let servicos = await Servicos("abertos");
        if (servicos === "Não autorizado") redirect("/login")
        setServicosAbertos(servicos)

        setTabelaAbertos(
            <Stack direction="column" justifyContent="space-between">
                <Typography variant="h5">Serviços Abertos</Typography>
                {servicos ? <IndicadorGrafico maxWidth="33%" servicos={servicos} tipo="aberto" /> : <Skeleton width="100%" height="33%"/>}
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography width="fit-content" variant="h6">ID</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography width="fit-content" variant="h6">Prio.</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography width="fit-content" variant="h6">Dept.</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography width="fit-content" variant="h6">Status</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography width="fit-content" variant="h6">Assunto</Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {servicos_abertos ? servicos_abertos.map(
                        (servico)=>{
                            if (servico.status === "pendente" || servico.status === "resolvido")
                        return (<TableRow key={servico.id}>
                                    <TableCell>
                                        <Typography width="fit-content">{servico.id}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography width="fit-content">{(["Baixa", "Média", "Alta", "Urgente"])[servico.prioridade - 1]}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography width="fit-content">{servico.departamento}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography width="fit-content">{servico.status}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography width="fit-content" variant="caption text">{servico.assunto}</Typography>
                                    </TableCell>
                                </TableRow>);
                    }) : undefined}
                    </TableBody>
                </Table>
            </Stack>)
        
    }
    async function setarServicosPendentes() {
        let servicos = await Servicos("pendentes");
        if (servicos === "Não autorizado") redirect("/login")
    setServicosPendentes(servicos);

    setTabelaPendentes(
        <Stack direction="column" justifyContent="space-between">
            <Typography variant="h5">Serviços Pendentes</Typography>
            {servicos ? <IndicadorGrafico servicos={servicos} tipo="pendente" /> : <Skeleton width="100%" height="33%"/>}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Typography width="fit-content" variant="h6">ID</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography width="fit-content" variant="h6">Prio.</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography width="fit-content" variant="h6">Dept.</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography width="fit-content" variant="h6">Status</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography width="fit-content" variant="h6">Assunto</Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {servicos_pendentes ? servicos_pendentes.map(
                        (servico)=>{
                        if (servico.status === "pendente")
                        return (<TableRow key={servico.id}>
                                    <TableCell>
                                        <Typography width="fit-content">{servico.id}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography width="fit-content">{(["Baixa", "Média", "Alta", "Urgente"])[servico.prioridade - 1]}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography width="fit-content">{servico.departamento}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography width="fit-content">{servico.status}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography width="fit-content" variant="caption text">{servico.assunto}</Typography>
                                    </TableCell>
                                </TableRow>);
                    }) : undefined}
                </TableBody>
            </Table>
        </Stack>);
    
    }
    async function setarServicosResolvidos() {
        let servicos = await Servicos("abertos");
        if (servicos === "Não autorizado") redirect("/login")
    setServicosResolvidos(servicos)

    setTabelaResolvidos(
        <Stack direction="column" justifyContent="space-between">
            <Typography variant="h5">Serviços Resolvidos</Typography>
            {servicos ? <IndicadorGrafico servicos={servicos} tipo="resolvido" /> : <Skeleton width="100%"/>}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Typography width="fit-content" variant="h6">ID</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography width="fit-content" variant="h6">Prio.</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography width="fit-content" variant="h6">Dept.</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography width="fit-content" variant="h6">Status</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography width="fit-content" variant="h6">Assunto</Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {servicos_resolvidos ? servicos_resolvidos.map(
                        (servico)=>{
                        if (servico.status === "resolvido")
                        return (<TableRow key={servico.id}>
                                    <TableCell>
                                        <Typography width="fit-content">{servico.id}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography width="fit-content">{(["Baixa", "Média", "Alta", "Urgente"])[servico.prioridade - 1]}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography width="fit-content">{servico.departamento}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography width="fit-content">{servico.status}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography width="fit-content" variant="caption text">{servico.assunto}</Typography>
                                    </TableCell>
                                </TableRow>);
                    }) : undefined}
                </TableBody>
            </Table>
        </Stack>)
    
    }
    async function setarServicosTodos() {
        let servicos = await Servicos("");
        if (servicos === "Não autorizado") redirect("/login")
        setTabelaTodos(<PrioridadeTodos servicos={servicos}/>)
    }

    useEffect(()=>{
        const setAll = () => {
            setarServicosAbertos()
            setarServicosPendentes()
            setarServicosResolvidos()
            setarServicosTodos()
        }
        let interval = setInterval(setAll, 500)
        return ()=>{
            clearInterval(interval)
        }
    },[servicos_abertos,servicos_pendentes,servicos_resolvidos, tabelaTodos])

    return (    
    <Card elevation={3} xs={{padding: 0}} md={{ padding: 5}} marginTop={3}>
        <Typography variant="h2" sx={{placeSelf: 'center', alignSelf: 'center', justifySelf: 'center'}}>Indicadores (%)</Typography>
        {tabelaTodos ? tabelaTodos : <Skeleton variant="rectangular" width="100%" height="100%" />}
        <Grid container direction={{ xs: "column", md: "row" }} spacing={2}>
            <Grid item xs={12} md={3}>
                <Card elevation={5} sx={{padding: 3}}>
                    {tabelaAbertos ? tabelaAbertos : <Skeleton variant="text" width="100%" height="33%" animation="wave" />}
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card elevation={5} sx={{padding: 3}}>
                    {tabelaPendentes ? tabelaPendentes : <Skeleton variant="text" width="100%" height="33%" animation="wave" />}
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card elevation={5} sx={{padding: 3}}>
                    {tabelaResolvidos ? tabelaResolvidos : <Skeleton variant="text" width="100%" height="33%" animation="wave" />}
                </Card>
            </Grid>
        </Grid>
    </Card>
    );
};

async function Servicos(filtro) {
    let Tabela = "Não autorizado";
    await axios.get('http://10.0.0.83:5000/api/servicos', { withCredentials: true })
        .then( ({data})=>{
            if (data === "Não autorizado") return "Não autorizado"
            switch(filtro) {
                case "abertos":
                    let servicos_abertos = []
                    data.forEach((servico)=>{
                        if (servico.status === "pendente" || servico.status === "resolvido")
                            servicos_abertos = [
                                ...servicos_abertos, 
                                servico]
                    })
                
                    Tabela = servicos_abertos;
                    break;
                case "pendentes":
                    let servicos_pendentes = []
                    data.forEach((servico)=>{
                        if (servico.status === "pendente")
                            servicos_pendentes = [
                                ...servicos_pendentes, 
                                servico]
                    })
                
                    Tabela = servicos_pendentes;
                    break;
                case "resolvidos":
                    let servicos_resolvidos = []
                    data.forEach((servico)=>{
                        if (servico.status === "resolvido")
                            servicos_resolvidos = [
                                ...servicos_resolvidos, 
                                servico]
                    })
                
                    Tabela = servicos_resolvidos;
                default:
                    Tabela = data;
            }
        })
        .catch((err)=>{Tabela = <Typography>Ocorreu um erro ao carregar a tabela de {filtro}</Typography>});
    return Tabela;
}

const IndicadoresMui = (props) => {
    const redirect = useNavigate()
    const [servicos_abertos, setServicosAbertos] = useState([])
    const [servicos_pendentes, setServicosPendentes] = useState([])
    const [servicos_resolvidos, setServicosResolvidos] = useState([])
    const [servicosTodos, setTodos] = useState([])
    const [tiposA, setTiposA] = useState([])
    const [tiposP, setTiposP] = useState([])
    const [tiposR, setTiposR] = useState([])
    const [departamentosA, setDepartamentosA] = useState([]);
    const [departamentosP, setDepartamentosP] = useState([]);
    const [departamentosR, setDepartamentosR] = useState([]);

    const values_abertos_tipo = 
        tiposA.map(tipo=>({
            label: tipo,
            value: Math.floor(100 * servicos_abertos.filter((s)=>s.tipo===tipo).length / servicos_abertos.length)
        }))
    const values_pendentes_tipo = 
    tiposP.map(tipo=>({
        label: tipo,
        value: Math.floor(100 * servicos_pendentes.filter((s)=>s.tipo===tipo).length / servicos_pendentes.length)
    }))
    const values_resolvidos_tipo = 
    tiposR.map(tipo=>({
        label: tipo,
        value: Math.floor(100 * servicos_resolvidos.filter((s)=>s.tipo===tipo).length / servicos_resolvidos.length)
    }))
    const values_abertos_departamento = 
        departamentosA.map(dep=>({
            label: dep,
            value: Math.floor(100 * servicos_abertos.filter((s)=>s.departamento===dep).length / servicos_abertos.length)
        }))
    const values_pendentes_departamento = 
    departamentosP.map(dep=>({
        label: dep,
        value: Math.floor(100 * servicos_pendentes.filter((s)=>s.departamento===dep).length / servicos_pendentes.length)
    }))
    const values_resolvidos_departamento = 
    departamentosR.map(dep=>({
        label: dep,
        value: Math.floor(100 * servicos_resolvidos.filter((s)=>s.departamento===dep).length / servicos_resolvidos.length)
    }))

    function setarServicosAbertos(servicos) {
        if (servicos === "Não autorizado") redirect("/login")
        let servicosa = servicos.filter((s)=>s.status==="pendente" || s.status==="resolvido")
        setTiposA([...new Set(servicosa.map(s=>s.tipo))]);
        setDepartamentosA([...new Set(servicosa.map(s=>s.departamento))]);
        setServicosAbertos(servicosa)
    }
    function setarServicosPendentes(servicos) {
        if (servicos === "Não autorizado") redirect("/login")
    let servicosp = servicos.filter((s)=>s.status==="pendente")
    setServicosPendentes(servicosp);
    setTiposP([...new Set(servicosp.map(s=>s.tipo))]);
    setDepartamentosP([...new Set(servicosp.map(s=>s.departamento))]);
    
    }
    function setarServicosResolvidos(servicos) {
        if (servicos === "Não autorizado") redirect("/login")
    let servicosr = servicos.filter(s=>s.status==="resolvido")
    setServicosResolvidos(servicosr)
    setTiposR([...new Set(servicosr.map(s=>s.tipo))]);
    setDepartamentosR([...new Set(servicosr.map(s=>s.departamento))]);
    
    }
    async function setarServicosTodos() {
        let servicos = await Servicos("");
        if (servicos === "Não autorizado") redirect("/login")
        setTodos(servicos)
        return servicos
    }

    useEffect(()=>{
        const setAll = () => {
            setarServicosTodos().then((s)=>{
                setarServicosAbertos(s)
                setarServicosPendentes(s)
                setarServicosResolvidos(s)
            })
        }
        let interval = setInterval(setAll, 500)
        return ()=>{
            clearInterval(interval)
        }
    },[])

    return (
        <Grid container spacing={2}>
            <Grid item container xs={12} spacing={5} mt={5}>
                <Grid item xs={12}>
                    <Divider />
                    <Typography variant="h4">
                    Status
                    </Typography>
                </Grid>
                <Grid item container xs={12}>
                <Grid item xs={4}>
                <Card elevation={5} sx={{width: "fit-content", padding: 3}}>
                    <Typography variant="h4" mb={2}>
                    {servicos_abertos.length} serviços abertos
                    </Typography>
                    <Typography variant="h5">
                        Categoria
                    </Typography>
                    <RadialBar label="teste" size={100} 
                        values={values_abertos_tipo}
                    />
                    
                    {
                        values_abertos_tipo.map((a, i)=><Typography key={i} variant="subtitle1">{`${a.label}: ${a.value}%`}</Typography>)
                    }
                    <Typography variant="h5">
                        Departamento
                    </Typography>
                    <RadialBar label="teste" size={75} 
                        values={values_abertos_departamento}
                    />
                    
                    {
                        values_abertos_departamento.map((a, i)=><Typography key={i} variant="subtitle1">{`${a.label}: ${a.value}%`}</Typography>)
                    }
                </Card>
                </Grid>
                <Grid item xs={4}>
                <Card elevation={5} sx={{width: "fit-content", padding: 3}}>
                    <Typography variant="h4" mb={2}>
                    {servicos_pendentes.length} serviços pendentes
                    </Typography>
                    <Typography variant="h5">
                        Categoria
                    </Typography>
                    <RadialBar label="teste" size={100} 
                        values={values_pendentes_tipo}
                    />
                    
                    {
                        values_pendentes_tipo.map((a, i)=><Typography key={i} variant="subtitle1">{`${a.label}: ${a.value}%`}</Typography>)
                    }
                    <Typography variant="h5">
                        Departamento
                    </Typography>
                    <RadialBar label="teste" size={75} 
                        values={values_pendentes_departamento}
                    />
                    
                    {
                        values_pendentes_departamento.map((a, i)=><Typography key={i} variant="subtitle1">{`${a.label}: ${a.value}%`}</Typography>)
                    }
                </Card>
                </Grid>
                <Grid item xs={4}>
                <Card elevation={5} sx={{width: "fit-content", padding: 3}}>
                    <Typography variant="h4" mb={2}>
                    {servicos_resolvidos.length} serviços resolvidos
                    </Typography>
                    <Typography variant="h5">
                        Categoria
                    </Typography>
                    <RadialBar label="teste" size={100} 
                        values={values_resolvidos_tipo}
                    />
                    
                    {
                        values_resolvidos_tipo.map((a, i)=><Typography key={i} variant="subtitle1">{`${a.label}: ${a.value}%`}</Typography>)
                    }
                    <Typography variant="h5">
                        Departamento
                    </Typography>
                    <RadialBar label="teste" size={75} 
                        values={values_resolvidos_departamento}
                    />
                    
                    {
                        values_resolvidos_departamento.map((a, i)=><Typography key={i} variant="subtitle1">{`${a.label}: ${a.value}%`}</Typography>)
                    }
                </Card>
                </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Divider />
                <Typography variant="h4" padding={3}>
                    Urgência
                </Typography>
                <Card elevation={5}>
                    <Grid container spacing={2} padding={2}>
                    {(["Baixa", "Média", "Alta", "Urgente"])
                    .map((prioridade, i)=>{
                    let valor = Math.floor(100 * servicosTodos.filter(s=>s.prioridade==i).length / servicosTodos.length)
                    return <> 
                    <Grid item xs={1.5}>
                        <Typography variant="h5">
                            {`${prioridade}: ${valor}%`}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                    <Bar 
                    size={100}
                    value={valor} 
                    label={prioridade}
                    />
                    </Grid>
                    </>
                    })}
                    </Grid>
                </Card>
            </Grid>
        </Grid>
    )
}

export default IndicadoresMui;