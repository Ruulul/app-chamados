import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusCircle,
  faStickyNote,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

import { Button, Chip } from "@mui/material";
import Stack from "@mui/material/Stack";

class UpBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      servicos: props.servicos,
      plus: props.plus,
      closeall: props.close,
      switch: props.switch
    };
  }

  render() {
    let abas_servico = [];
    this.state.servicos.forEach((servico, i) => {
      abas_servico[i] = !servico.editando ? (
        <Button
          color="primary"
          variant="outlined"
          key={i * 5}
          sx={{ width: "fit-content" }}
          onClick={() => {
            this.state.switch(i);
          }}
        >
          Editar <FontAwesomeIcon icon={faStickyNote} />
          <Chip>
            Fechar <FontAwesomeIcon icon={faTimesCircle} />
          </Chip>
        </Button>
      ) : undefined;
    });
    return (
      <Stack spacing={2} direction="row">
        {abas_servico}
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.state.plus()}
        >
          <FontAwesomeIcon icon={faPlusCircle} />
        </Button>
      </Stack>
    );
  }
}

export default UpBar;
