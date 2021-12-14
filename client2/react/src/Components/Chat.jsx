import React, { useState } from "react";
import { Launcher } from "popup-chat-react";
import { Modal, Typography } from "@mui/material";

function Demo() {
  const [state, setState] = useState({
    messageList: [],
    newMessagesCount: 0,
    isOpen: false,
    fileUpload: true,
  });

  const [chats, setChats] = useState([]);
  const [mensagens, setMensagens] = useState([]);

  const [chatAberto, setChat] = useState(1);

  function onMessageWasSent(message) {
    setState((state) => ({
      ...state,
      messageList: [...state.messageList, message],
    }));
    sendMessage("Lorem Ipsum" + ".!?"[Math.floor(Math.random() * 3)]);
  }

  function onFilesSelected(fileList) {
    const objectURL = window.URL.createObjectURL(fileList[0]);

    setState((state) => ({
      ...state,
      messageList: [
        ...state.messageList,
        {
          type: "file",
          author: "me",
          data: {
            url: objectURL,
            fileName: fileList[0].name,
          },
        },
      ],
    }));
  }

  function sendMessage(text) {
    if (text.length > 0) {
      const newMessagesCount = state.isOpen
        ? state.newMessagesCount
        : state.newMessagesCount + 1;

      setState((state) => ({
        ...state,
        newMessagesCount: newMessagesCount,
        messageList: [
          ...state.messageList,
          {
            author: "them",
            type: "text",
            data: { text },
          },
        ],
      }));
    }
  }

  function onClick() {
    setState((state) => ({
      ...state,
      isOpen: !state.isOpen,
      newMessagesCount: 0,
    }));
  }

  return (
    <>
      {chatAberto ? (
        <Launcher
          agentProfile={{
            teamName: "Suporte",
            imageUrl:
              "https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png",
          }}
          onMessageWasSent={onMessageWasSent}
          onFilesSelected={onFilesSelected}
          messageList={state.messageList}
          newMessagesCount={state.newMessagesCount}
          onClick={onClick}
          isOpen={state.isOpen}
          showEmoji
          fileUpload={state.fileUpload}
          style={{ backgroundColor: "red" }}
          placeholder="Escreva sua mensagem aqui"
        />
      ) : (
        <Modal open>
          <Typography sx={{
            margin: "auto", width: "100%"
          }}>Aaaa</Typography>
        </Modal>
      )}
    </>
  );
}

export default Demo;
