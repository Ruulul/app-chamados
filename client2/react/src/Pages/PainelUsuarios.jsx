import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Typography, Stack, Table, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";
import { useEffect, useState } from "preact/compat";
import { Link } from "react-router-dom";

import axios from "../Components/Requisicao"

export default function PainelUsuarios() {
    const [usuarios, setUsuarios] = useState([])
    const [filiais, setFiliais] = useState([])

    useEffect(()=>{
        let controller = new AbortController
        let signal = controller.signal
        let fetchUsers = 
            () => {
                axios("get", "/usuarios/all", undefined, {signal})
                    .then(({data})=>signal.aborted?undefined:setUsuarios(data))
                    .catch(e=>signal.aborted?undefined:setUsuarios([{nome:e.reason}]))
            }
        let fetchTimer =
            setInterval(fetchUsers, 1000)
        return ()=>{
            controller.abort()
            clearInterval(fetchTimer)
        }
    },[])

    useEffect(()=>{
        let controller = new AbortController
        let signal = controller.signal
        let fetchFiliais = 
            () => {
                axios("get", "/all", undefined, {signal})
                    .then(({data})=>setFiliais(data))
                    .catch(e=>setFiliais([{nome:e.reason}]))
            }
        let fetchTimer =
            setInterval(fetchFiliais, 1000)
        return ()=>{
            controller.abort()
            clearInterval(fetchTimer)
        }
    },[])

    return <Stack>
        <Typography variant="h3" component="h2" p={3} key={0}>
            Painel de Usuários
        </Typography>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>
                        Editar
                    </TableCell>
                    <TableCell>
                        Id
                    </TableCell>
                    <TableCell>
                        Nome
                    </TableCell>
                    <TableCell>
                        Departamento
                    </TableCell>
                    <TableCell>
                        Filial
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {usuarios.map(
                    (usuario, key)=>
                    <TableRow key={key+1} direction="row" gap="1em">
                        <TableCell>
                            <Button
                            component={Link}
                            variant="contained"
                            to={`/usuario/editar/`+usuario.id}>
                                <FontAwesomeIcon icon={faPen}/>
                            </Button>
                        </TableCell>
                        <TableCell>
                            {usuario.id}
                        </TableCell>
                        <TableCell>
                            {usuario.nome}
                        </TableCell>
                        <TableCell>
                            {usuario.dept || "Não definido"}
                        </TableCell>
                        <TableCell>
                            {filiais.find(filial=>filial.id==usuario.filialId)?.nome || "Não encontrado"}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </Stack>
}