import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import {
  BrowserRouter,
  Routes,
  Route} from 'react-router-dom';
import Home from './Pages/Home';
import Servicos from "./Pages/Servicos";
import Requisicao from "./Pages/Requisicao";
import Indicadores from "./Pages/Indicadores";
import Chamado from "./Pages/Chamado";
import Registro from "./Pages/Registro";
import Login from "./Pages/Login";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} >
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/nova_requisicao" element={<Requisicao />} />
          <Route path="/indicadores" element={<Indicadores />} />
          <Route path="/chamado/:id" element={<Chamado />} />
          <Route path="*" element={
            <main>
              Erro 404, página não encontrada
            </main>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
