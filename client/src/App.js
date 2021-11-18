import { useState, useEffect } from "react";
import WebFont from "webfontloader";


import TheMain from "./Pages/TheMain";

import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "'Comfortaa', cursive",
    fontSize: 12
  },
  palette: {
    primary: {main: '#1976d2'},
    secondary: {main: '#27BAE8'}
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {}
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          width: "3em",
          height: "3em",
          fontSize: "1em",
          marginBottom: "0.5em"
        }
      }
    },
  }
});


export default function App() {
  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Comfortaa"]
      }
    });
  });
  return (
    <ThemeProvider theme={theme}>
      <TheMain />
    </ThemeProvider>
  );
}