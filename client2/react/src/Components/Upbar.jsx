import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusCircle
} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom"

import { Button, Chip } from "@mui/material";
import Stack from "@mui/material/Stack";

const UpBar = (props) => {
    return (
      <Stack spacing={2} direction="row">
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/nova_requisicao"
        >
          <FontAwesomeIcon icon={faPlusCircle} />
        </Button>
      </Stack>
    );
  }

export default UpBar;
