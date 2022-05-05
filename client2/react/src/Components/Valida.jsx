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
    useEffect(()=>{
        axios('get', '/perfil')
            .then(({data})=>
                data=="Não autorizado" 
                ? window.location='/login' 
                : autoriza(true)
            ).catch(()=>autoriza(null))
    },[])
    return ()=>autorizade ?
        <Component />
    :   autorizade===null ?
    "Algum erro ocorreu"
    : <CircularProgress sx={sx_centralize}/>
}