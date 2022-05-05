import { useEffect, useState } from 'react';
import {CircularProgress} from '@mui/material';
import axios from './Requisicao';

let sx_centralize = { 
    display: "grid", 
    margin: "auto", 
    align:"center", 
    marginTop: "30vh", 
    transform: "scale(3)" }

export default function valida(Component) {
    let [autorizade, autoriza] = useState(undefined)
    console.log(autorizade!==undefined ? `Concluído(${autorizade===null ? "Not " : ""}admin)` : "Autorizando admin...")
    useEffect(()=>
        axios('get', '/perfil')
            .then(({data})=>
                data.cargo == "admin" 
                ? autoriza(true)
                : autoriza(null)
            ).catch(()=>autoriza(null))
        ,
    [])
    return ()=>autorizade ?
        <Component />
    :   autorizade===null ?
        <></>
    : <CircularProgress sx={sx_centralize}/>
}