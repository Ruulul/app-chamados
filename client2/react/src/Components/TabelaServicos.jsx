
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

import Valida_Suporte from "./Valida_Suporte";

const TabelaServicos = (props) => {
  return (
      <Table>
        <TableHead>
          <TableRow >
            <TableCell align="right" colSpan={2}>ID</TableCell>
            <TableCell align="right">Urgência</TableCell>
            <TableCell align="right">Atendente</TableCell>
            <TableCell align="right">Usuário</TableCell>
            <TableCell align="right">Assunto</TableCell>
            <TableCell align="right">Departamento</TableCell>
            <TableCell align="right">Categoria</TableCell>
            <TableCell align="right">Sub-Categoria</TableCell>
            <TableCell align="right">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {typeof(props.servicos) === "object" ? props.servicos.sort((a, b)=>b.id-a.id).map((s) => {
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
                      <TableCell align="right">{s.id}</TableCell>
                      <TableCell align="right">{(["Baixa", "Média", "Alta", "Urgente"])[s.prioridade - 1]}</TableCell>
                      <TableCell align="right">{
                        props.atendentes.find(atendente=>atendente.id==s.atendenteId)?.nome || "Nome não encontrado"
                      }</TableCell>
                        <TableCell align="right">{
                        props.usuarios?.find(usuario=>usuario.id==s.usuarioId)?.nome || "Nome não encontrado"
                        }</TableCell>
                      <TableCell align="right">{s.assunto}</TableCell>
                      <TableCell align="right">{s.departamento}</TableCell>
                      <TableCell align="right">{s.tipo}</TableCell>
                      <TableCell align="right">{s?.subCategoria || "Não definido"}</TableCell>
                      <TableCell align="right">{s.status}</TableCell>
                    </TableRow>);
              }
            ) : props.servicos
          }
        </TableBody>
      </Table>
  );
};

export default TabelaServicos;
