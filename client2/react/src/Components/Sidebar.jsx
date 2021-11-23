import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faTasks,
  faChartBar,
  faBell
} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";
import axios from "axios";
import { Button, Stack, Badge, Tooltip, Box } from "@mui/material";

const SideBar = function (props) {
  const [pendentes, setPendentes] = useState(0)
  useEffect(()=>{
    axios.get("http://10.0.0.83:5000/api/servicos/pendente", { withCredentials: true })
      .then(({data})=>{
        setPendentes(data.length)
      }).catch((err)=>{setPendentes(0);console.log(err)})
  })
  return (
    <Stack
      direction={{ xs: "row", md: "column" }}
      sx={{ placeContent: "center",  }}
    >
      <Tooltip title="Home">
      <Button
        variant="contained"
        color="secondary"
        component={Link}
        to="/"
      >
        <FontAwesomeIcon icon={faHome} />
      </Button>
      </Tooltip>
      <Tooltip title="Serviços">
      <Button
        variant="outlined"
        component={Link}
        to="/servicos"
      >
        <FontAwesomeIcon icon={faTasks} />
      </Button>
      </Tooltip>
      <Tooltip title="Indicadores">
      <Button 
        variant="outlined" 
        component={Link}
        to="/indicadores"
      >
        <FontAwesomeIcon icon={faChartBar} />
      </Button>
      </Tooltip>
      <Tooltip title="Avisos">
      <Button 
        color="warning" 
        variant="outlined"
        component={Link}
        to="/avisos">
        <Badge 
          badgeContent={pendentes} 
          variant="contained" 
          color="error"
          max={9}>
          <FontAwesomeIcon icon={faBell} />
        </Badge>
      </Button>
      </Tooltip>
    </Stack>
  );
};

export default SideBar;
