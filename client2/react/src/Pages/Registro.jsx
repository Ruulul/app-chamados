import { Button, Grid, TextField, FormLabel, Stack, NativeSelect, Checkbox, FormControlLabel } from "@mui/material";
import axios from "../Components/Requisicao";
import { useState, useEffect } from 'react'//"preact/compat";
import { useNavigate } from "react-router-dom";

export default function Registro() {
    const [nome, setNome] = useState(null)
    const [sobrenome, setSobrenome] = useState(null)
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [filial, setFilial] = useState("")
    const [filiais, setFiliais] = useState([{nome: "Carregando..."}])
    const [permissoes, setPermissoes] = useState({})
    const [filiais_acesso, setFiliaisAcesso] = useState([])
    const [departamentos, setDepartamentos] = useState([])
    const [dept, setDepartamento] = useState("")
    const redirect = useNavigate()
    function onChangeNome({target}) {
        setNome(target.value)
    }
    function onChangeDepartamento({target}) {
        setDepartamento(target.value)
    }
    function onChangeSobrenome({target}) {
        setSobrenome(target.value)
    }
    function onChangeEmail({target}) {
        setEmail(target.value)
    }
    function onChangeSenha({target}) {
        setSenha(target.value)
    }
    function onChangeFiliais({target}) {
        console.log(JSON.parse(target.name).id, target.checked)
        setFiliaisAcesso(permissoes=>{
            permissoes[JSON.parse(target.name).id]=target.checked
            console.log(permissoes)
            return permissoes
        })
    }
    function onChangeFilial({target}) {
        setFilial(filiais.find(f=>f.nome==target.value).id)
    }
    function onChangePermissoes({target}) {
        console.log(target.name, target.checked)
        setPermissoes(permissoes=>{
            permissoes[target.name]=target.checked
            console.log(permissoes)
            return permissoes
        })
    }
    async function onSubmit(event) {
        event.preventDefault();
        const cadastro = {
            nome, 
            sobrenome, 
            email, 
            senha, 
            dept,
            permissoes:
                Object
                .entries(permissoes)
                .filter(per=>per[1])
                .map(per=>per[0])
            , 
            acessa_filial: 
                Object
                .entries(filiais_acesso)
                .filter(filial=>filial[1])
                .map(filial=>filial[0])
            };
        await axios("post","/novo/usuario", cadastro)
            .then(({data})=>{
                if (data === "Não autorizado"){
                    redirect("/")
                    return
                }
                console.log("Cadastrado com sucesso")
            })
            .catch(console.error)
        redirect("/")
    }
    useEffect(()=>{
      axios("get", '/perfil')
        .then(({data})=>{
            if (data === "Não autorizado")
                redirect("/")
        })
        .catch(console.log)
    },[])
    useEffect(
        ()=>
            axios("get", '/all')
            .then(({data : filiais})=>{
                setFiliais(filiais)
                setFiliaisAcesso(
                    Object.fromEntries(
                        filiais.map(({id})=>[id, false])
                    )
                )
            })
            .catch(e=>console.error(e))
        ,
    [])
    useEffect(
        ()=>{
            let getDepartamentos = 
                ()=>axios("get", "/departamentos")
                    .then(
                        ({data})=>{
                            setDepartamentos(data)
                        }
                    )
                    .catch(e=>console.log(e))
            let handle = setInterval(getDepartamentos, 500)
            return ()=>clearInterval(handle)
        }
        ,
    [])
    return (
        <Grid item container component="form" direction="column" xs={10} md={6} lg={4} onSubmit={onSubmit} padding={5}>
            <Stack spacing={3}>
                <TextField key={1} required label="Nome" name="nome" onChange={onChangeNome} />
                <TextField key={2} label="Sobrenome" name="sobrenomenome" onChange={onChangeSobrenome} />
                <FormLabel key={3}>Filial de Cadastro</FormLabel>
                <NativeSelect key={4} label="Filial de Cadastro" onChange={onChangeFilial}>
                    {filiais.map((filial, key)=><option key={key} name={JSON.stringify(filial)}>{filial.nome}</option>)}
                </NativeSelect> 
                <FormLabel key={5}>Departamento</FormLabel>
                <NativeSelect key={6} label="Departamento" onChange={onChangeDepartamento}>
                    {departamentos.map(
                        (departamento, key)=>
                            <option key={key} name={departamento.departamento}>{departamento.departamento}</option>
                    )}
                </NativeSelect>
                
                <TextField key={7} label="email" name="email" type="email" onChange={onChangeEmail} required/>
                <TextField key={8} label="senha" name="senha" type="password"onChange={onChangeSenha} required/>
                <FormLabel key={9}>Acesso a filiais</FormLabel>
                {filiais.map((filial, key)=><FormControlLabel key={1+key} control={<Checkbox name={JSON.stringify(filial)} onChange={onChangeFiliais}/>} label={filial.nome}/>)}
                <FormLabel key={10}>Permissões</FormLabel>
                <FormControlLabel key={11} control={<Checkbox name="suporte" onChange={onChangePermissoes}/>} label="Suporte"/>
                <FormControlLabel key={12} control={<Checkbox name="admin" onChange={onChangePermissoes}/>} label="Admin"/>
                <Button key={13} type="submit" variant="contained" sx={{p:3,m:3}}>
                    Enviar
                </Button>
            </Stack>
        </Grid>
    );
}