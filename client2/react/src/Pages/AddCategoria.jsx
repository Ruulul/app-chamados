import {useState, useEffect} from "react";
import axios from "../Components/Requisicao";
import {
	Typography,
	Grid,
	Stack,
	InputLabel,
	TextField,
	Card,
	Divider,
	Box,
	Button,
	NativeSelect,
	Popper,
	CircularProgress,
	ClickAwayListener,
	Dialog,
	DialogActions,
} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBan, faEdit } from "@fortawesome/free-solid-svg-icons"


export default function AddCategoria() {
	const [categorias, setCategorias] = useState(undefined)
	const [newCategoria, setCategoria] = useState("")
	const [tipo, setTipo] = useState("")
	const [tipos, setTipos] = useState([])
	
	function getCategorias() {
		axios('get','/api/servicos/categorias/') //+ infos.tipo)
			.then(
				({data: categorias})=>{
					setCategorias(categorias);
					let tipos = [...new Set(categorias.sort().map(categoria=>categoria.tipo))]
					setTipos(tipos)
					setTipo(tipos[0])
				}
			)
			.catch(err=>console.log(err))
	}
	
	useEffect(()=>{
		getCategorias()
	},[])
	
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
		let req = {tipo, newCategoria}
		axios("post", "/api/servicos/novo/subcategoria/", req)
			.then(res=>{
				setCategoria("")
				getCategorias()
			})
			.catch(err=>console.log("Erro adicionando categoria", err))
	}
	return (
	<Grid container justifyContent="center">
		<Grid item margin={3}>
			<Stack spacing={2}>
				{categorias ? <>
				<Box component="form" onSubmit={onSubmit}>
					<Stack component={Card} padding={3} spacing={2} elevation={5} display="grid">
						<NativeSelect name="tipo" value={tipo} onChange={handleChange}>
							{tipos
							?.map((categoria, key)=><option>{categoria}</option>)}
						</NativeSelect>
						<TextField name="categoria" value={newCategoria} label="Categoria" size="small" onChange={handleChange}/>
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
					{categorias
					.sort((a, b)=> a.tipo > b.tipo)
					.map((categoria, key)=><Categoria {...{categoria, tipos, getCategorias, key}} />)
					}
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
	const [tipo, setTipo] = useState(tipos[0])
	
	const deleteCategory = 
		(event)=>{
			axios("post", `/api/servicos/excluir/subcategoria/${categoria.tipo}/${categoria.categoria}`, categoria)
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
		
		let req = {tipo, newCategoria}
		axios("post", `/api/servicos/editar/subcategoria/${categoria.tipo}/${categoria.categoria}`, req)
					.then(({data})=>{
						setTipo(tipos[0])
						getCategorias()
						setOpen(false)
					})
					.catch(console.log)
	}
	
	return (
	<Stack direction="row" spacing={3} display="grid" sx={{gridAutoFlow: "column", placeContent: "end"}} >
		<Typography>
			{`${categoria.tipo}: ${categoria.categoria}`}
		</Typography> 
		<Button size="small" variant="contained" sx={{height: "fit-content", width: "fit-content", padding: 1, minWidth: "fit-content" }}
		onClick={
			()=>{
				setAnchor(anchor => anchor ? anchor : event.target)
				setOpen(o=>!o)
			}
		}>
			<FontAwesomeIcon icon={faEdit}/>
		</Button>
		<Popper {...{open: openEdit, anchorEl: anchorElEdit}} placement="bottom-start">
			<ClickAwayListener onClickAway={()=>setOpen(false)}>
				<Box component="form" mt={1} onSubmit={onSubmit}>
					<Stack component={Card} padding={3} spacing={2} elevation={5} display="grid">
						<NativeSelect name="tipo" value={tipo} onChange={handleChange}>
							{tipos
							?.map((categoria, key)=><option>{categoria}</option>)}
						</NativeSelect>
						<TextField name="categoria" value={newCategoria} label="Categoria" size="small" onChange={handleChange}/>
						<Button 
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
			<Typography align="center" padding={2}> Você tem certeza de deseja deletar o campo <br/><br/>{`${categoria.tipo}: ${categoria.categoria}`}? </Typography>
			<DialogActions>
				<Button variant="contained" color="warning" sx={{height: "fit-content", width: "fit-content", padding: 1}}
				onClick={()=>deleteCategory()}>
					Confirmar
				</Button>
				<Button variant="contained" sx={{height: "fit-content", width: "fit-content", padding: 1}}
				onClick={()=>setOpenD(false)}>
					Cancelar
				</Button>
			</DialogActions>
		</Dialog>
	</Stack> )
}