import {Outlet} from 'react-router-dom';
import UpBar from '../Components/Upbar';
import SideBar from '../Components/Sidebar';

import {Grid, Divider, Typography, Paper, Input, Button, Box} from "@mui/material";

//import { Buffer } from 'buffer'
//const { Buffer } = window.buffer

/*import Libp2p from 'libp2p';
import { NOISE } from '@chainsafe/libp2p-noise';
import { WebSockets } from "@libp2p/websockets";
import { MPLEX } from "libp2p-mplex";
*/

//const swarm_id = "Goldseed Grupo Ouro Branco Bugout"
//const Bugout = window.Bugout
//import axios from "../Components/Requisicao"
//import { useState, useEffect, useRef } from 'react';

export default function Main() {
    return (
        <Grid container orientation="row" spacing={1}>
          <Grid container item xs={12} justifyContent="center">
            <UpBar />
          </Grid>
          <Grid item display="grid" xs={12} lg={1}>
            <SideBar />
          </Grid>
          <Grid item sx={{ padding: 0 }} xs={12} md={11}>
            <Divider sx={
              {
                position: "absolute", 
                left: 0, 
                width: "100vw",
                backgroundColor: "#2DB5FA",
                borderWidth: 1
              }
            } />
            <Outlet/>
            <Versao versao="1.3.3"/>
          </Grid>
        </Grid>
      );
} 

function Versao({versao}) {
  return <Typography
  sx={{
    position: "fixed",
    right: "2vmax",
    bottom: "1vmax",
    flexShrink: 0
  }}>
    v {versao}  
  </Typography>  
}
/*
function Chat({props}) {
  const [bug, setBug] = useState(undefined)
  const [chat, setChat] = useState([])
  const [display, setDisplay] = useState(false)
  const PeerToId = useRef({})
  const justIn = useRef(true)
  chat.forEach(message=>console.log(message.from + ": " + message.message))
  const addMessage = (message)=>setChat((chat)=>[...chat, message])

  function createBug({nome:user_name}){
    let options = {}
    setTimeout(()=>justIn.current=false, 2000)
    let bug = localStorage['bug-seed'] 
      ? new Bugout(swarm_id, {...options, seed: localStorage['bug-seed']})
      : new Bugout(swarm_id, options)
    !localStorage['bug-seed']
      ? (localStorage['bug-seed'] = bug.seed)
      : undefined
  
    bug.register("name", (addr, name, justIn = false)=>{
      PeerToId.current={...PeerToId.current, [addr]:name}
      justIn 
        ? addMessage({from: "info", message:`${name} entrou!`}) 
        : addMessage({from: "info", message:`${name} está online`})
    })
    PeerToId.current[bug.address()] = user_name
    bug.on("message",(addr, message)=>addMessage({from:PeerToId.current[addr] || addr, message}))
    bug.on("seen",addr=>{
      bug.rpc(addr, "name", user_name, justIn.current)
    })
    bug.on("left",(addr)=>{
      addMessage({from:"info", message:`${PeerToId.current[addr] || "[REDACTED]"} saiu`})
      delete PeerToId.current[addr]
    })
    return bug
  }

  function endBug() {
    bug.close()
  }

  useEffect(()=>{
    axios("get", "/perfil")
      .then(({data})=>{
        data !== "Não autorizado"
          ? setBug(createBug({nome:data.nome}))
          : setChat([{from: "sistema", message: "Não autorizado"}])
      })
    return ()=>endBug()
  },[])

  return !display ? <Paper 
    elevation={5} 
    sx={{
      width: "5vmax",
      height: "5vmax",
      borderRadius: "100%",
      position: "fixed",
      right: "2vmax",
      bottom: "3vmax",
      transitionDelay: "200ms",
      transition: 'width 2s, height 2s, padding 1s, border-radius 2s',
    }}
    onPointerEnter={()=>setDisplay(true)}>
  </Paper>
  :<Paper
      className="chat"
        sx={{
          overflow: 'hidden',
          display:"flex",
          flexDirection:"column",
          position: "fixed",
          right: "2vmax",
          bottom: "3vmax",
          transition: 'width 2s, height 2s, padding 1s, border-radius 1s',
          width: "20vmax",
          height: "50vh",
          padding: 0
      }}
      onPointerLeave={()=>setDisplay(false)}>
        <Paper
        sx={{
          display:"flex",
          flexDirection:"column",
          gap: "1rem",
          overflow: "scroll",
          flexGrow: 1,
          marginBottom: "20%",
          display:"flex",
          flexDirection:"column",
          padding: 3,
          gap: 2
        }}>{
          chat.map((entry)=><Message {...{entry}}/>)
        }</Paper>
        <EnviarMensagem enviar={(message, addr)=>addr ? bug.send(addr, message) : bug.send(message)} users={PeerToId}/>
      </Paper>
}

function Message({entry}) {
  return <Paper elevation={5}>
    <Typography variant="caption">
      {entry.from}:
    </Typography>
    <Typography>
      {entry.message}
    </Typography>
  </Paper>
}

function EnviarMensagem({enviar, users}) {
  const [message, setMessage] = useState("")
  function onChange({target:{value}}) {
    setMessage(value)
  }
  function onSubmit(event) {
    event.preventDefault()
    enviar(message)
    setMessage("")
  }
  return (
      <Box component="form"
          onClick={onSubmit}
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "20%"
          }}>
        <Input value={message} onChange={onChange}/>
        <Button variant="contained"
          type="submit"
          width="fit-content"
          height="fit-content">
          Enviar
        </Button>
      </Box>
  )
}*/