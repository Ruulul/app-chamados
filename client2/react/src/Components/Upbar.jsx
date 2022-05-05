import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusCircle,
  faSignOutAlt,
  faBuilding
} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom"

import { Box, Grid, Button, Typography, CardMedia, NativeSelect } from "@mui/material";
import Stack from "@mui/material/Stack";
import axios, {setFilial as setFilialAxios} from "./Requisicao";
import { useNavigate } from "react-router-dom"

const UpBar = (props) => {
    const redirect = useNavigate()
    const [variant, setVariant] = useState("secondary")
    const [filiais, setFiliais] = useState([{nome:"Carregando...", codigo:"Carregando..."}])
    const [filial, setFilial] = useState(0)
    useEffect(()=>{
      axios("get", "/all")
        .then(({data})=>
          typeof data === "string" 
          ? setFiliais([{nome: data}]) 
          : (console.log(data),setFiliais(data), setFilialAxios(data[0].codigo))
        ).catch(e=>{console.log(e); setFiliais([{nome: "Um erro ocorreu"}]); setFilial(undefined)})
    },[])
    return (
      <Grid container>
        <Grid item xs={7}>
          <Stack spacing={2} size="small" direction="row" ml={1} pt={1} pr={4} justifyContent="space-between">
            <Box>
              <Button
                key={1}
                variant="contained"
                color="primary"
                component={Link}
                to="/nova_requisicao"
              >
                <FontAwesomeIcon icon={faPlusCircle} />
              </Button>         
              <Box display="grid" key={2}>
                <FontAwesomeIcon key={1} style={{margin: 'auto', gridRow: 1, gridColumn: 1}} icon={faBuilding}/>   
                <NativeSelect key={2} style={{margin: 'auto', alignSelf: 'left', gridRow: 1, gridColumn: 2}}
                onChange={(event)=>{
                  setFilial(filiais.indexOf(filiais.find(filial=>filial.codigo==event.target.value)))
                  setFilialAxios(event.target.value)
                }}
                multiple>
                  {filiais.map((filial, key)=><option {...{key}}>{filial.codigo}</option>)}
                </NativeSelect>
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
              </Box>
            </Box>
			<Typography component="h1" variant="h4" fontFamily="Major Mono Display, monospace" sx={{fontWeigth: 100}}>
				help desk
			</Typography>
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
                width: {sx:1/20,md: 1/30},
                position: "absolute",
                right: 30
              }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </Button>
          </Stack>
        </Grid>
      </Grid>
    );
  }

export default UpBar;

			//<Typography component="h1" variant="h2">
			//	Help Desk
			//</Typography>
			