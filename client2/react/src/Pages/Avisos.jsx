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
    TableBody,
    Card,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons";

export default function Avisos(props) {
    const [servicos, setServicos] = useState([]);
    const redirect = useNavigate()
    useEffect(()=>{
        const getServicos = ()=>{
            axios.get("http://10.0.0.83:5000/api/servicos/status/pendente", { withCredentials: true })
                .then(({data})=>{
                    data.forEach((servico, index)=>{
                        let criado_em = new Date(servico.createdAt)
                        let prazo = new Date(servico.prazo)
                        data[index] = {...servico, ...{criado_em, prazo}}
                    })
                    setServicos(data)
                })
                .catch(()=>{redirect("/login")})
        }
        let interval = setInterval(getServicos, 500)
        return ()=>{
            clearInterval(interval)
        }
    },[]);
    return (
    <Card>
        <Grid container width={1}>
            <Grid item xs={12} component="table" >
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
                            let tempo_restante = servico.prazo.getTime() - (Date.now())
                            let duracao_prazo = (servico.prazo.getTime() - (servico.criado_em.getTime()))
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
                                    ${Math.floor(tempo_restante/86.4e6)}d
                                    ${Math.floor(tempo_restante/36e5 % 24)}h
                                    ${Math.floor(tempo_restante/6e4 % 60)}min
                                    ${Math.floor(tempo_restante/1e3 % 60)}s`}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                      <CircularProgress color="warning" variant="determinate" value={-percentual_faltante * 100} />
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
        </Grid>
    </Card>
    );
}