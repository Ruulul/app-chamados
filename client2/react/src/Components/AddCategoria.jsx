import {useState, useEffect, useMemo} from 'react'//"preact/compat";
import axios from "../Components/Requisicao";
import Typography
from "@mui/material/Typography"
import Grid 
from "@mui/material/Grid"
import Stack
from "@mui/material/Stack"
import TextField
from "@mui/material/TextField"
import Card
from "@mui/material/Card"
import Divider
from "@mui/material/Divider"
import Box
from "@mui/material/Box"
import Button
from "@mui/material/Button"
import NativeSelect
from "@mui/material/NativeSelect"
import Popper
from "@mui/material/Popper"
import CircularProgress
from "@mui/material/CircularProgress"
import Dialog
from "@mui/material/Dialog"
import DialogActions
from "@mui/material/DialogActions"
import Accordion
from "@mui/material/Accordion"
import AccordionSummary
from "@mui/material/AccordionSummary"
import AccordionDetails
from "@mui/material/AccordionDetails"
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBan, faEdit } from "@fortawesome/free-solid-svg-icons"

export default function AddCategoria() {
	const [categorias, setCategorias] = useState(undefined)
	const [newCategoria, setCategoria] = useState("")
	const [tipo, setTipo] = useState("")
	const [tipos, setTipos] = useState([])

	function getTipos() {
		axios('get', '/tipos')
			.then(
				({data})=>{
					if (tipos.length == 0) {
						setTipos(data)
						setTipo(data[1].tipo)
					}
					else setTipos(data)
				}
			)
			.catch(err=>console.log(err))
	}
	
	function getCategorias() {
		getTipos()
		axios('get','/servicos/categorias/') //+ infos.tipo)
			.then(
				({data})=>{
					setCategorias(data);
				}
			)
			.catch(err=>console.log(err))
	}

	useEffect(getCategorias, [])
	
	useEffect(()=>{
		let interval = setInterval(getCategorias, 2500)
		return ()=>clearInterval(interval)
	},[tipos])
	
	function handleChange(event) {
		switch(event.target.name) {
			case "categoria":
				setCategoria(event.target.value)
				break
			case "tipo":
				setTipo(event.target.value)
				break
		}
	} 
	
	function onSubmit(event) {
		event.preventDefault()
		console.log(tipo)
		let req = {tipo: tipo, newCategoria}
		console.log(req)
		axios("post", "/servicos/novo/subcategoria/", req)
			.then(res=>{
				setCategoria("")
				getCategorias()
			})
			.catch(err=>console.log("Erro adicionando categoria", err))
	}

	let categorias_list = useMemo(()=>categorias && tipos ? 
	tipos.sort().map((tipo, key)=>
	<Accordion {...{key}}>
		<AccordionSummary style={{textAlign: 'right'}}>
			<Typography>{tipo.tipo}: {categorias.filter(a=>a.tipo==tipo.tipo).length}</Typography>
		</AccordionSummary>
		<AccordionDetails>{
		categorias
			.sort((a, b)=> a.id > b.id)
			.filter(a=>a.tipo==tipo.tipo)
			.map((categoria, key)=><Categoria {...{categoria, tipos, getCategorias, key, style:{padding: 5}}} />)
	}</AccordionDetails>
		</Accordion>) : <Typography>Carregando...</Typography>
	, [categorias, tipos])

	return (
	<Grid container justifyContent="center">
		<Grid item margin={3}>
			<Stack spacing={2}>
				{categorias ? <>
				<Box component="form" onSubmit={onSubmit}>
					<Stack component={Card} padding={3} spacing={2} elevation={5} display="grid">
						<NativeSelect name="tipo" value={tipo} onChange={handleChange}>
							{tipos
							?.map((tipo, key)=><option {...{key}}>{tipo.tipo}</option>)}
						</NativeSelect>
						<TextField name="categoria" value={newCategoria} label="Categoria" size="small" onChange={handleChange} required/>
						<Button 
						type="submit" 
						variant="contained" 
						sx={{
							placeSelf:"center", 
							fontSize: 12, 
							paddingX: 7,
							paddingY: 2.5
						}}>
							Adicionar Categoria
						</Button>
					</Stack>
				</Box>
				<Stack component={Card} padding={3} spacing={2} elevation={5}>
					<Typography>
						Categorias:
					</Typography>
						<Divider/>
					{categorias_list}
				</Stack> 
				</>: <CircularProgress sx={{ display: "grid", margin: "auto", align:"center", marginTop: "30vh", transform: "scale(3)" }} />}
			</Stack>
		</Grid>			
	</Grid>
	)
}

