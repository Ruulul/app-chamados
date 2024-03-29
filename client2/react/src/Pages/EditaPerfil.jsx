import { faBackward } from "@fortawesome/free-solid-svg-icons";
import Stack from "@mui/material/Stack";
import Button from '@mui/material/Button'
import { useEffect, useState } from "react";
import { EditaIcon, EditaInfos, Dept } from '../Components/Perfil'
import axios from '../Components/Requisicao';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Perfil () {
    let [{nome, sobrenome, bio, contatos="[]", profile_icon : icon, dept}, setPerfil] = useState({})
    useEffect(()=>
        axios("get",`/perfil`)
            .then(({data})=>setPerfil(data))
            .catch(console.error),[]);
    return <Stack sx={{m:3}} direction="row" gap="3em">
        <Stack display="grid" alignment="justified">
            <Stack direction="row">
                <EditaIcon icon={icon} />
                <Button
                component={ Link }
                to="/perfil"
                >
                    <FontAwesomeIcon icon={faBackward} />
                </Button>
            </Stack>
            <EditaInfos sx={{mt:3}} {...{nome,sobrenome,bio,contatos}} />
        </Stack>
        <Dept dept={[...(typeof dept == 'string' ? [dept] : dept) || ""]} />
    </Stack>
}