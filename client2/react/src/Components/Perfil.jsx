import { 
    Avatar,
    Button,
    Stack, 
    Card,
    Input, 
    InputLabel, 
    Typography, 
    Dialog, 
    DialogActions, 
    DialogTitle, 
    DialogContent, 
    DialogContentText,
    FormControlLabel, 
    Checkbox, 
    NativeSelect
} from '@mui/material'
import { marked } from 'marked'
import insane from 'insane'
import { useState, useEffect, useRef } from 'react'
import axios from '../Components/Requisicao'
export {
    Icon,
    EditaIcon,
    Infos,
    EditaInfos,
    Dept,
    EditarDept
}

function Icon({icon, ...props}) {
    const [img, setImg] = useState(undefined)

    useEffect(()=>
        axios("get","/files/"+icon)
            .then(({data})=>setImg(data))
            .catch(console.error)
        ,
    [icon])

    return <Avatar {...props} src={img} sx={{width:'30vmin', height: '30vmin'}}/>
}

function EditaIcon({icon, ...props}) {
    const [img, setImg] = useState(undefined)
    const [open, setOpen] = useState(false)

    useEffect(()=>
        axios("get","/files/"+icon)
            .then(({data})=>data==='Não autorizado'?setImg(null):setImg(data))
            .catch(console.error)
        ,
    [icon])

    function handleFile(file) {
        let reader = new FileReader()
        reader.onload = () => setImg(reader.result)
        reader.readAsDataURL(file)
    }

    function atualizaIcone() {
        axios("post", "/perfil/icone/editar", {title: 'ProfileIcon', data: img})
            .then(console.log)
            .catch(console.error)
    }

    return <Stack display="flex">
        <Avatar {...props} src={img} sx={{width:'30vmin', height: '30vmin'}}
        onClick={()=>setOpen(true)}/>
        <Button 
            variant="contained" 
            style={{
                fontSize: "0.5em", 
                width:"fit-content", 
                m: 3
            }} 
            onClick={atualizaIcone}>
            Atualizar ícone
        </Button>
        <Dialog open={open} onClose={()=>setOpen(false)} onPaste={({clipboardData:{files}})=>handleFile(files[0])}>
            <DialogTitle>
                <Typography>
                    Inserir imagem
                </Typography>
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Typography>
                        Faça o upload da sua imagem aqui
                    </Typography>
                    <InputLabel>
                        Preview:
                        {
                            img &&
                            <img src={img}/>
                        }
                    </InputLabel>
                </DialogContentText>
                <DialogActions>
                    <Input type="file" onChange={({target:{files}})=>handleFile(files[0])}/>
                </DialogActions>
            </DialogContent>
        </Dialog>
    </Stack>
}

function Infos({nome, sobrenome, bio, contatos, ...props}) {
    console.log(contatos)
    return <Stack {...props}>
        <InputLabel>
            Nome: {nome}
        </InputLabel>
        <InputLabel>
            Sobrenome: {sobrenome}
        </InputLabel>
        <InputLabel>
            Contatos:<br/>
                {JSON.parse(contatos).map(contato=><InputLabel>{contato.nome}: {contato.valor}</InputLabel>)}
        </InputLabel>
        <InputLabel    
            ref={(node)=>
                node
                    ? node.innerHTML = `Bio: <br>${insane(marked.parse(bio || ''))} <br>`
                    : 'Em branco'}
        />
</Stack>
}

