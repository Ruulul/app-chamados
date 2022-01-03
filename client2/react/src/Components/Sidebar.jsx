import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faTasks,
  faChartBar,
  faBell,
  faBookOpen,
  faCog
} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";
import req from "./Requisicao";
import { Button, Stack, Badge, Tooltip, useTheme } from "@mui/material";

const SideBar = function (props) {
  const theme = useTheme()
  const sobe_botao = theme.transitions.create(['left'], {duration: 300, delay: 250})
  const [pendentes, setPendentes] = useState(0)
  const [, update] = useState({})
  useEffect(()=>{
    let interval = setInterval(()=>{update({})}, 500)
    return ()=>{
      clearInterval(interval)
    }
  },[])
  useEffect(async ()=>{
    await req("get", "/api/servicos/status/pendente")
      .then(({data})=>{
        setPendentes(data.length)
      }).catch((err)=>{setPendentes(0);update({});console.log(err)})
  })
  return (
    <Stack
      sx={{ 
		paddingTop: 5,
		margin: {xs: "auto", lg: 2},
		'& *': {
			display: "relative",
			left: 0,
			//transition: sobe_botao,
			zIndex: 20,
			//'&:hover': {
			//	left: 10
			//}
		},
	}}
	direction={{xs: "row", lg: "column"}}
    >
      <Tooltip title="Home">
      <Button
        variant="contained"
		sx={{
			backgroundColor: "#7DC9FF"
		}}
        component={Link}
        to="/"
      >
        <FontAwesomeIcon icon={faHome} />
      </Button>
      </Tooltip>
      <Tooltip title="Serviços">
      <Button
        variant="contained"
        sx={{backgroundColor:"#DED97A"}}
        component={Link}
        to="/servicos"
      >
        <FontAwesomeIcon icon={faTasks} />
      </Button>
      </Tooltip>
      <Tooltip title="Indicadores">
      <Button 
        variant="contained"
        sx={{backgroundColor:"#C9E054"}}
        component={Link}
        to="/indicadores"
      >
        <FontAwesomeIcon icon={faChartBar} />
      </Button>
      </Tooltip>
      <Tooltip title="Avisos">
      <Button 
        color="warning" 
        variant="contained"
        component={Link}
        to="/avisos">
        <Badge 
          badgeContent={pendentes} 
          variant="contained" 
          color="error"
		  sx={{zIndex:100}}
          max={9}>
          <FontAwesomeIcon icon={faBell} />
        </Badge>
      </Button>
      </Tooltip>
      <Tooltip title="Relatórios">
      <Button 
        color="info" 
        variant="contained"
        sx={{backgroundColor:"#8287E0"}}
        component={Link}
        to="/relatorios">
          <FontAwesomeIcon icon={faBookOpen} />
      </Button>
      </Tooltip>
      <Tooltip title="Configurações">
      <Button 
        color="info" 
        variant="contained"
        sx={{backgroundColor:"#A362E0"}}
        component={Link}
        to="/addCategoria">
          <FontAwesomeIcon icon={faCog} />
      </Button>
      </Tooltip>
    </Stack>
  );
};

export default SideBar;
