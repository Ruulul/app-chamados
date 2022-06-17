import Stack from "@mui/material/Stack";
import { useEffect, useState } from "react";
import { Icon, Infos, EditarDept } from '../Components/Perfil'
import { useParams } from "react-router-dom";

import axios from '../Components/Requisicao';

export default function EditaPerfil () {
    let {id} = useParams()
    let [{nome, sobrenome, bio, contatos="[]", profile_icon : icon, dept}, setPerfil] = useState({})
    useEffect(()=>
        axios("get",`/usuario/${id}`)
            .then(({data})=>setPerfil(data))
            .catch(console.error),[]);
    return <Stack sx={{m:3}} direction="row" gap="3em">
        <Stack display="grid" alignment="justified">
            <Icon icon={icon} />
            <Infos sx={{mt:3}} {...{nome, sobrenome, bio, contatos}} />
        </Stack>
        <EditarDept dept={[...(typeof dept == 'string' ? [dept] : dept) || ""]} />
    </Stack>
}