function EditaInfos({
    nome        : nome_original, 
    sobrenome   : sobrenome_original, 
    bio         : bio_original = '', 
    contatos    : contatos_original, 
    ...props}) {
    const [nome, setNome]           = useState(nome_original)
    const [sobrenome, setSobrenome] = useState(sobrenome_original)
    const [bio, setBio]             = useState(bio_original)
    const [contatos, setContatos]   = useState([])
    const tipo_contato_field = useRef()
    const valor_contato_field = useRef()

    useEffect(()=>{
        setNome(nome_original)
        setSobrenome(sobrenome_original)
        setBio(bio_original)
        setContatos(JSON.parse(contatos_original))
    },[nome_original, sobrenome_original, bio_original, contatos_original])

    function addContato() {
        let tipo_contato = tipo_contato_field.current?.value
        let contato = valor_contato_field.current?.value
        let index = contatos.findIndex(contato=>contato.nome===tipo_contato)
        tipo_contato && contato
        ? setContatos(
            contatos=>
                index===-1
                ? [
                    ...contatos,
                    {
                        nome: tipo_contato,
                        valor: contato
                    }
                ]
                : (contatos[index] = {nome: tipo_contato, valor: contato}, [...contatos])
            
        )
        : console.log("Some field ref is not defined yet")
    }

    function atualizaPerfil() {
        let novo_perfil = {nome, sobrenome, bio, contatos:!contatos.length ? undefined : JSON.stringify(contatos)}
        console.log(novo_perfil)
        axios("post", "/perfil/editar", novo_perfil)
            .then(console.log)
            .catch(console.error)
    }

    function handleInput({target}) {
        let {name, value} = target
        switch (name) {
            case "nome":
                setNome(value);
                break;
            case "sobrenome":
                setSobrenome(value);
                break;
            case "bio":
                setBio(value)
                break;
            default:
                alert("Isso não devia aparecer")
        }
    }

    return <Stack {...props}>
        <InputLabel>
            Nome: {nome_original} <br/>
            <Input value={nome} name="nome" onInput={handleInput}/>
        </InputLabel>
        <InputLabel>
            Sobrenome: {sobrenome_original} <br/>
            <Input value={sobrenome} name="sobrenome" onInput={handleInput}/>
        </InputLabel>
        <Card
        display="grid"
        sx={{
            p: 1,
            my: 2
        }}>
            <Typography>
                Contatos: <br/>{JSON.parse(contatos_original).map(contato=><>{contato.nome}: {contato.valor}<br/></>)}
            </Typography>
            <InputLabel>
                Definir para:<br/>
                {contatos.map(contato=><>{contato.nome}: {contato.valor}<br/></>)}
                <InputLabel>
                    Tipo:
                        <NativeSelect inputProps={{ref:tipo_contato_field}}>
                            <option>Whatsapp</option>
                            <option>Email</option>
                            <option>Skype</option>
                        </NativeSelect>
                </InputLabel>
                <InputLabel>
                    Valor:
                        <Input inputProps={{ref: valor_contato_field}}/>
                </InputLabel>
                <Button
                variant="contained"
                size="small"
                sx={{
                    width: "fit-content",
                    px: 2,
                    mt: 3,
                    height: "fit-content",
                }}
                onClick={addContato}>
                    Adicionar
                </Button>
            </InputLabel>
        </Card>
        <InputLabel>
        <InputLabel    
            ref={(node)=>
                node
                    ? node.innerHTML = `<br>Bio: ${insane(marked.parse(bio_original || ''))} <br>`
                    : 'Em branco'}
        />
            <Input multiline name="bio" onInput={handleInput} value={bio}/>
        </InputLabel>
        <Typography>
            Bio pré-visualização:
        </Typography>
        
        <Typography    
            ref={(node)=>
                node
                    ? node.innerHTML = `${insane(marked.parse(bio || ''))} <br>`
                    : 'Em branco'}
        />
        <Button 
            variant="contained"
            sx={{
                width: "fit-content",
                px: 2,
                my: 3,
                height: "fit-content",
            }} 
            onClick={atualizaPerfil}
        >
            Atualiza
        </Button>
</Stack>
}


function Dept({dept, ...props}) {
    console.log(dept)
    return dept
                .map(
                    departamento=>
                        <Typography>
                            {departamento}
                        </Typography>
                )
}

function EditarDept({dept, ...props}) {
    const [departamentos, setDepartamentos] = useState([])
    const [checked, setChecked] = useState({})

    useEffect(()=>
        axios("get", "/departamentos")
            .then(({data})=>setDepartamentos(data))
            .catch(console.error)
        ,
    [])

    function onChange({target:{value, checked}}) {
        setChecked(c=>({...c, [value]: checked}))
    }
    return <Stack {...props}>
        {
            departamentos
                .map(
                    ({id, departamento})=>
                        <FormControlLabel
                        control={
                            <Checkbox
                            value={id}
                            onChange={onChange}
                            checked={
                                checked[id] !== undefined
                                    ? checked[id]
                                    : dept.includes(departamento)
                                        ? true
                                        : false
                            }/>
                        }
                        label={departamento}/>
                )
        }
        <Button
        variant="contained"
        color="action"
        sx={{
            fontSize: "0.8em",
            width: "15em",
            mt: 3
        }}>
            Atualizar departamentos
        </Button>
</Stack>
}