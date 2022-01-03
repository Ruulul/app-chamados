import {
  CircularProgress,
  LinearProgress,
  Slider,
  Box,
  useTheme,
  Paper,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useMemo, useState  } from "react";

const Donut = ({theme = undefined, angle = 0, label, value, size, ...props }) => {
  return (
    <CircularProgress
      size={`${size}%`}
      value={value}
      thickness={11}
      variant="determinate"
      color="primary"
      {...props}
      sx={{
        ...props.sx,
        zIndex: -1,
        position: "relative",
      }}
    >
    </CircularProgress>
  );
};

const Bar = ({ label, size, ...props }) => {
  const theme = useTheme();

  const useStyles = makeStyles(() => ({
    root: {
      height: theme.spacing(4),
      backgroundColor: theme.palette.action.hover,
    },
  }));

  const classes = useStyles();

  return (
      <LinearProgress
        variant="determinate"
        {...props}
        sx={{ ...props.sx, height: 10, width: `${size}%` }}
        classes={{ root: classes.root }}
      />
  );
};

const BarLabelled = ({ label, labels, size, ...props }) => {
  const theme = useTheme();
  const useStyles = makeStyles(() => ({
    root: {
      height: theme.spacing(4),
    },
    rail: {
      height: theme.spacing(4),
    },
    track: {
      height: theme.spacing(4),
    },
    mark: {
      height: theme.spacing(4),
      backgroundColor: theme.palette.background.default,
    },
    thumb: {
      display: "none",
    },
  }));
  const classes = useStyles(theme);
  return (
    <Slider
      {...props}
      sx={{ ...props.sx, width: `${size}%`, zIndex: -1 }}
      marks={labels}
      classes={{ ...classes }}
    />
  );
};

const RadialBar = ({ values, size, ...props }) => {
  const theme = useTheme();
  const useStyles = makeStyles(() => ({
    root: {
      display: "grid",
      alignItems: "center",
      padding: theme.spacing(2),
    },
    circle: {
      gridRow: 1,
      gridColumn: 1,
      display: "grid",
      alignItems: "center",
      height: "100%",
      width: "100%",
    },
    bar: {
      gridRow: 1,
      gridColumn: 1,
      margin: "0 auto",
      zIndex: 1,
    },
    track: {
      gridRow: 1,
      gridColumn: 1,
      margin: "0 auto",
      color: theme.palette.action.hover,
    },
  }))

  const classes = useStyles()

  return (
    <Box
      className={classes.root}
      sx={{
        width: `${size}%`,
      }}
      {...props}
    >
      {values.map((value, index) => {
        //let size = 100 - (index / values.length) * 100;
        //let thickness =
        //  (15 / values.length) / (1 - index * (1 / values.length));
		let size = 100
        let thickness = 8
        let color_factor = (index / (values.length - 1)) * 195;
        let color_color = `rgb(${195 - color_factor}, ${
          195 - color_factor
        }, ${color_factor})`;
		let rotate_value = `${values.slice(0, index).reduce((pv, co)=>pv+co.value, 0)/100 * 360}deg`
        return (
          <Box key={index} className={classes.circle}>
            <Donut
              {...{
                value: value.value,
                label: value.label,
                size,
                thickness,
                sx: {
                    '& .MuiCircularProgress-svg': {
                        //rotate: rotate_value,
						transform: `rotate(${rotate_value})`,
                        color: color_color
                    },
                }
              }}
              className={classes.bar}
            />
            <CircularProgress
              {...{ variant: "determinate", size: `${size}%`, thickness }}
              value={100}
              className={classes.track}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export { Donut, Bar, BarLabelled, RadialBar };
