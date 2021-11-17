import {useEffect} from "react";
import {Link, Outlet} from "react-router-dom";
import Main from "./Pages/Main";

import WebFont from "webfontloader";

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
          padding: 0,
          marginBottom: "0.5em"
        }
      }
    },
    Link: {
      styleOverrides: {
        root: {
        }
      }
    }
  }
});

function App() {
  useEffect(()=>{
    WebFont.load({
      google: {
        families: ['Comfortaa']
      }
    })
  },[])
  return (
    <ThemeProvider theme={theme}>
          <Main>
            <Outlet/>
          </Main>
    </ThemeProvider>
  )
}

export default App