function Categoria({categoria, getCategorias, tipos}) {
	const [openEdit, setOpen] = useState(false)
	const [anchorElEdit, setAnchor] = useState(undefined)
	const [openDelete, setOpenD] = useState(false)
	const [newCategoria, setCategoria] = useState(categoria.categoria)
	const [tipo, setTipo] = useState(categoria.tipo)
	
	const deleteCategory = 
		(event)=>{
			axios("post", `/servicos/excluir/subcategoria/${categoria.tipo}/${categoria.categoria}`, categoria)
				.then(()=>{
					console.log("Sucesso!")
					setOpenD(false)
					getCategorias()
				})
				.catch(console.log)
		}
	
	function handleChange(event) {
		switch(event.target.name) {
			case "categoria":
				setCategoria(event.target.value)
				break
			case "tipo":
				setTipo(event.target.value)
				break
		}
	} 
	
	function onSubmit(event) {
		event.preventDefault()
		console.log(tipo)
		let req = {tipo: tipo.tipo, newCategoria, id: categoria.id}
		console.log(req)
		axios("post", `/servicos/editar/subcategoria/${categoria.tipo}/${categoria.categoria}`, req)
					.then(({data})=>{
						setTipo(tipos[0].tipo)
						getCategorias()
						setOpen(false)
					})
					.catch(console.log)
	}

	return (
	<Stack direction="row" spacing={3} pb={3} display="grid" sx={{gridAutoFlow: "column", placeContent: "end"}} >
		<Typography>
			{`${categoria.tipo}: ${categoria.categoria}`}
		</Typography> 
		<Button size="small" variant="contained" sx={{height: "fit-content", width: "fit-content", padding: 1, minWidth: "fit-content" }}
		onClick={
			(e)=>{
				setAnchor(e.target)
				setOpen(o=>!o)
			}
		}>
			<FontAwesomeIcon icon={faEdit}/>
		</Button>
		<Popper {...{open: openEdit, anchorEl: anchorElEdit}} placement="bottom-start">
			<ClickAwayListener onClickAway={()=>{setOpen(false); setAnchor(null)}}>
				<Box component="form" mt={1} onSubmit={onSubmit}>
					<Stack component={Card} padding={3} spacing={2} elevation={5} display="grid">
						<NativeSelect key={1} name="tipo" value={tipo} onChange={handleChange}>
							{tipos
							?.map((tipo, key)=><option {...{key}}>{tipo.tipo}</option>)}
						</NativeSelect>
						<TextField key={2} name="categoria" value={newCategoria} label="Categoria" size="small" onChange={handleChange} required/>
						<Button  key={3}
						type="submit" 
						variant="contained" 
						sx={{
							placeSelf:"center", 
							fontSize: 12, 
							paddingX: 7,
							paddingY: 2.5
						}}>
							Editar Categoria
						</Button>
					</Stack>
				</Box>
			</ClickAwayListener>
		</Popper>
		<Button variant="contained" sx={{height: "fit-content", width: "fit-content", padding: 1, minWidth: "fit-content" }}
		onClick={()=>setOpenD(o=>!o)
		}>
			<FontAwesomeIcon icon={faBan}/>
		</Button>
		<Divider/>
		<Dialog open={openDelete} onClose={()=>setOpenD(false)}>
			<Typography key={1} align="center" padding={2}> Você tem certeza de deseja deletar o campo <br/><br/>{`${categoria.tipo}: ${categoria.categoria}`}? </Typography>
			<DialogActions key={2}>
				<Button key={1} variant="contained" color="warning" sx={{height: "fit-content", width: "fit-content", padding: 1}}
				onClick={()=>deleteCategory()}>
					Confirmar
				</Button>
				<Button key={2} variant="contained" sx={{height: "fit-content", width: "fit-content", padding: 1}}
				onClick={()=>setOpenD(false)}>
					Cancelar
				</Button>
			</DialogActions>
		</Dialog>
	</Stack> )
}