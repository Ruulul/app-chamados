import React, {Suspense} from 'react';
import {CircularProgress, Typography, Box, Button} from '@mui/material';
class Boundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: undefined };
    }
  
    static getDerivedStateFromError(error) {    // Update state so the next render will show the fallback UI.    
      console.log(error)
      return { hasError: true, error: error.message };  
    }
    render() {
      if (this.state.hasError)      // You can render any custom fallback UI      
        return <Box {...this.props.sx}>
        <Typography>Algum erro ocorreu</Typography>
        <Typography>{this.state.error}</Typography>
        <Button sx={{width: "fit-content", height: "fit-content", padding: 1}} variant="contained" onClick={()=>this.setState({hasError: false, error: undefined})}>
          Recarregar
        </Button>
        </Box>
      return this.props.children; 
    }
  }
  
let sx_centralize = { 
  display: "grid", 
  margin: "auto", 
  align:"center", 
  marginTop: "30vh", 
  transform: "scale(3)" }

export default function suspend(Component) {
    return ()=><Boundary sx={sx_centralize}>
      <Suspense 
        fallback={
          <CircularProgress 
            sx={sx_centralize} />}>
        <Component/>
      </Suspense>
    </Boundary>
  }