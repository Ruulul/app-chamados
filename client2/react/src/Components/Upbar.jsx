import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusCircle,
  faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom"

import { Grid, Button } from "@mui/material";
import Stack from "@mui/material/Stack";
import axios from "./Requisicao";
import { useNavigate } from "react-router-dom"

const UpBar = (props) => {
    const redirect = useNavigate()
    const [variant, setVariant] = useState("secondary")
    return (
      <Grid container>
        <Grid item xs={5} />
        <Grid item xs={7}>
          <Stack spacing={2} direction="row" pt={1} pr={4} justifyContent="space-between">
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/nova_requisicao"
            >
              <FontAwesomeIcon icon={faPlusCircle} />
            </Button>
            <Button
              variant="contained"
              color={variant}
              onClick={async ()=>{
                await axios("post", '/api/logout')
                  .then(()=>{
                    redirect("/login")
                    window.location.reload()
                  })
                  .catch((err)=>{console.log(err);return setVariant("error")})
              }}
              
              sx={{
                minWidth: 0,
                minHeight: 0,
                width: 1/30,
                position: "absolute",
                right: 30
              }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </Button>
          </Stack>
        </Grid>
      </Grid>
    );
  }

export default UpBar;
