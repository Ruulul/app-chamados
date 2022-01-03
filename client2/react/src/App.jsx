import {Outlet} from "react-router-dom";
import Main from "./Pages/Main";

function App() {
  return (
          <Main>
            <Outlet/>
          </Main>
  )
}

export default App
