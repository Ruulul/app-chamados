import React, { useEffect, useState } from 'react'//"preact/compat";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusCircle,
  faSignOutAlt,
  faBuilding,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom"

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import axios, {setFilial as setFilialAxios} from "./Requisicao";
import { useNavigate } from "react-router-dom"
import { InputLabel } from "@mui/material";

const UpBar = (props) => {
    const redirect = useNavigate()
    const [variant, setVariant] = useState("secondary")
    const [filiais, setFiliais] = useState([{nome:"Carregando...", codigo:"Carregando..."}])
    const [filial, setFilial] = useState(0)
    const [primeiroAcesso, setPrimeiroAcesso] = useState(false)
    useEffect(()=>{
      axios("get", "/all")
        .then(({data})=>
          typeof data === "string" 
          ? setFiliais([{nome: data}]) 
          : (console.log(data),setFiliais(data), setFilialAxios(data[0].codigo))
        ).catch(e=>{console.log(e); setFiliais([{nome: "Um erro ocorreu"}]); setFilial(undefined)})
    },[])
    useEffect(function getPrimeiroAcesso(){
      axios("get", "/perfil")
        .then(({data : perfil})=>{
          console.log(JSON.stringify(perfil))
          setPrimeiroAcesso(perfil.primeiro_acesso)
        })
    },[])
    return (
      <Grid container>
        <Grid item xs={7}>
          <Stack spacing={2} size="small" direction="row" ml={1} pt={1} pr={4} justifyContent="space-between">
            <Stack direction="row" gap="1em">
              <Tooltip title="Abrir OS">
                <Button
                  key={1}
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/nova_requisicao"
                >
                  <FontAwesomeIcon icon={faPlusCircle} />
                </Button>         
              </Tooltip>
                <Box display="flex" flexDirection="column" key={2}>
                    {filiais.length > 1 && 
                    <Box top={1} display="flex" flexDirection="row">
                      <Select key={2}
                        variant="filled"
                        size="small"
                        onClick={({target:{attributes:{name:{value}}}})=>{
                          setFilial(filiais.indexOf(filiais.find(filial=>filial.codigo==value)))
                          setFilialAxios(value)
                        }}
                        >
                        {filiais.map((filial, key)=><MenuItem name={filial.codigo} {...{key}}>{filial.codigo}</MenuItem>)}
                      </Select>
                      <Box display="grid">
                        <InputLabel sx={{margin:"auto"}}>Selecionar filial</InputLabel>
                      </Box>
                    </Box>}
                  <Tooltip title="Filial do sistema">
                    <Typography key={3} style={{margin: "auto", gridRow: 2, gridColumn: 2}}>
                      {(()=>{
                        try {
                          return filiais[filial].nome
                        } catch(e) {
                          console.log(e)
                          return "Um erro ocorreu"
                        }
                        })()}
                    </Typography>
                  </Tooltip>
                </Box>
            </Stack>
			<Typography component="h1" variant="h4" fontFamily="Major Mono Display, monospace" sx={{fontWeigth: 100}}>
				help desk
			</Typography>
            <Box position="absolute" right="2em" display="flex" gap="2em">
              {
                primeiroAcesso ? 
                  <Button color="warning" variant="contained"
                  sx={{
                    fontSize: "0.7em",
                    width: "10em",
                    height: "4em"
                  }}
                  onClick={()=>redirect("/login?primeiroAcesso=" + primeiroAcesso)}>
                      Escolha sua senha
                  </Button> :
                  undefined
              }
              <Button
              component={Link}
              to="/perfil">
                <FontAwesomeIcon icon={faUser}/>
              </Button>
              <Button
                size="small"
                variant="contained"
                color={variant}
                onClick={async ()=>{
                  await axios("post", '/logout')
                    .then(()=>{
                      redirect("/login")
                    })
                    .catch((err)=>{console.log(err);return setVariant("error")})
                }}

                sx={{
                  minWidth: 0,
                  minHeight: 0,
                  width: {
                    lg:"5vw",
                    xs:"10vw"
                  }
                }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
              </Button>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    );
  }

export default UpBar;

			//<Typography component="h1" variant="h2">
			//	Help Desk
			//</Typography>
			