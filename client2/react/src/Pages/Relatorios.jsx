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
    Stack,
    Box
} from "@mui/material"
import axios from "../Components/Requisicao"
import { createRef, useEffect, useLayoutEffect, useMemo, useState } from 'react'//"preact/compat"

import { jsPDF } from 'jspdf';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Relatorios = (props) => {
    const [filtrosAtivos, setFiltros] = useState([])
    const [campos, setCampos] = useState([])
    const [atendentes, setAtendentes] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [popOpen, setPopOpen] = useState(false)
    const [anchorEl, setAnchor] = useState(null)
    const [relatorio, setRelatorio] = useState(undefined)
    const [, forceUpdate] = useState({})

    const pdfRef = createRef()

    function update() {
        forceUpdate({})
    }

    function geraRelatorio() {
        let ser = []
        let serDepars = [];
        let serAtends = [];
        let serUsuars = []
        let serCategs = [];
        let serUrgens = [];
        let serStatus = [];
        let data = [];
        (async () => {
            for (let filtro of filtrosAtivos) {

                switch (filtro.tipo) {
                    case "Departamento":
                        data = await axios("get",'/servicos/departamento/' + filtro.valor)
                        ser = data.data
                        serDepars = [...serDepars, ...ser]
                        break;
                    case "Atendente":
                        data = await axios("get",'/servicos/atendenteId/' + filtro.valor)
                        ser = data.data
                        serAtends = [...serAtends, ...ser]
                        break;
                    case "Usuário":
                        data = await axios("get",'/servicos/usuarioId/' + filtro.valor)
                        ser = data.data
                        serUsuars = [...serUsuars, ...ser]
                        break;
                    case "Categoria":
                        data = await axios("get",'/servicos/tipo/' + filtro.valor)
                        ser = data.data
                        serCategs = [...serCategs, ...ser]
                        break;
                    case "Urgência":
                        data = await axios("get",'/servicos/prioridade/' + filtro.valor)
                        ser = data.data
                        serUrgens = [...serUrgens, ...ser]
                        break;
                    case "Status":
                        data = await axios("get",'/servicos/status/' + filtro.valor)
                        ser = data.data
                        serStatus = [...serStatus, ...ser]
                        break;
                }
            }
            let relatoriodata =
                filtrosAtivos.filter(a=>!a.tipo.includes('Data')).length === 0 ?
                    ({ data } = await axios("get",'/servicos'),
                        data) :
                    ([serDepars, serAtends, serUsuars, serCategs, serStatus, serUrgens])
                        .reduce(
                            (p, c) =>
                                p.length === 0 ? c : c.length === 0 ? p
                                    : p.filter(e1 => c.some(e2 => e1.id === e2.id))
                        )
            if (filtrosAtivos.some(a=>a.tipo==="DataInicio"))
                relatoriodata = relatoriodata.filter(servico=>servico.createdAt.split('T')[0] >= filtrosAtivos.find(a=>a.tipo==="DataInicio").valor)
            if (filtrosAtivos.some(a=>a.tipo==="DataFim"))
                relatoriodata = relatoriodata.filter(servico=>servico.createdAt.split('T')[0] <= filtrosAtivos.find(a=>a.tipo==="DataFim").valor)
                if (filtrosAtivos.some(a=>a.tipo==="DataInicio: Prazo"))
                    relatoriodata = relatoriodata.filter(servico=>servico.prazo.split('T')[0] >= filtrosAtivos.find(a=>a.tipo==="DataInicio: Prazo").valor)
                if (filtrosAtivos.some(a=>a.tipo==="DataFim: Prazo"))
                    relatoriodata = relatoriodata.filter(servico=>servico.prazo.split('T')[0] <= filtrosAtivos.find(a=>a.tipo==="DataFim: Prazo").valor)
            setRelatorio(relatoriodata)
        })()
    }

    useLayoutEffect(() => {
        console.log("a")
        axios("get",'/servicos')
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
        axios("get",'/usuarios/tipo/suporte')
            .then(({ data }) => {
                let atendentes = data.map(s => ({id: s.id, nome: s.nome}))

                setAtendentes(atendentes)
            })
            .catch(err => console.log('Error: ' + err))}, [])

    useEffect(()=>{
        axios("get",'/usuarios/all')
            .then(({ data }) => {
                let usuarios = data.map(usr => ({id: usr.id, nome: usr.nome}))

                setUsuarios(usuarios)
            })
            .catch(err => console.log('Error: ' + err))}, [])
    return (
        <Grid container >
            <Grid key={1} item container>
			    <Grid key={1} item>
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
                        <ClickAwayListener key={1} onClickAway={() => setPopOpen(false)}>
                        <Button
                            onClick={(event) => {
                                setAnchor(event.currentTarget)
                                setPopOpen(pop => !pop)
                            }}
                        >
                            Adicionar filtro
                        </Button>
                        </ClickAwayListener>
                        <Button key={2}
                        onClick={() => geraRelatorio()}>
                        Gerar Relatório
                        </Button>
                        <Menu key={3}
                        open={popOpen}
                        anchorEl={anchorEl}
                        sx={{ '& MenuItem': { width: 200, transformOrigin: 'center bottom' } }}>
                        <MenuItem key={1} onClick={() => setFiltros(filtro => [...filtro, { tipo: 'Departamento', valor: null }])}>Departamento</MenuItem>
                        <MenuItem key={2} onClick={() => setFiltros(filtro => [...filtro, { tipo: 'Atendente', valor: null }])}>Atendente</MenuItem>
                        <MenuItem key={2} onClick={() => setFiltros(filtro => [...filtro, { tipo: 'Usuário', valor: null }])}>Usuário</MenuItem>
                        <MenuItem key={3} onClick={() => setFiltros(filtro => [...filtro, { tipo: 'Categoria', valor: null }])}>Categoria</MenuItem>
                        <MenuItem key={4} onClick={() => setFiltros(filtro => [...filtro, { tipo: 'Urgência', valor: null }])}>Urgência</MenuItem>
                        <MenuItem key={5} onClick={() => setFiltros(filtro => [...filtro, { tipo: 'Status', valor: null }])}>Status</MenuItem>
                        <MenuItem key={6} onClick={() => setFiltros(filtro => [...filtro, { tipo: 'DataInicio', valor: "" }])}>Data de Início</MenuItem>
                        <MenuItem key={7} onClick={() => setFiltros(filtro => [...filtro, { tipo: 'DataFim', valor: "" }])}>Data de Fim</MenuItem>
                        <MenuItem key={8} onClick={() => setFiltros(filtro => [...filtro, { tipo: 'DataInicio: Prazo', valor: "" }])}>Data de Início (Prazo)</MenuItem>
                        <MenuItem key={9} onClick={() => setFiltros(filtro => [...filtro, { tipo: 'DataFim: Prazo', valor: "" }])}>Data de Fim (Prazo)</MenuItem>
                        </Menu>
                        <Button key={4}
                        onClick={() => setFiltros([])}>
                        Limpa filtros
                        </Button>
                    </ButtonGroup>
			    </Grid>
			    <Grid key={2} item>
			        <Stack  margin={5}>
				<Typography variant="h5">
					Instruções:
				</Typography>
				<Stack margin={2}>
					<Typography>
						1. Escolha os filtros<br/>&emsp;&emsp;(Ao deixar os filtros em branco, esse relatório selecionará todos os chamados dentro do sistema)
					</Typography>
					<Typography>
						2. Clique em "Gerar Relatório"
					</Typography>
					<Typography>
						3. Clique em "Imprimir"
					</Typography>
				</Stack>
			        </Stack>
			    </Grid>
            </Grid>
            <Grid key={2} item container padding={3} spacing={3} direction="row">
                {filtrosAtivos
                    .map(
                        (filtro, i) =>
                            <Grid key={i} item xs={3.5} margin={1} component={Card} sx={{ p: 1.5, mb: 1 }}>
                                {
                                    filtro.tipo.includes("Data") ?
                                    <>
                                    <Typography key={1}>
                                        {`Data de ${filtro.tipo.slice(4)}`}
                                    </Typography>
                                    <TextField key={2} type="date" value={filtro.valor} onChange={(e)=>{let filtrosa = filtrosAtivos; filtrosa[i].valor = e.target.value; filtrosa[i].label = `Data de ${filtro.tipo.slice(4)}`; setFiltros(filtrosa); update()}}/>
                                    </>
                                    :
                                <>
                                <Typography key={1}>
                                    {filtro.tipo}
                                </Typography>
                                <TextField
                                    key={2}
                                    size="small"
                                    label={filtro.label}
                                    open={filtro.label ? false : true}
                                    variant="filled"
                                    select
                                    fullWidth={true}
                                >
                                    {
                                        filtro.tipo === "Atendente"
                                            ? atendentes.map((a, key) => 
                                            <MenuItem key={key} onClickCapture={() => 
                                                { let filtrosa = filtrosAtivos; filtrosa[i].valor = a.id; filtrosa[i].label = a.nome; setFiltros(filtrosa); update() }}>
                                                {a.nome}</MenuItem>)
                                            : filtro.tipo === "Usuário"
                                                ? usuarios.map(a=>
                                                    <MenuItem onClickCapture={() => 
                                                        { let filtrosa = filtrosAtivos; filtrosa[i].valor = a.id; filtrosa[i].label = a.nome; setFiltros(filtrosa); update() }}>
                                                        {a.nome}</MenuItem>)
                                                : campos[filtro.tipo].map((a, key) => <MenuItem key={key} onClick={() => { let filtrosa = filtrosAtivos; filtrosa[i] = { tipo: filtrosa[i].tipo, valor: a, label: a }; setFiltros(filtrosa); update() }}>{typeof (a) === "string" ? a : a.value}</MenuItem>)
                                    }
                                </TextField>
                                </>
                                }
                            </Grid>
                    )}
            </Grid>
            <Grid key={3} container item xs={12}>
                <Grid key={1} item xs={12}>
                </Grid>
                <Grid key={2} item xs={24}>
                    <Button
                        key={1}
                        variant="contained"
                        align="center"
                        size="small"
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
										filtro.tipo.includes("Data") ?
										`${filtro.tipo}: ${(new Date(filtro.valor)).toLocaleDateString()}` :
                                        `${filtro.tipo}: ${filtro.valor}`
                                    ).join('\n')
                                ,20, 25)
                                let not_yet = true
                                let i = 0

                                while (not_yet) {
                                doc.setFontSize(12);
                                (["Assunto", "Descrição", "", "Categoria", "Sub-Categoria", "Departamento", "ID"])
                                    .forEach(
                                        (campo, index)=>{
                                            doc.text(campo, index ? index * (campo_l + u) : u, 30 + filtrosAtivos.length * 5)
                                        }
                                    )
                                doc.setLineWidth(0.3)
                                doc.line(10,15,200,15)
                                doc.line(10, 25 + filtrosAtivos.length * 5, 200, 25 + filtrosAtivos.length * 5)
                                doc.setLineWidth(0.15)
                                    relatorio.slice(25 * i, 25 * (i + 1)).forEach(
                                        (servico, index) => {
                                            let yo = 35 + index*10 + filtrosAtivos.length * 5
                                            doc.setFontSize(8)
                                            doc.text(
                                                doc.splitTextToSize(servico.assunto, 20).length <= 2 ? 
                                                doc.splitTextToSize(servico.assunto, 20)
                                                 : 
                                                 [doc.splitTextToSize(servico.assunto, 20)[0] + '...', '...' + doc.splitTextToSize(servico.assunto, 20).at(-1)], u, yo)
                                            //doc.text(
                                            //    atendentes.find(e => e.id == servico.atendenteId) ? 
                                            //    atendentes.find(e => e.id == servico.atendenteId).nome : 
                                            //    "Não encontrado", campo_l + u, yo)
                                            //doc.text((["Baixa", "Média", "Alta", "Urgente"])[parseInt(servico.prioridade) - 1], 2 * (campo_l + u), yo)
                                            //doc.text(servico.status, 3 * (campo_l + u), yo)
                                            //doc.text(
                                            //    atendentes.find(e => e.id == servico.atendenteId) ? 
                                            //    atendentes.find(e => e.id == servico.atendenteId).nome : 
                                            //    "Não encontrado", 3 * (campo_l + u), yo);
                                            doc.text(
                                                doc.splitTextToSize(servico.chat[0].mensagem, 60).length <= 2 ?
                                                doc.splitTextToSize(servico.chat[0].mensagem, 60) :
                                                [doc.splitTextToSize(servico.chat[0].mensagem, 60)[0] + '...', '...' + doc.splitTextToSize(servico.chat[0].mensagem, 60).at(-1)]
                                                , 1 * (campo_l + u), yo)
                                            doc.text(servico.tipo, 3 * (campo_l + u), yo)
                                            doc.text(servico.subCategoria ? 
                                                doc.splitTextToSize(servico.subCategoria, 60).length <= 2 ?
                                                doc.splitTextToSize(servico.subCategoria, 60) :
                                                [doc.splitTextToSize(servico.subCategoria, 60)[0] + '...', '...' + doc.splitTextToSize(servico.subCategoria, 60).at(-1)]
                                                : "Não definido", 4 * (campo_l + u), yo)
                                            doc.text(servico.departamento, 5 * (campo_l + u), yo)
                                            doc.text(String(servico.id), 6 * (campo_l + u), yo)
                                            doc.line(10, yo + 6, 200, yo + 6)
                                        }
                                    ) 
                                    i++
                                    if (relatorio.slice(25 * i, 25 * (i + 1)).length === 0) 
                                        not_yet = false
                                    else
                                        doc.addPage()
                                }
                                let y_linha = 35 + (relatorio.length % 25) * 10 + ( relatorio.length > 25 ? 0 : filtrosAtivos.length * 5 - 5 )
                                doc.text(`Total: ${relatorio.length}`, 10, y_linha + 5)
                                //doc.save('Relatorio.pdf')
                                doc.output('dataurlnewwindow',{filename:'Relatorio.pdf'})
                                console.log("Saved!")
                            }
                        }
                        
                        sx={{
                            width: 'fit-content',
                            paddingX: 2,
                            height: 'fit-content',
                            paddingY: 0.15,
                            '& span': {
                                margin: 0
                            }
                        }}>
                        Imprimir
                    </Button>
                    <Box key={2} align="left" margin={2} ref={pdfRef}>
                        <Stack component={Card} padding={4} spacing={3}>
                            <Typography key={1} component="h1" variant="h3">
                                Relatório de Chamados
                            </Typography>
                            <Typography key={2} variant="h4">
                                Com os filtros de:
                            </Typography>
                            {filtrosAtivos.map((filtro, i) => <Typography key={i} variant="h5">{filtro.valor ? filtro.tipo === "Atendente" ? `Atendente: ${atendentes.find(e => e.id == filtro.valor).nome}` : `${filtro.tipo}: ${filtro.valor}` : "Filtro"}</Typography>)}
                            <Typography key={3}>
                                Total: {relatorio ? relatorio.length : 0}
                            </Typography>
                            <Table key={4}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={2}>
                                            Assunto
                                        </TableCell>
                                        <TableCell>
                                            Data
                                        </TableCell>
                                        <TableCell>
                                            Atendente
                                        </TableCell>
                                        <TableCell>
                                            Usuario
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
                                            Sub-Categoria
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
                                                    {(new Date(r.createdAt)).toISOString().split('T')[0]}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {atendentes.find(e => e.id == r.atendenteId)?.nome || "Não encontrado"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {usuarios.find(usr => usr.id == r.usuarioId)?.nome || "Não encontrado"}
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
                                                        {r.subCategoria ? r.subCategoria : "Não definido"}
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
                    </Box>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default Relatorios