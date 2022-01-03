import {
  Button,
  Fab,
  ClickAwayListener,
  Popper,
  Box,
  useTheme,
  Typography,
  Stack,
  Fade,
  TextField,
} from "@mui/material";
//import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

//import { Comment as CommentIcon, MarkUnreadChatAlt } from "@mui/icons-material";

const color1 = "#6261a3";
const color2 = "#E0CA8E";

const corAtendente = "#EEE";
const corAtendido = "#666";
const corPendente = "#AAA";

export default function Chat({ chats, createChat, openChat, closeChat, ...props }) {
  const [anchorEl, setAnchor] = useState(undefined);
  const [isOpen, open] = useState(false);
  const [criarChat, criaChat] = useState(false);
  const theme = useTheme();
  function addChat() {
    criaChat(true);
  }
  return (
    <ClickAwayListener onClickAway={() => {open(false); closeChat()}} {...props} sx={{display: "fixed", ...props.sx}}>
      <Box>
        <Popper open={isOpen} anchorEl={anchorEl} placement="top-end" transition>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps}>
              <Box
                sx={{
                  borderRadius: 5,
                  marginY: 2,
                  zIndex: 2,
                  backgroundColor: color2,
                  display: "grid",
                }}
              >
                {!criarChat ? (
                  <Stack justifyContent="space-between">
                    <Box>
                      <Typography
                        sx={{
                          backgroundColor: color1,
                          paddingX: 10,
                          paddingBottom: 1,
                          paddingTop: 2,
                          borderRadius: "20px 20px 0 0",
                          color: "whitesmoke",
                        }}
                      >
                        Chats
                      </Typography>
                    </Box>
                    <Box p={1}>
                      <Stack spacing={3} pb={6}>
                        {props.variant == "mine"
                          ? chats
                            ? chats.atendido.slice(0, 5).map((chat, key) =>
                              Mensagem({
                                theme,
                                chat,
                                posicao: "atendido",
                                key,
                                onClick: () => {
                                  console.log("Clicked!")
                                  openChat(chat.id);
                                },
                              })
                            )
                            : console.log("Chats undefined")
                          : undefined}
                        {props.variant == "mine"
                          ? chats
                            ? chats.atendente.slice(0, 5).map((chat, key) =>
                              Mensagem({
                                theme,
                                chat,
                                posicao: "atendente",
                                key,
                                onClick: () => {
                                  console.log("Clicked!")
                                  openChat(chat.id);
                                },
                              })
                            )
                            : console.log("Chats undefined")
                          : undefined}
                        {props.variant == "pendent"
                          ? chats
                            ? (console.log("Chats pendentes: ", chats),
                              chats.map((chat, key) =>
                                Mensagem({
                                  theme,
                                  chat,
                                  posicao: "pendente",
                                  key,
                                  onClick: () => {
                                    console.log("Clicked!")
                                    openChat(chat.id);
                                  },
                                })
                              ))
                            : console.log("Chats undefined")
                          : undefined}
                        <Typography
                          onClick={addChat}
                          sx={{
                            backgroundColor: color1,
                            width: 35,
                            height: 35,
                            borderRadius: 5,
                            position: "absolute",
                            bottom: 25,
                            right: 20,
                            color: "whitesmoke",
                            display: "grid"
                          }}
                        >
                          <Typography
                            sx={{ margin: "auto" }}>
                            Add
                          </Typography>
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                ) : (
                  <DefineChat
                    {...{
                      createChat,
                      goBack: () => {
                        criaChat(false);
                      },
                    }}
                  />
                )}
              </Box>
            </Fade>
          )}
        </Popper>
        <Fab
          {...props}
          onClick={(event) => {
            console.log(event.target)
            setAnchor((anchor) => (anchor ? anchor : event.target));
            open((o) => !o);
          }}
        >
          {//props.variant == "mine" ? (
            // <CommentIcon />
            //)// : props.variant == "pendent" ? (
            // <MarkUnreadChatAlt />
            //)// : undefined
          }
        </Fab>
      </Box>
    </ClickAwayListener>
  );
}

function Mensagem({ theme, chat, posicao, ...props }) {
  return (
    <Typography
      key={props.key}
      sx={{
        backgroundColor:
          posicao == "atendente"
            ? corAtendente
            : posicao == "atendido"
              ? corAtendido
              : posicao == "pendente"
                ? corPendente
                : theme.palette.warning.dark,
        padding: 1,
        marginX: 2,
        borderRadius: 3,
      }}
      variant="caption"
      {...props}
    >
      <Typography>
        {chat.metadados.find((md) => md.nome == "assunto").valor}
      </Typography>
      {chat.metadados.find((md) => md.nome == "descr").valor}
    </Typography>
  );
}

function DefineChat({ createChat, goBack }) {
  const [{ assunto, descr }, setChat] = useState({ assunto: "", descr: "" });
  const [disabled, disable] = useState(false);
  const onChange = (e) => {
    switch (e.target.name) {
      case "assunto": {
        setChat((chat) => ({ ...chat, assunto: e.target.value }));
        break;
      }
      case "descr": {
        setChat((chat) => ({ ...chat, descr: e.target.value }));
        break;
      }
      default: {
        console.log("Isso não deveria acontecer");
      }
    }
  };
  const onSubmit = (e) => {
    e.preventDefault();
    disable(true);
    createChat({ assunto, descr });
    goBack();
  };
  return (
    <ClickAwayListener onClickAway={goBack}>
      <Stack component="form" sx={{ "& *": { padding: 1 } }} {...{ onSubmit }}>
        <TextField
          required
          name="assunto"
          label="Assunto"
          {...{ onChange }}
          value={assunto}
        />
        <TextField
          required
          name="descr"
          label="Descrição"
          multiline
          minRows={5}
          {...{ onChange }}
          value={descr}
        />
        <Button
          {...{ disabled }}
          sx={{ margin: "auto", backgroundColor: color1 }}
          type="submit"
          variant="contained"
        >
          Enviar
        </Button>
      </Stack>
    </ClickAwayListener>
  );
}
