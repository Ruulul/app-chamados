import {
    useState,
    useEffect
} from "react";
import {
    Grid,
    Skeleton,
    TableCell,
    TableRow,
    Typography,
    CircularProgress,
    Box,
    Button,
    TableHead,
    TableBody
} from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons";

export default function Avisos(props) {
    const [servicos, setServicos] = useState([]);
    useEffect(()=>{
        axios.get("http://10.0.0.83:5000/api/servicos/pendente", { withCredentials: true })
            .then(({data})=>{
                setServicos(data)
            })
            .catch(console.log)
    },[servicos]);
    return (
    <Grid container spacing={2}>
        <Grid item xs={12}>
            <Typography>
                Serviços pendentes: {servicos.length}
            </Typography>
        </Grid>
        <Grid item xs={6}>
            <Skeleton animation={false} variant="rectangular" sx={{height: 200}} />
        </Grid>
        <Grid item container xs={6} component="table" >
            <TableHead>
                <TableRow>
                    <TableCell colSpan={2}>
                        Chamado
                    </TableCell>
                    <TableCell>
                        Urgência
                    </TableCell>
                    <TableCell colSpan={2}>
                        Tempo Restante
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {servicos!=[] ?
                servicos.map((servico)=>{
                        let criado_em = new Date(servico.createdAt)
                        let prazo = new Date(servico.prazo)
                        let tempo_restante = Math.abs(prazo.getTime() - (Date.now()))
                        let duracao_prazo = (prazo.getTime() - (criado_em.getTime()))
                        let percentual_faltante = (tempo_restante/duracao_prazo);
                        return <TableRow>
                            <TableCell>
                                <Button 
                                    variant="contained"
                                    component={Link}
                                    to={`/chamado/${servico.id}`}
                                >
                                {" "}
                                    <FontAwesomeIcon icon={faEnvelopeOpen} />
                                </Button>
                            </TableCell>
                            <TableCell>
                                {servico.assunto}
                            </TableCell>
                            <TableCell>
                                {(["Baixa", "Média", "Alta", "Urgente"])[servico.prioridade - 1]}
                            </TableCell>
                            <TableCell>
                                {`
                                ${Math.floor(tempo_restante/8.64e7)}d
                                ${Math.floor(tempo_restante/3.6e6 % 24)}h
                                ${Math.floor(tempo_restante/6e4 % 60)}min
                                ${Math.floor(tempo_restante/1e3 % 60)}s`}
                            </TableCell>
                            <TableCell>
                                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                  <CircularProgress color="warning" variant="determinate" value={percentual_faltante * 100} />
                                  <Box
                                    sx={{
                                      top: 0,
                                      left: 0,
                                      bottom: 0,
                                      right: 0,
                                      position: 'absolute',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <Typography variant="caption" component="div" color="text.secondary">
                                      {`${Math.round(percentual_faltante * 100)}%`}
                                    </Typography>
                                  </Box>
                                </Box>
                            </TableCell>
                        </TableRow>
                    }) :
                    <>
                <Skeleton animation={false} variant="rectangular" sx={{height:25}}/>
                <Skeleton animation={false} variant="rectangular" sx={{height:25}}/>
                <Skeleton animation={false} variant="rectangular" sx={{height:25}}/>
                <Skeleton animation={false} variant="rectangular" sx={{height:25}}/>
                    </>}
            </TableBody>
        </Grid>
        <Grid item xs={12}>
            <Skeleton animation={false} variant="rectangular" sx={{height: 66}}/>
        </Grid>
        <Grid item xs={12}>
            <Skeleton animation={false} variant="rectangular" sx={{height: 66}}/>
        </Grid>
        <Grid item xs={12}>
            <Skeleton animation={false} variant="rectangular" sx={{height: 66}}/>
        </Grid>
    </Grid>
    );
}