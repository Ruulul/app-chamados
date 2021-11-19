import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faTasks,
  faChartBar,
  faBell
} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";

import { Button, Stack } from "@mui/material";

const SideBar = function (props) {
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
      <Button color="warning" variant="outlined" disabled>
        <FontAwesomeIcon icon={faBell} />
      </Button>
    </Stack>
  );
};

export default SideBar;
