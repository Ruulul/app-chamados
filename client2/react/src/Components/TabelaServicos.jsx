
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons";

import {
  Button,
  Table,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
  Tooltip,
  Typography
} from "@mui/material";

import { Link } from "react-router-dom";

import Valida_Suporte from "./Valida_Suporte";

const TabelaServicos = (props) => {
  return (
      <Table sx={{
        overflow:"scroll"
      }}>
        <TableHead>
          <TableRow >
            <TableCell>Ver chamado</TableCell>
            <TableCell>ID - Assunto</TableCell>
            <TableCell>Atendente</TableCell>
            {props.usuarios?.length > 1 ? <TableCell>Usuário</TableCell> : undefined}
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {typeof(props.servicos) === "object" ? props.servicos.sort((a, b)=>b.id-a.id).map((servico) => {
            return <Linha {...{servico, 
              atendente: props.atendentes.find(atendente=>atendente.id==servico.atendenteId)?.nome || "Em análise",
              usuario: props.usuarios?.find(usuario=>usuario.id==servico.usuarioId)?.nome || "Nome não encontrado",
              isMultiplosUsuarios: props.usuarios?.length > 1}} />
              }
            ) : props.servicos
          }
        </TableBody>
      </Table>
  );
};

export default TabelaServicos;

function Linha({servico, atendente, usuario, isMultiplosUsuarios}) {
  let s = servico
  let converte_iso = (date) => 
    date && date !== "undefined"
      ? { data: date.split('T')[0].split('-').reverse().join('/')
        , hora: date.split('T')[1].split('.')[0]}
      : undefined
  let created = converte_iso(s.createdAt)
  let closed = converte_iso(s.resolvido_em)

  
 return (
  <Tooltip
  disableInteractive
  arrow 
  placement="bottom-start"
  title={
    <>
    <Typography variant="h5">
      Mais informações
    </Typography>
    <Typography variant="caption">
      Id: {s.id}<br/>
      Urgência: {(["Baixa", "Média", "Alta", "Urgente"])[s.prioridade - 1]}<br/>
      Departamento: {s.departamento}<br/>
      Tipo: {s.tipo}<br/>
      Categoria: {s?.subCategoria || "Não definido"}<br/>
      Abertura: {
      created 
        ? created.data+" às "+created.hora 
        : undefined
      }<br/>
      Fechamento: {
      closed 
        ? closed.data +" às "+ closed.hora 
        : undefined
      }<br/>
    </Typography>
    </>
  }
  >
  <TableRow key={s.id}>
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
    <TableCell>{s.id} - {s.assunto}</TableCell>
    <TableCell>{atendente}</TableCell>
    {isMultiplosUsuarios ? <TableCell>{usuario}</TableCell> : undefined}
    <TableCell>{s.status}</TableCell>
  </TableRow>
  </Tooltip>
  );
}