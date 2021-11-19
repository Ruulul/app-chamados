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
import { Button, Stack, Badge } from "@mui/material";

const SideBar = function (props) {
  const [pendentes, setPendentes] = useState(0)
  useEffect(async()=>{
    await axios.get("http://10.0.0.83:5000/api/servicos", { withCredentials: true })
      .then(({data})=>{
        setPendentes(data.length)
      }).catch((err)=>{throw new Error(err)})
  },[])
  return (
    <Stack
      direction={{ xs: "row", md: "column" }}
      sx={{ placeContent: "center" }}
    >
      <Button
        variant="contained"
        color="secondary"
        component={Link}
        to="/"
      >
        <FontAwesomeIcon icon={faHome} />
      </Button>
      <Button
        variant="outlined"
        component={Link}
        to="/servicos"
      >
        <FontAwesomeIcon icon={faTasks} />
      </Button>
      <Button 
        variant="outlined" 
        component={Link}
        to="/indicadores"
      >
        <FontAwesomeIcon icon={faChartBar} />
      </Button>
      <Button 
        color="warning" 
        variant="outlined"
        component={Link}
        to="/avisos">
        <Badge badgeContent={pendentes} variant="contained" color="error">
          <FontAwesomeIcon icon={faBell} />
        </Badge>
      </Button>
    </Stack>
  );
};

export default SideBar;
