import { useEffect } from "react";
import WebFont from "webfontloader";

import TheMain from "./Pages/TheMain";

import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { cyan } from "@mui/material/colors";

const theme = createTheme({
  typography: {
    fontFamily: "'Comfortaa', cursive",
    fontSize: 14
  },
  palette: {
    primary: cyan,
    secondary: cyan
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
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: cyan[50]
        }
      }
    }
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
