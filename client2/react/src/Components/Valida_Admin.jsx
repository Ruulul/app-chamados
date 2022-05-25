import { useEffect, useState } from 'react'//'preact/compat';
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