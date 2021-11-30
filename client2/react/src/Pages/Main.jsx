import {Outlet} from 'react-router-dom';
import UpBar from '../Components/Upbar';
import SideBar from '../Components/Sidebar';

import {Grid, Divider} from "@mui/material";

export default function Main() {
    return (
        <Grid container orientation="row" spacing={1}>
          <Grid container item xs={12} justifyContent="center">
            <UpBar />
          </Grid>
          <Grid item xs={0} md={0} />
          <Grid item xs={12} md={1}>
            <SideBar />
          </Grid>
          <Grid item sx={{ padding: 0 }} xs={24} md={10.8}>
            <Divider sx={
              {
                position: "absolute", 
                left: 0, 
                width: "100vw",
                backgroundColor: "#2DB5FA",
                borderWidth: 1
              }
            } />
                <Outlet />
          </Grid>
        </Grid>
      );
} 