
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
            <TableCell>Urgência</TableCell>
            <TableCell>Assunto</TableCell>
            <TableCell>Departamento</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {typeof(props.servicos) === "object" ? props.servicos.map((s) => {
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
                      <TableCell>{(["Baixa", "Média", "Alta", "Urgente"])[s.prioridade - 1]}</TableCell>
                      <TableCell>{s.assunto}</TableCell>
                      <TableCell>{s.departamento}</TableCell>
                      <TableCell>{s.status}</TableCell>
                    </TableRow>);
              }
            ) : props.servicos
          }
        </TableBody>
      </Table>
  );
};

export default TabelaServicos;
