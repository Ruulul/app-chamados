import {Grid, Card, Typography, Skeleton} from "@mui/material";

const Home = ({user}) => {
  return (
    <Grid container direction={{xs: "column", md: "row"}} width="100%">
      <Grid item xs={12} md={6} minHeight={{xs:1/2, md: 1}} >
        <Card elevation={3} sx={{ padding: 0, height:"100%", width: 1}} >
            <Grid item container xs={12} md={4} sx={{padding: {xs: 1, md: 3}, minHeight: 1/2}}>
              <Grid item xs={10} md={12} >
                <Card width={1} height={1/3} sx={{padding: 2}} sx={{display: "flex", alignItems: "stretch"}}>
                  <Grid container alignItems="flex-end" justifyContent="space-between">
                    <Grid item xs={3}>
                      <Typography variant="h4" component="h4" sx={{fontWeight: 500}}>Olá, </Typography>
                    </Grid>
                    <Grid item xs={7} alignItems="flex-start">
                      <Typography component="h5" variant="h5" color="secondary" sx={{fontWeight: 500}}>{user ? " " + user : " Mundo"}</Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} height="80vh">
        <Skeleton variant="rectangular" animation="pulse" sx={{width: 1, height: 1}} />
      </Grid>
    </Grid>
  );
};

export default Home;
