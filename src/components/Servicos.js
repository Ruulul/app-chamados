import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons";

import {
  Button,
  Table,
  TableRow,
  TableBody,
  TableHead,
  TableCell
} from "@mui/material";

const Servicos = (props) => {
  let lista_servicos = [];
  props.servicos.forEach((s, i) => {
    lista_servicos = [
      ...lista_servicos,
      <TableRow>
        <TableCell>
          <Button
            variant="contained"
            key={i}
            onClick={() => {
              props.ir_para_pagina(s.id);
            }}
          >
            {" "}
            <FontAwesomeIcon icon={faEnvelopeOpen} />
          </Button>
        </TableCell>
        <TableCell>{s.id}</TableCell>
        <TableCell>{s.prioridade}</TableCell>
        <TableCell>{s.assunto}</TableCell>
        <TableCell>{s.departamento}</TableCell>
        <TableCell>{s.status}</TableCell>
      </TableRow>
    ];
  });

  return (
    <div style={{ display: "flex" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Navegar</TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Importância</TableCell>
            <TableCell>Assunto</TableCell>
            <TableCell>Departamento</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{lista_servicos}</TableBody>
      </Table>
    </div>
  );
};

export default Servicos;
