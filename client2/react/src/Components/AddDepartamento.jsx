import {useState, useEffect, useMemo} from "react";
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

	Accordion,
	AccordionSummary,
	AccordionDetails
} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBan, faEdit } from "@fortawesome/free-solid-svg-icons"


export default function AddDepartamento() {
	const [departamentos, setDepartamentos] = useState(undefined)
	const [newDepartamento, setDepartamento] = useState("")

	function getDepartamentos() {
		axios('get','/departamentos/')
			.then(
				({data})=>{
					setDepartamentos(data);
				}
			)
			.catch(err=>console.log(err))
	}

	useEffect(()=>{
		let interval = setInterval(getDepartamentos, 2500)
		return ()=>clearInterval(interval)
	},[])
	
	function handleChange(event) {
		setDepartamento(event.target.value)
	} 
	
	function onSubmit(event) {
		event.preventDefault()
		let req = {newDepartamento}
		axios("post", "/departamentos/novo", req)
			.then(res=>{
				setDepartamento("")
				getDepartamentos()
			})
			.catch(err=>console.log("Erro adicionando departamento", err))
	}

	let departamentos_list = useMemo(()=>departamentos ? 
		<Accordion>
			<AccordionSummary>
				<Typography>
					Departamentos: {departamentos.length}
				</Typography>
			</AccordionSummary>
			<AccordionDetails>
				{
					departamentos.map(
						(departamento, key)=><Departamento {...{departamento, getDepartamentos, key}}/>
					)
				}
			</AccordionDetails>
		</Accordion>
	 : <Typography>Carregando...</Typography>
	, [departamentos])

	return (
	<Grid container justifyContent="center">
		<Grid item margin={3}>
			<Stack spacing={2}>
				{departamentos ? <>
				<Box component="form" onSubmit={onSubmit}>
					<Stack component={Card} padding={3} spacing={2} elevation={5} display="grid">
						<TextField name="Departamento" value={newDepartamento} label="Departamento" size="small" onChange={handleChange} required/>
						<Button 
						type="submit" 
						variant="contained" 
						sx={{
							placeSelf:"center", 
							fontSize: 12, 
							paddingX: 7,
							paddingY: 2.5
						}}>
							Adicionar Departamento
						</Button>
					</Stack>
				</Box>
				<Stack component={Card} padding={3} spacing={2} elevation={5}>
					{departamentos_list}
				</Stack> 
				</>: <CircularProgress sx={{ display: "grid", margin: "auto", align:"center", marginTop: "30vh", transform: "scale(3)" }} />}
			</Stack>
		</Grid>			
	</Grid>
	)
}

function Departamento({departamento, getDepartamentos}) {
	const [openEdit, setOpen] = useState(false)
	const [anchorElEdit, setAnchor] = useState(undefined)
	const [openDelete, setOpenD] = useState(false)
	const [newDepartamento, setDepartamento] = useState(departamento.departamento)
	
	const deleteDep = 
		(event)=>{
			axios("post", `/departamentos/excluir/${departamento.id}`, departamento)
				.then(()=>{
					console.log("Sucesso!")
					setOpenD(false)
					getDepartamentos()
				})
				.catch(console.log)
		}
	
	function handleChange(event) {
		setDepartamento(event.target.value)
	} 
	
	function onSubmit(event) {
		event.preventDefault()
		
		let req = {newDepartamento, id: departamento.id}
		axios("post", `/departamentos/editar/${departamento.id}`, req)
			.then(({data})=>{
				getDepartamentos()
				setOpen(false)
			})
			.catch(console.log)
	}

	return (
	<Stack direction="row" spacing={3} pb={3} display="grid" sx={{gridAutoFlow: "column", placeContent: "end"}} >
		<Typography>
			{`${departamento.departamento}`}
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
						<TextField key={2} name="Departamento" value={newDepartamento} label="Departamento" size="small" onChange={handleChange} required/>
						<Button  key={3}
						type="submit" 
						variant="contained" 
						sx={{
							placeSelf:"center", 
							fontSize: 12, 
							paddingX: 7,
							paddingY: 2.5
						}}>
							Editar Departamento
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
			<Typography key={1} align="center" padding={2}> Você tem certeza de deseja deletar o campo <br/><br/>{`${departamento.departamento}`}? </Typography>
			<DialogActions key={2}>
				<Button key={1} variant="contained" color="warning" sx={{height: "fit-content", width: "fit-content", padding: 1}}
				onClick={()=>deleteDep()}>
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