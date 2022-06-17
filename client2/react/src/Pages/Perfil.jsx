import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@mui/material";
import Stack from "@mui/material/Stack";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon, Infos, Dept } from '../Components/Perfil'
import axios from '../Components/Requisicao';

export default function Perfil () {
    let [{nome, sobrenome, bio, contatos="[]", profile_icon : icon, dept}, setPerfil] = useState({})
    useEffect(()=>
        axios("get",`/perfil`)
            .then(({data})=>setPerfil(data))
            .catch(console.error),[]);
    return <Stack sx={{m:3}} direction="row" gap="3em">
        <Stack display="grid" alignment="justified">
            <Stack direction="row">
                <Icon icon={icon} />
                <Button
                component={ Link }
                to="/perfil/editar"
                >
                    <FontAwesomeIcon icon={faPen} />
                </Button>
            </Stack>
            <Infos sx={{mt:3}} {...{nome, sobrenome, bio, contatos}} />
        </Stack>
        <Dept dept={[...(typeof dept == 'string' ? [dept] : dept) || ""]} />
    </Stack>
}