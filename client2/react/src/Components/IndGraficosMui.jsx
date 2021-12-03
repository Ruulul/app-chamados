import { CircularProgress, LinearProgress, Slider, Box, useTheme, Paper, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useState, useEffect } from "react";

const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const setFromEvent = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", setFromEvent);

    return () => {
      window.removeEventListener("mousemove", setFromEvent);
    };
  }, []);

  return position;
};


const Donut = ({label, value, size, ...props})=>{
    const [open, setOpen] = useState(false)
    const position = useMousePosition()
    return (
        <>
        <CircularProgress
            size={`${size}%`}
            value={value}
            thickness={11}
            variant="determinate"
            color="primary"
            {...props}
            sx={{...props.sx, zIndex: -1}}

            onMouseEnter={(event)=>{
                setOpen(true)
            }}
            onMouseLeave={()=>{
                setOpen(false)
            }}
        />
        <Paper 
            sx={{width: "fit-content", padding: 2, display: open ? "inherit" : "none", position: "fixed", top: position.y, left: position.x, zIndex: 1}}
            onPointerMove={()=>{
                console.log("aaaa")
            }}
        >
            <Typography>
                {`${label}: ${value}%`}
            </Typography>
        </Paper>
        </>
    )
}

const Bar = ({label, size, ...props})=>{
    const theme = useTheme()
    const [open, setOpen] = useState(false)
    const position = useMousePosition()

    const useStyles = makeStyles(()=>({
        root: {
            height: theme.spacing(4),
            backgroundColor: theme.palette.action.hover
        }
    }))

    const classes = useStyles()

    return (
        <>
        <LinearProgress
            variant="determinate"
            {...props}
            sx={{...props.sx, height: 10, width: `${size}%`}}
            classes={{root: classes.root}}

            onMouseEnter={(event)=>{
                setOpen(true)
            }}
            onMouseLeave={()=>{
                setOpen(false)
            }}
        />
        <Paper 
            sx={{width: "fit-content", padding: 2, display: open ? "inherit" : "none", position: "fixed", top: position.y, left: position.x}}
            onPointerMove={()=>{
                console.log("aaaa")
            }}
        >
            <Typography>
                {`${label}: ${props.value}%`}
            </Typography>
        </Paper>
        </>
    )
}

const BarLabelled = ({label, labels, size, ...props})=>{
    const theme = useTheme()
    const useStyles = makeStyles(() => ({
        root: {
            height: theme.spacing(4)
        },
        rail: {
            height: theme.spacing(4)
        },
        track: {
            height: theme.spacing(4)
        },
        mark: {
            height: theme.spacing(4),
            backgroundColor: theme.palette.background.default
        },
        thumb: {
            display: "none"
        }, 
    }))
    const classes = useStyles(theme);
    return (
        <Slider
            {...props}
            sx={{...props.sx, width:`${size}%`, zIndex: -1}}
            marks={labels}
            classes={{...classes}}
        />
    )
}

const RadialBar = ({values, size, ...props})=> {
    const theme = useTheme()
    const useStyles = makeStyles(() => ({
      root: {
        display: 'grid',
        alignItems: 'center',
        padding: theme.spacing(2)
      },
      circle: {
        gridRow: 1,
        gridColumn: 1,
        display: 'grid',
        alignItems: 'center',
        height: '100%',
        width: '100%',
      },
      bar: {
        gridRow: 1,
        gridColumn: 1,
        margin: '0 auto',
        zIndex: 1,
      },
      track: {
        gridRow: 1,
        gridColumn: 1,
        margin: '0 auto',
        color: theme.palette.action.hover
      },
    }));  
    
    const classes = useStyles();

    return (
        <Box 
            className={classes.root}
            sx={{
                width: `${size}%`
            }}
            {...props}
        >
            {
                values.map((value, index)=>{
                    let size = 100 - index/values.length * 100;
                    let thickness = (15/values.length) * 10 / (10 - index * (10/values.length))
                    return (
                        <Box
                            key={index}
                            className={classes.circle}
                        >
                            <Donut
                                {...{value: value.value, label: value.label, size, thickness}}
                                className={classes.bar}
                            />
                            <CircularProgress
                                {...{variant: "determinate", size: `${size}%`, thickness}}
                                value={100}
                                className={classes.track}
                            />
                        </Box>

                    )
                })
            }
        </Box>
    )

}

export { Donut, Bar, BarLabelled, RadialBar }