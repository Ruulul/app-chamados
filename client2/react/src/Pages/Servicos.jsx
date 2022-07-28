import {useState, useEffect} from 'react'//"preact/compat";
import TabelaServicos from "../Components/TabelaServicos";
import {
    Grid, 
    Card, 
    Stack, 
    InputLabel,
    Input,
    NativeSelect,
    Typography
} from "@mui/material";
import axios from "../Components/Requisicao";

export default function servicosStatus() {
    const [filtroStatus, setStatus] = useState("pendente")
    const [filtroTipo, setTipo] = useState("todos")
    const [servicos, setServicos] = useState([])
    const [pageCount, setPages] = useState(0)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(5)
    const [atendentes, setAtendentes] = useState([])
    const [usuarios, setUsuarios] = useState([])

    const query = `?page=${page}&limit=${limit}${filtroTipo != "todos" ? '&filtro=tipo,'+filtroTipo : ''}${filtroStatus != "todos" ? '&filtro=status,'+filtroStatus : ''}`
    console.log(query)
    useEffect(()=>{
      axios('get', '/atendentes')
        .then(res=>setAtendentes(res.data))
    },[])
    useEffect(()=>{
      axios('get', '/usuarios/all')
        .then(res=>setUsuarios(res.data))
    },[])

    useEffect(()=>{
      const getServicos = () => axios('get', '/servicos' + query)
        .then(({data:{page, pages}})=>{
          setServicos(page)
          setPages(pages)
        })
      let handle = setInterval(getServicos, 1000)
      return ()=>clearInterval(handle)
    }, [query])
  
    return (
        <Grid container direction={{ xs: "column", md: "row" }} pt={3}>
            <Grid item xs={12}>
                <Card>
                  <Grid container>
                    <Grid item xs={10} md={2}>
                        <Stack p={2}>
                            <InputLabel htmlFor="tipo">Tipo: </InputLabel>
                            <NativeSelect
                              size="small"
                              sx={{ height: "fit-content" }}
                              name="tipo"
                              onChange={(event)=>{
                                setTipo(event.target.value)
                              }}
                            >
                                <option>todos</option>
                                <option>Infraestrutura</option>
                                <option>Sistemas</option>
                                <option>Desenvolvimento</option>
                            </NativeSelect>
                            <InputLabel htmlFor="filtro">Status: </InputLabel>
                            <NativeSelect
                              size="small"
                              sx={{ height: "fit-content" }}
                              name="filtro"
                              onChange={(event)=>{
                                setStatus(event.target.value)
                              }}
                            >
                                <option name='"pendente"'>pendente</option>
                                <option name='"resolvido"'>resolvido</option>
                                <option name='"fechado"'>fechado</option>
                                <option name='"todos"'>todos</option>
                            </NativeSelect>
                            <InputLabel>
                              Página:
                            </InputLabel>
                            <Input value={page} type='number' onChange={({target:{value}})=>setPage(value)}/>
                            <InputLabel>
                              Itens por página
                            </InputLabel>
                            <Input value={limit} type='number' min={1} max={100} onChange={({target:{value}})=>setLimit(value)}/>
                            <Card
                              sx={{ marginY: 1, padding: 1, placeContent: "center", }}
                              elevation={2}
                            >
                              <Typography variant="body2">
                                Página atual: {page}
                              </Typography>
                            </Card>
                            <Card
                              sx={{ marginY: 1, padding: 1, placeContent: "center", }}
                              elevation={2}
                            >
                              <Typography variant="body2">
                                Páginas: {pageCount}
                              </Typography>
                            </Card>
                        </Stack>
                    </Grid>
                    <Grid item md={10}>
                      <TabelaServicos
                        servicos={servicos}
                        atendentes={atendentes}
                        usuarios={usuarios}
                      />
                    
                    </Grid>
                    </Grid>
                </Card>
            </Grid>
        </Grid>
        );
}