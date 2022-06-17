import { 
	Typography, 
	Alert, 
	Button, 
	Grid, 
	TextField, 
	Stack, 
	CircularProgress, 
	Fade, 
	Box,
	CardMedia	
	} from "@mui/material";
import axios from "../Components/Requisicao";
import { useMemo, useState } from 'react'//"preact/compat";
import { useLocation, useNavigate } from "react-router-dom";

const burl = "https://10.0.0.5:5000"

export default function Login() {
    const [enviando, setEnviando] = useState(false)
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [error, setError] = useState(undefined)
    const {search} = useLocation()
    const query = useMemo(()=>new URLSearchParams(search), [search])
    const [primeiroAcesso, setPrimeiroAcesso] = useState(query.get("primeiroAcesso")=='true')
    const redirect = useNavigate()
    function onChangeEmail({target}) {
        setEmail(target.value)
    }
    function onChangeSenha({target}) {
        setSenha(target.value)
    }
    async function onSubmit(event) {
        event.preventDefault();
        let signal_controller = new AbortController()
        let signal = signal_controller.signal
        const login = {email, senha}
        let handleEnvio = ({data})=>{
          setError(data.error)
          signal_controller.abort()
          if(!data.error) return redirect("/")
          setEnviando(false)
        }
        setEnviando(true)
        try{
          !primeiroAcesso 
            ? await axios("post","/login", login, {signal})
              .then(handleEnvio)
            : await axios("post", "/alterasenha", login, {signal})
              .then(handleEnvio)
        } catch (e) {
          console.error(e)
          setEnviando(false)
        }
    }
    return (
    <Stack>
      <Grid container direction={{xs: "column", md: "row"}} width="100%">
        <Grid item component="form" onSubmit={onSubmit} xs={12} md={10} lg={4} minHeight={{xs:1/2, md: 1}} >
          <Stack spacing={3} mr={15} mb={5} ml={5} sx={{placeContent: "center"}}>
              <Typography variant="h2" component="h1" mt={5} sx={{placeSelf: "center", fontWeigth: 100}} fontFamily="Montserrat, sans-serif">Gold Seed</Typography>
				<Stack direction="row" justifyContent="space-evenly" sx={{"& CardMedia":{margin: "auto"}}}>
					<CardMedia image={burl+'/images/logo_ouro_branco.png'} 
					sx={{height: 150, width: 150}}/>
					<CardMedia image={burl+'/images/logo_sementes_mana.png'} 
					sx={{height: 150, width: 150}}/>
				</Stack>
        
            <Typography variant="h5" component="h2" mt={5} sx={{placeSelf: "center", fontWeigth: 100}} fontFamily="Montserrat, sans-serif">
              {primeiroAcesso
                ? "Primeiro acesso"
                : "Login"}
            </Typography>
				<TextField label="email" name="email" type="email" onChange={onChangeEmail} required/>
                <TextField label="senha" name="senha" type="password" onChange={onChangeSenha} required/>
                {error ? <Alert severity="error">{error + "."}</Alert> : undefined}
                {!enviando ? 
                <Button 
                    type="submit"
                    variant="contained"
					sx={{
						width: "fit-content",
						paddingX: 2
					}}
				>
                    {
                      primeiroAcesso
                        ? "Definir senha"
                        : "Acessar"
                    }
                </Button> : <CircularProgress sx={{placeSelf: "center"}} />}
                  <Typography onClick={()=>setPrimeiroAcesso(!primeiroAcesso)}>
                    {
                      primeiroAcesso 
                        ? "Já tem uma conta? Clique aqui!"
                        : "Primeiro acesso? Clique aqui!"
                    }
                  </Typography>
          </Stack>
        </Grid>
        <Grid item xs={6} md={10} mt={10} lg={7.8} height="80vh" sx={{opacity: 1}}>
          <Fade in={true} timeout={2000}>
            <Box component="img" src={burl + "/images/DJI_0097.jpg"} sx={{width: 1, height: 1, borderRadius: 4}} />
          </Fade>
        </Grid>
      </Grid>
    </Stack>
    );
}