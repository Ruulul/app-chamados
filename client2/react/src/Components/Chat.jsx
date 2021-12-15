import React, { useEffect, useMemo, useReducer, useState } from "react";
import { Launcher } from "popup-chat-react";
import Chat from "./MuiChat";
import req from "./Requisicao";
import { CircularProgress } from "@mui/material";

function reducer(state, action) {
  switch (action.type) {
    case "openChat": {
      state.chatAberto = action.payload;
      state.isOpen = true;
      return state;
    }
    case "closeChat": {
      state.isOpen = false;
      state.chatAberto = null;
      return state;
    }
    case "chatsAtendente": {
      state.chats.atendente = action.payload;
      //let chat = state.chats.atendente.find(chat=>chat.id == state.chatAberto)
      //if (!chat) return state
      //let mensagens = chat.mensagens
      //mensagens = mensagens.map(m=>{let M = JSON.parse(M.mensagem); M.author = m.autorId == state.id ? "me" : "them"; return M})
      //state.messageList = mensagens
      return state;
    }
    case "chatsAtendido": {
      state.chats.atendido = action.payload;
      //let chat = state.chats.atendido.find(chat=>chat.id == state.chatAberto)
      //if (!chat) return state
      //let mensagens = chat.mensagens
      //mensagens = mensagens.map(m=>{let M = JSON.parse(M.mensagem); M.author = m.autorId == state.id ? "me" : "them"; return M})
      //state.messageList = mensagens
      return state;
    }
    case "createChat": {
      req("post", "/api/novo/chat", action.payload).then(({ data: chat }) =>
        console.log(`Criação do chat ${chat} foi um sucesso`)
      );
      return state;
    }
    case "messageSent": {
      console.log(action.payload);
      req("post", `/api/chat/${state.chatAberto}/novo/mensagem`, action.payload)
        .then(({ data: res }) => console.log("Yay!\n" + JSON.stringify(res)))
        .catch((err) => console.log(err));
      return state;
    }
    case "updateChat": {
      let chat = {
        id: 0,
        atendenteId: 1,
        atendidoId: 0,
      };
      let mensagens = [];
      console.log("updating chat in");
      for (let chats of Object.values(state.chats)) {
        let a = chats.find((chat) => chat.id == state.chatAberto);
        a ? console.log(a.mensagens) : undefined;
        chat = a ? a : chat;
        mensagens = a ? a.mensagens : mensagens;
      }
      if (!chat) return state;
      console.log(chat);
      if (!mensagens) return state;
      mensagens = mensagens.map((m) => {
        let M = JSON.parse(m.mensagem);
        M.author = m.autorId == state.perfil.id ? "me" : "them";
        return M;
      });
      state.messageList = mensagens;
      return state;
    }
    case "state": {
      state[action.payload.field] = action.payload.value;
      return state;
    }
    case "perfil": {
      state.perfil = action.payload;
      return state;
    }
    case "chatsPendentes": {
      state.chats.pendente = action.payload;
      return state;
    }
    case "connectChat": {
      console.log("Connecting");
      state.chatAberto = action.payload;
      state.isOpen = true;
      let chat = state.chats.pendente.find((c) => c.id == state.chatAberto);
      if (!chat || !state.perfil) return state;
      chat.atendenteId = state.perfil.id;
      req("post", "/api/update/chat/" + chat.id, chat);
      return state;
    }
  }
  return state;
}

const initialState = {
  chats: {},
  chatAberto: undefined,
  messageList: [],
  newMessagesCount: 0,
  isOpen: false,
  fileUpload: true,
  perfil: undefined,
};

function Demo(props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let getChats = async () => {
      let getPerfil = async () => {
        return req("get", "/api/perfil");
      };
      let { data: perfil } = await getPerfil();
      dispatch({ type: "perfil", payload: perfil });
      let getChats = async () => {
        await req("get", "/api/chats/atendente/" + perfil.id)
          .then(({ data: payload }) => {
            dispatch({ type: "chatsAtendente", payload });
          })
          .catch((err) => console.log(err));
        await req("get", "/api/chats/atendido/" + perfil.id)
          .then(({ data: payload }) => {
            dispatch({ type: "chatsAtendido", payload });
          })
          .catch((err) => console.log(err));
        await req("get", "api/chats/pendentes")
          .then(({ data: payload }) =>
            dispatch({ type: "chatsPendentes", payload })
          )
          .catch((err) => console.log(err));
      };
      getChats().then(() => console.log(state));
    };
    let interval = setInterval(getChats, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let updateChat = () => {
      if (state.isOpen) dispatch({ type: "updateChat" });
    };
    let interval = setInterval(updateChat, 100);
    return () => clearInterval(interval);
  }, []);

  function onMessageWasSent(message) {
    dispatch({ type: "messageSent", payload: message });
  }

  function onClick() {
    dispatch({ type: "closeChat" });
  }

  function openChat(chatId) {
    dispatch({ type: "openChat", payload: chatId });
  }
  function createChat(chat) {
    dispatch({ type: "createChat", payload: chat });
  }
  function connectChat(chatId) {
    dispatch({ type: "connectChat", payload: chatId });
  }

  return state.perfil && Object.entries(state.chats).length > 0 ? (
    <>
      {state.isOpen ? (
        <Launcher
        {...props}
          agentProfile={{
            teamName: "Suporte",
            imageUrl:
              "https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png",
          }}
          onMessageWasSent={onMessageWasSent}
          messageList={state.messageList}
          newMessagesCount={state.newMessagesCount}
          onClick={onClick}
          isOpen
          showEmoji
          style={{
            ...props.sx,
            position: "absolute",
            bottom: 0,
            right: 0,
            margin: 5,
          }}
          placeholder="Escreva sua mensagem aqui"
        />
      ) : (
        <>
          <Chat
            {...props}
            sx={{
              ...props.sx,
              position: "fixed",
              bottom: 0,
              right: 0,
              margin: 5,
            }}
            chats={state.chats}
            openChat={openChat}
            createChat={createChat}
            variant="mine"
          />{
            state.perfil && state.perfil.metadados.find(md=>md.nome=="tipo") && state.perfil.metadados.find(md=>md.nome=="tipo").valor == "suporte" ?
          <Chat
          {...props}
            sx={{
              ...props.sx,
              position: "fixed",
              bottom: 0,
              right: 100,
              margin: 5,
            }}
            chats={state.chats.pendente}
            openChat={connectChat}
            createChat={createChat}
            variant="pendent"
          /> : undefined}
        </>
      )}
    </>
  ) : (
    <CircularProgress
      sx={{
        position: "fixed",
        bottom: 0,
        right: 0,
        margin: 5,
      }}
    />
  );
}

export default Demo;
