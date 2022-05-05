import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faTasks,
  faChartBar,
  faBell,
  faBookOpen,
  faCog,
  faUserPlus
} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";
import req from "./Requisicao";
import valida_suporte from "./Valida_Suporte";
import valida_admin from "./Valida_Admin";
import { Button, Stack, Badge, Tooltip, useTheme } from "@mui/material";

const SideBar = function (props) {
  console.log("Sidebar render")
  const theme = useTheme()
  const sobe_botao = theme.transitions.create(['left'], {duration: 300, delay: 250})
  const [pendentes, setPendentes] = useState(0)
  const getPendente = async function () {
    await req("get", "/servicos/status/pendente")
      .then(({data})=>{
        setPendentes(data.length)
      }).catch((err)=>{setPendentes(0);console.log(err)})
  }

  useEffect(()=>{
    let interval = setInterval(getPendente, 2000)
    return ()=>{
      clearInterval(interval)
    }
  }, [])
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
        <SideButton title="Home" color="#7DC9FF" path="/" icon={faHome} />
        <SideButton title="Serviços" color="#DED97A" path="/servicos" icon={faTasks} />
        {/*valida_suporte(
         ()=>SideButton({
            title:"Indicadores",
            color:"#C9E054",
            path:"/indicadores",
            icon:faChartBar
          })
        )() || valida_admin(
          ()=>SideButton({
            title:"Indicadores",
            color:"#C9E054",
            path:"/indicadores",
            icon:faChartBar
          })
        )()//<SideButton title="Indicadores" color="#C9E054" path="/indicadores" icon={faChartBar} />
      */}
       {valida_suporte(()=><Tooltip title="Avisos">
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
        </Tooltip>)()}
        {valida_suporte(
         ()=>SideButton({
            title:"Relatórios",
            color:"#8287E0",
            path:"/relatorios",
            icon:faBookOpen
          })
        )() || 
        valida_admin(
          ()=>SideButton({
             title:"Relatórios",
             color:"#8287E0",
             path:"/relatorios",
             icon:faBookOpen
           })
        )()//<SideButton title="Relatórios" color="#8287E0" path="/relatorios" icon={faBookOpen} />
       }
       {valida_suporte(
         ()=>SideButton({
            title:"Configurações",
            color:"#A362E0",
            path:"/Config",
            icon:faCog
          })
        )() || 
        valida_admin(
          ()=>SideButton({
             title:"Configurações",
             color:"#A362E0",
             path:"/Config",
             icon:faCog
           })
        )()//<SideButton title="Configurações" color="#A362E0" path="/Config" icon={faCog} />
       }
       {valida_admin(
         ()=>SideButton({
           title:"Adicionar Usuário",
           color: "#86B5F0",
           path:"/registro",
           icon:faUserPlus
         })
       )()
       }
    </Stack>
  );
};


function SideButton ({title, color, path, icon}) {
    return (
      <Tooltip title={title}>
      <Button
        variant="contained"
		sx={{
			backgroundColor: color
		}}
        component={Link}
        to={path}
      >
        <FontAwesomeIcon icon={icon} />
      </Button>
      </Tooltip>
    )
}

export default SideBar;
