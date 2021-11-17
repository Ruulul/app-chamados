import React, {useState, useEffect} from "react";
import axios from "axios";
import {Card, Typography, Grid, Table, TableHead,TableRow, TableBody, TableCell, Skeleton, Stack} from "@mui/material";

import IndicadorGrafico from "../components/IndicadoresGraficos";
import { PrioridadeTodos } from "../components/IndicadoresGraficos";

const Indicadores = (props) => {
    const [servicos_abertos, setServicosAbertos] = useState([])
    const [tabelaAbertos, setTabelaAbertos] = useState(undefined)
    const [servicos_pendentes, setServicosPendentes] = useState([])
    const [tabelaPendentes, setTabelaPendentes] = useState(undefined)
    const [servicos_resolvidos, setServicosResolvidos] = useState([])
    const [tabelaResolvidos, setTabelaResolvidos] = useState(undefined)
    const [tabelaTodos, setTabelaTodos] = useState(undefined)

    async function setarServicosAbertos() {
        let servicos = await Servicos("abertos");
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
                                        <Typography width="fit-content">{servico.prioridade}</Typography>
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
                                        <Typography width="fit-content">{servico.prioridade}</Typography>
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
                                        <Typography width="fit-content">{servico.prioridade}</Typography>
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
        setTabelaTodos(<PrioridadeTodos servicos={servicos}/>)
    }

    useEffect(setarServicosAbertos, [servicos_abertos])
    useEffect(setarServicosPendentes, [servicos_pendentes])
    useEffect(setarServicosResolvidos, [servicos_resolvidos])
    useEffect(setarServicosTodos, [tabelaTodos])

    return (    
    <Card elevation="3" xs={{padding: 0}} md={{ padding: 5}}>
        <Typography variant="h2" sx={{placeSelf: 'center', alignSelf: 'center', justifySelf: 'center'}}>Indicadores</Typography>
        {tabelaTodos ? tabelaTodos : <Skeleton variant="rectangular" width="100%" height="100%" />}
        <Grid container direction={{ xs: "column", md: "row" }} spacing={5}>
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
    let Tabela = undefined;
    await axios.get('http://10.0.0.83:5000/api/servicos')
        .then( (res)=>{
            switch(filtro) {
                case "abertos":
                    let servicos_abertos = []
                    res.data.forEach((servico)=>{
                        if (servico.status === "pendente" || servico.status === "resolvido")
                            servicos_abertos = [
                                ...servicos_abertos, 
                                servico]
                    })
                
                    Tabela = servicos_abertos;
                    break;
                case "pendentes":
                    let servicos_pendentes = []
                    res.data.forEach((servico)=>{
                        if (servico.status === "pendente")
                            servicos_pendentes = [
                                ...servicos_pendentes, 
                                servico]
                    })
                
                    Tabela = servicos_pendentes;
                    break;
                case "resolvidos":
                    let servicos_resolvidos = []
                    res.data.forEach((servico)=>{
                        if (servico.status === "resolvido")
                            servicos_resolvidos = [
                                ...servicos_resolvidos, 
                                servico]
                    })
                
                    Tabela = servicos_resolvidos;
                default:
                    Tabela = res.data;
            }
        })
        .catch((err)=>{Tabela = <Typography>Ocorreu um erro ao carregar a tabela de {filtro}</Typography>});
    return Tabela;
}

export default Indicadores;