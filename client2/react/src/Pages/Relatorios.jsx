import {
    Button,
    Grid,
    Typography,
    ButtonGroup,
    ClickAwayListener,
    MenuItem,
    Menu,
    Card,
    TextField,
    TableRow,
    TableCell,
    Table,
    TableHead,
    TableBody,
    Stack
} from "@mui/material"
import axios from "axios"
import { createRef, useEffect, useLayoutEffect, useMemo, useState } from "react"

import { jsPDF } from 'jspdf';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Relatorios = (props) => {
    const [filtrosAtivos, setFiltros] = useState([])
    const [campos, setCampos] = useState([])
    const [atendentes, setAtendentes] = useState([])
    const [popOpen, setPopOpen] = useState(false)
    const [anchorEl, setAnchor] = useState(null)
    const [relatorio, setRelatorio] = useState(undefined)
    const [, forceUpdate] = useState({})

    const pdfRef = createRef()

    function update() {
        forceUpdate({})
    }

    function geraRelatorio() {
        let serDs = [];
        let serAs = [];
        let serCs = [];
        let serUs = [];
        let serSs = [];
        let data = [];
        (async () => {
            for (let filtro of filtrosAtivos) {
                console.log(filtro)
                switch (filtro.tipo) {
                    case "Departamento":
                        data = await axios.get('http://10.0.0.83:5000/api/servicos/departamento/' + filtro.valor, { withCredentials: true })
                        let serD = data.data
                        serDs = [...serDs, ...serD]
                        break;
                    case "Atendente":
                        data = await axios.get('http://10.0.0.83:5000/api/servicos/atendenteId/' + filtro.valor, { withCredentials: true })
                        let serA = data.data
                        console.log(serA)
                        serAs = [...serAs, ...serA]
                        break;
                    case "Categoria":
                        data = await axios.get('http://10.0.0.83:5000/api/servicos/tipo/' + filtro.valor, { withCredentials: true })
                        let serC = data.data
                        serCs = [...serCs, ...serC]
                        break;
                    case "Urgência":
                        data = await axios.get('http://10.0.0.83:5000/api/servicos/prioridade/' + filtro.valor, { withCredentials: true })
                        let serU = data.data
                        serUs = [...serUs, ...serU]
                        break;
                    case "Status":
                        data = await axios.get('http://10.0.0.83:5000/api/servicos/status/' + filtro.valor, { withCredentials: true })
                        let serS = data.data
                        serSs = [...serSs, ...serS]
                        break;
                }
            }
            let relatoriodata =
                filtrosAtivos.length === 0 ?
                    ({ data } = await axios.get('http://10.0.0.83:5000/api/servicos', { withCredentials: true }),
                        data) :
                    ([serDs, serAs, serCs, serSs, serUs])
                        .reduce(
                            (p, c) =>
                                p.length === 0 ? c : c.length === 0 ? p
                                    : p.filter(e1 => c.some(e2 => e1.id === e2.id))
                        )
            console.log(relatoriodata)
            setRelatorio(relatoriodata)
        })()
    }

    useLayoutEffect(() => {
        console.log("a")
        axios.get('http://10.0.0.83:5000/api/servicos', { withCredentials: true })
            .then(({ data }) => {
                let Departamento = data.map(s => s.departamento)
                Departamento = [...new Set(Departamento)]
                let Categoria = data.map(s => s.tipo)
                Categoria = [...new Set(Categoria)]
                let Urgência = data.map(s => s.prioridade)
                Urgência = [...new Set(Urgência)]
                let Status = data.map(s => s.status)
                Status = [...new Set(Status)]
                setCampos({ Departamento, Categoria, Urgência, Status })
            })
            .catch(err => console.log('Erro: ' + err))
    }, [])

    useEffect(()=>{
        axios.get('http://10.0.0.83:5000/api/usuarios', { withCredentials: true })
            .then(({ data }) => {
                let Usuario = data.map(s => s.nome)
                let Atendentes = [...new Set(Usuario)]

                setAtendentes(Atendentes.map(a => ({ nome: a, id: data[Usuario.indexOf(a)].id })))
            })
            .catch(err => console.log('Error: ' + err))}, [])
    
    return (
        <Grid container >
            <Grid item>
                <ButtonGroup
                    disableElevation
                    orientation="vertical"
                    variant="contained"
                    sx={{
                        '& Button': {
                            width: 200,
                            padding: 0,
                            borderRadius: 7,
                            marginY: 0.2
                        },
                        width: 'fit-content',
                        padding: 2,
                        marginTop: 2
                    }}>
                    <ClickAwayListener onClickAway={() => setPopOpen(false)}>
                        <Button
                            onClick={(event) => {
                                setAnchor(event.currentTarget)
                                setPopOpen(pop => !pop)
                            }}
                        >
                            Adicionar filtro
                        </Button>
                    </ClickAwayListener>
                    <Menu
                        open={popOpen}
                        anchorEl={anchorEl}
                        sx={{ '& MenuItem': { width: 200, transformOrigin: 'center bottom' } }}>
                        <MenuItem onClick={() => setFiltros(filtro => [...filtro, { tipo: 'Departamento', valor: null }])}>Departamento</MenuItem>
                        <MenuItem onClick={() => setFiltros(filtro => [...filtro, { tipo: 'Atendente', valor: null }])}>Atendente</MenuItem>
                        <MenuItem onClick={() => setFiltros(filtro => [...filtro, { tipo: 'Categoria', valor: null }])}>Categoria</MenuItem>
                        <MenuItem onClick={() => setFiltros(filtro => [...filtro, { tipo: 'Urgência', valor: null }])}>Urgência</MenuItem>
                        <MenuItem onClick={() => setFiltros(filtro => [...filtro, { tipo: 'Status', valor: null }])}>Status</MenuItem>
                    </Menu>
                    <Button
                        onClick={() => setFiltros([])}>
                        Limpa filtros
                    </Button>
                    <Button
                        onClick={() => geraRelatorio()}>
                        Gerar Relatório
                    </Button>
                </ButtonGroup>
            </Grid>
            <Grid item container padding={3} spacing={3} direction="row">
                {filtrosAtivos
                    .map(
                        (filtro, i) =>
                            <Grid item xs={3.5} margin={1} component={Card} key={i} sx={{ p: 1.5, mb: 1 }}>
                                <Typography>
                                    {filtro.tipo}
                                </Typography>
                                <TextField
                                    size="small"
                                    label={filtro.label}
                                    open={filtro.label ? false : true}
                                    variant="filled"
                                    select
                                    fullWidth={true}
                                >
                                    {
                                        filtro.tipo === "Atendente"
                                            ? atendentes.map(a => 
                                            <MenuItem onClickCapture={() => 
                                                { let filtrosa = filtrosAtivos; filtrosa[i].valor = a.id; filtrosa[i].label = a.nome; setFiltros(filtrosa); update() }}>
                                                {a.nome}</MenuItem>)
                                            : 
                                        campos[filtro.tipo].map(a => <MenuItem onClick={() => { let filtrosa = filtrosAtivos; filtrosa[i] = { tipo: filtrosa[i].tipo, valor: a, label: a }; setFiltros(filtrosa); update() }}>{typeof (a) === "string" ? a : a.value}</MenuItem>)
                                    }
                                </TextField>
                            </Grid>
                    )}
            </Grid>
            <Grid container item xs={12}>
                <Grid item xs={12}>
                </Grid>
                <Grid item xs={24}>
                    <Button
                        variant="contained"
                        align="center"
                        onClick={
                            () => {
                                const doc = new jsPDF({
                                    orientation: 'p',
                                    format: 'a4'
                                })
                                doc.setDisplayMode(1, 'continuous')
                                let u = 10
                                let campo_l = 20
                                doc.setFontSize(22)
                                doc.text("Relatório de Chamados", 10, 10)
                                doc.setFontSize(12)
                                doc.text(`Com filtros de: `, 10, 20)
                                doc.text(
                                    filtrosAtivos.map(
                                        (filtro) => 
                                        filtro.tipo === "Atendente" ? 
                                        `Atendente: ${atendentes.find(e => e.id == filtro.valor).nome}` : 
                                        `${filtro.tipo}: ${filtro.valor}`
                                    ).join('\n')
                                ,20, 25)
                                ;(["Assunto", "Atendente", "Urgência", "Status", "Categoria", "Departamento", "ID"])
                                    .forEach(
                                        (campo, index)=>{
                                            doc.text(campo, index ? index * (campo_l + u) : u, 30 + filtrosAtivos.length * 5)
                                        }
                                    )
                                doc.setLineWidth(0.3)
                                doc.line(10,15,200,15)
                                doc.line(10, 25 + filtrosAtivos.length * 5, 200, 25 + filtrosAtivos.length * 5)
                                doc.setLineWidth(0.15)
                                relatorio.forEach(
                                    (servico, index) => {
                                        let yo = 35 + index*5 + filtrosAtivos.length * 5
                                        console.log(servico)
                                        doc.setFontSize(8)
                                        doc.text(
                                            servico.assunto.length >= campo_l - u ? 
                                            [servico.assunto.slice(0, campo_l/3), '...', servico.assunto.slice(servico.assunto.length - campo_l/4 + 2)]
                                            .join('') : 
                                            servico.assunto, u, yo)
                                        doc.text(
                                            atendentes.find(e => e.id == servico.atendenteId) ? 
                                            atendentes.find(e => e.id == servico.atendenteId).nome : 
                                            "Não encontrado", campo_l + u, yo)
                                        doc.text((["Baixa", "Média", "Alta", "Urgente"])[parseInt(servico.prioridade) - 1], 2 * (campo_l + u), yo)
                                        doc.text(servico.status, 3 * (campo_l + u), yo)
                                        doc.text(servico.tipo, 4 * (campo_l + u), yo)
                                        doc.text(servico.departamento, 5 * (campo_l + u), yo)
                                        doc.text(String(servico.id), 6 * (campo_l + u), yo)
                                        doc.line(10, yo + 1, 200, yo + 1)
                                    }
                                )
                                let y_linha = 35 + relatorio.length * 5 + filtrosAtivos.length * 5 - 5
                                doc.text(`Total: ${relatorio.length}`, 10, y_linha + 5)
                                doc.save('Relatorio.pdf')
                                console.log("Saved!")
                            }
                        }>
                        Baixar
                    </Button>
                    <Typography align="left" margin={2} ref={pdfRef}>
                        <Stack component={Card} padding={4} spacing={3}>
                            <Typography component="h1" variant="h3">
                                Relatório de Chamados
                            </Typography>
                            <Typography variant="h4">
                                Com os filtros de:
                            </Typography>
                            {filtrosAtivos.map((filtro, i) => <Typography variant="h5">{filtro.valor ? filtro.tipo === "Atendente" ? `Atendente: ${atendentes.find(e => e.id == filtro.valor).nome}` : `${filtro.tipo}: ${filtro.valor}` : "Filtro"}</Typography>)}
                            <Typography>
                                Total: {relatorio ? relatorio.length : 0}
                            </Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={2}>
                                            Assunto
                                        </TableCell>
                                        <TableCell>
                                            Atendente
                                        </TableCell>
                                        <TableCell>
                                            Urgência
                                        </TableCell>
                                        <TableCell>
                                            Status
                                        </TableCell>
                                        <TableCell>
                                            Categoria
                                        </TableCell>
                                        <TableCell>
                                            Departamento
                                        </TableCell>
                                        <TableCell>
                                            ID
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {relatorio ? relatorio
                                        .map((r, i) =>
                                            <TableRow key={i}>
                                                <TableCell>
                                                        <Button
                                                          variant="contained"
                                                          component={Link}
                                                          to={`/chamado/${r.id}`}
                                                        >
                                                          {" "}
                                                          <FontAwesomeIcon icon={faEnvelopeOpen} />
                                                        </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {r.assunto}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {atendentes.find(e => e.id == r.atendenteId) ? atendentes.find(e => e.id == r.atendenteId).nome : "Não encontrado"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {(["Baixa", "Média", "Alta", "Urgente"])[parseInt(r.prioridade) - 1]}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {r.status}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {r.tipo}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {r.departamento}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {r.id}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>)
                                    : undefined}
                                </TableBody>
                            </Table>
                        </Stack>
                    </Typography>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default Relatorios