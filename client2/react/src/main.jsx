import React, {useEffect, createElement} from 'react'//'preact/compat'
import ReactDOM from 'react-dom'//'preact/compat'
import App from './App'
import {
  BrowserRouter,
  Routes,
  Route} from 'react-router-dom';
  
import WebFont from "webfontloader";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";

import suspend from './Components/Suspend';
import valida from './Components/Valida';
import { validateLocaleAndSetLanguage } from 'typescript';
const e = createElement
const home = React.lazy(()=>import('./Pages/Home'));
const servicos = React.lazy(()=>import("./Pages/Servicos"));
const requisicao = React.lazy(()=>import("./Pages/Requisicao"));
const indicadores = React.lazy(()=>import("./Pages/Indicadores"));
const chamado = React.lazy(()=>import("./Pages/Chamado"));
const registro = React.lazy(()=>import("./Pages/Registro"));
const login = React.lazy(()=>import("./Pages/Login"));
const avisos = React.lazy(()=>import("./Pages/Avisos"));
const mudarSenha = React.lazy(()=>import("./Pages/MudarSenha"));
const editarChamado = React.lazy(()=>import("./Pages/EditarChamado"));
const relatorios = React.lazy(()=>import("./Pages/Relatorios"));
const config = React.lazy(()=>import("./Pages/Config"));
const calendar = React.lazy(()=>import('./Components/Calendar'));
const painel_usuarios = React.lazy(()=>import('./Pages/PainelUsuarios'));

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
  let Home = ()=>valida(suspend(home))()
  let Login = ()=>suspend(login)()
  let Servicos = ()=>valida(suspend(servicos))()
  let Requisicao = ()=>valida(suspend(requisicao))()
  let Indicadores = ()=>valida(suspend(indicadores))()
  let Chamado = ()=>valida(suspend(chamado))()
  let Registro = ()=>valida(suspend(registro))()
  let Avisos = ()=>valida(suspend(avisos))()
  let MudarSenha = ()=>valida(suspend(mudarSenha))()
  let EditarChamado = ()=>valida(suspend(editarChamado))()
  let Relatorios = ()=>valida(suspend(relatorios))()
  let Config = ()=>valida(suspend(config))()
  let Calendar = ()=>valida(suspend(calendar))()
  let PainelUsuarios = ()=>valida(suspend(painel_usuarios))()
  let EditaPerfil = ()=>valida(suspend(React.lazy(()=>import('./Pages/EditaPerfil'))))()
  let Perfil = ()=>valida(suspend(React.lazy(()=>import('./Pages/Perfil'))))()
  let PerfilDept = ()=>valida(suspend(React.lazy(()=>import('./Pages/PerfilDept'))))()
  let EditaPerfilDept = ()=>valida(suspend(React.lazy(()=>import('./Pages/EditaPerfilDept'))))()
	return (
	<ThemeProvider {...{theme}}>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/mudarsenha" element={<MudarSenha/>} />
        <Route path="/" element={<App/>} >
          <Route index element={<Home/>} />
          <Route path="/Calendar" element={<Calendar/>} />
          <Route path="/registro" element={<Registro/>} />
		      <Route path="/Config" element={<Config/>} />
          <Route path="/servicos" element={<Servicos/>} />
          <Route path="/avisos" element={<Avisos/>} />
          <Route path="/nova_requisicao" element={<Requisicao/>} />
          <Route path="/indicadores" element={<Indicadores/>} />
          <Route path="/relatorios" element={<Relatorios/>} />
          <Route path="/usuarios" element={<PainelUsuarios/>} />
          <Route path="/usuario/:id/editar" element={<EditaPerfilDept/>}/>
          <Route path="/perfil/editar" element={<EditaPerfil/>}/>
          <Route path="/perfil" element={<Perfil/>}/>
          <Route path="/usuario/:id/" element={<PerfilDept/>}/>
          <Route path="/chamado/:id" element={<Chamado/>} />
          <Route path="/servico/:id" element={<Chamado/>} />
          <Route path="/chamado/:id/editar" element={<EditarChamado/>} />
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
