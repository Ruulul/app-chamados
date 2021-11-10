import { Card, Typography } from "@mui/material";

const Mensagem = (props) => {
  return (
    <Card>
      <Typography variant="h5" m={2}>
        {props.autor ? props.autor : "Teste"}
      </Typography>
      <Typography m={2}>{props.mensagem} </Typography>
    </Card>
  );
};

export default Mensagem;
