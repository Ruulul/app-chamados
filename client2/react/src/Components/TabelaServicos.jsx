
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

import { Link } from "react-router-dom";

const TabelaServicos = (props) => {
  return (
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
        <TableBody>
          {props.servicos.map((s) => {
            return (<TableRow key={s.id}>
                      <TableCell>
                        <Button
                          variant="contained"
                          component={Link}
                          to={`/chamado/${s.id}`}
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
                    </TableRow>);
              }
            )
          }
        </TableBody>
      </Table>
  );
};

export default TabelaServicos;
