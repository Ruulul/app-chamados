import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusCircle
} from "@fortawesome/free-solid-svg-icons";

import { Button, Chip } from "@mui/material";
import Stack from "@mui/material/Stack";

const UpBar = (props) => {
    return (
      <Stack spacing={2} direction="row">
        <Button
          variant="contained"
          color="primary"
          onClick={() => props.plus()}
        >
          <FontAwesomeIcon icon={faPlusCircle} />
        </Button>
      </Stack>
    );
  }

export default UpBar;
