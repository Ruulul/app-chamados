import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faTasks,
  faChartBar,
  faBell
} from "@fortawesome/free-solid-svg-icons";

import { Button, Stack } from "@mui/material";

const SideBar = function (props) {
  return (
    <Stack
      direction={{ xs: "row", md: "column" }}
      sx={{ placeContent: "center" }}
    >
      <Button
        variant="outlined"
        onClick={() => {
          props.ir_para_pagina(-1);
        }}
      >
        <FontAwesomeIcon icon={faHome} />
      </Button>
      <Button
        variant="outlined"
        onClick={() => {
          props.ir_para_pagina(-2);
        }}
      >
        <FontAwesomeIcon icon={faTasks} />
      </Button>
      <Button variant="outlined" disabled>
        <FontAwesomeIcon icon={faChartBar} />
      </Button>
      <Button variant="outlined" disabled>
        <FontAwesomeIcon icon={faBell} />
      </Button>
    </Stack>
  );
};

export default SideBar;
