import React, {useEffect, Suspense} from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import {
  BrowserRouter,
  Routes,
  Route} from 'react-router-dom';
  
import WebFont from "webfontloader";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";

import suspend from './Components/Suspend';
const Home = React.lazy(()=>import('./Pages/Home'));
const Servicos = React.lazy(()=>import("./Pages/Servicos"));
const Requisicao = React.lazy(()=>import("./Pages/Requisicao"));
const Indicadores = React.lazy(()=>import("./Pages/Indicadores"));
const Chamado = React.lazy(()=>import("./Pages/Chamado"));
const Registro = React.lazy(()=>import("./Pages/Registro"));
const Login = React.lazy(()=>import("./Pages/Login"));
const Avisos = React.lazy(()=>import("./Pages/Avisos"));
const MudarSenha = React.lazy(()=>import("./Pages/MudarSenha"));
const EditarChamado = React.lazy(()=>import("./Pages/EditarChamado"));
const Relatorios = React.lazy(()=>import("./Pages/Relatorios"));
const AddCategoria = React.lazy(()=>import("./Pages/AddCategoria"));

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
        <Route path="/login" element={suspend(Login)} />
        <Route path="/mudarsenha" element={suspend(MudarSenha)} />
        <Route path="/" element={suspend(App)} >
          <Route index element={suspend(Home)} />
          <Route path="/registro" element={suspend(Registro)} />
		  <Route path="/addCategoria" element={suspend(AddCategoria)} />
          <Route path="/servicos" element={suspend(Servicos)} />
          <Route path="/avisos" element={suspend(Avisos)} />
          <Route path="/nova_requisicao" element={suspend(Requisicao)} />
          <Route path="/indicadores" element={suspend(Indicadores)} />
          <Route path="/relatorios" element={suspend(Relatorios)} />
          <Route path="/chamado/:id" element={suspend(Chamado)} />
          <Route path="/chamado/:id/editar" element={suspend(EditarChamado)} />
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
