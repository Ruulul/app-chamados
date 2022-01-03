import React, {useEffect} from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import {
  BrowserRouter,
  Routes,
  Route} from 'react-router-dom';
  
import WebFont from "webfontloader";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";

import Home from './Pages/Home';
import Servicos from "./Pages/Servicos";
import Requisicao from "./Pages/Requisicao";
import Indicadores from "./Pages/Indicadores";
import Chamado from "./Pages/Chamado";
import Registro from "./Pages/Registro";
import Login from "./Pages/Login";
import Avisos from "./Pages/Avisos";
import MudarSenha from "./Pages/MudarSenha";
import EditarChamado from "./Pages/EditarChamado";
import Relatorios from "./Pages/Relatorios";
import AddCategoria from "./Pages/AddCategoria";

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

function Router() {
	useEffect(()=>{
		WebFont.load({
		google: {
			families: [ 'Road Rage', 'Comfortaa', 'Major Mono Display', 'Montserrat']
		},
		})
		console.log('teste')
	})
	return (
	<ThemeProvider {...{theme}}>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/mudarsenha" element={<MudarSenha />} />
        <Route path="/" element={<App />} >
          <Route index element={<Home />} />
          <Route path="/registro" element={<Registro />} />
		  <Route path="/addCategoria" element={<AddCategoria />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/avisos" element={<Avisos />} />
          <Route path="/nova_requisicao" element={<Requisicao />} />
          <Route path="/indicadores" element={<Indicadores />} />
          <Route path="/relatorios" element={<Relatorios/>} />
          <Route path="/chamado/:id" element={<Chamado />} />
          <Route path="/chamado/:id/editar" element={<EditarChamado />} />
          <Route path="*" element={
            <main>
              Erro 404, página não encontrada
            </main>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
	</ThemeProvider>
	)
}

ReactDOM.render(
  <React.StrictMode>
	<Router/>
  </React.StrictMode>,
  document.getElementById('root')
)
