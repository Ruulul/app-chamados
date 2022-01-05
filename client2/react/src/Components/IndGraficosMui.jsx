import {
  CircularProgress,
  LinearProgress,
  Slider,
  Box,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

const Donut = ({label, value, size, ...props }) => {
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
  return (
      <LinearProgress
        variant="determinate"
        {...props}
        sx={{ ...props.sx, width: `${size}%`, 
        height: theme.spacing(4),
        backgroundColor: theme.palette.action.hover, }}
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
  return (
    <Box
      sx={{
        width: `${size}%`,
        display: "grid",
        alignItems: "center",
        padding: theme.spacing(2),
      }}
      {...props}
    >
      {values.map(function (value, index, values) {
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
          <Box key={index}sx={{
            gridRow: 1,
            gridColumn: 1,
            display: "grid",
            alignItems: "center",
            height: "100%",
            width: "100%",
            }}>
            <Donut
              {...{
                value: value.value,
                label: value.label,
                size,
                thickness,
                sx: {
                    gridRow: 1,
                    gridColumn: 1,
                    margin: "0 auto",
                    zIndex: 1,
                    '& .MuiCircularProgress-svg': {
                        //rotate: rotate_value,
						transform: `rotate(${rotate_value})`,
                        color: color_color
                    },
                }
              }}
            />
            <CircularProgress
              {...{ variant: "determinate", size: `${size}%`, thickness }}
              value={100}
              sx={{
                gridRow: 1,
                gridColumn: 1,
                margin: "0 auto",
                //color: theme.palette.action.hover,
                zIndex: 0
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export { Donut, Bar, BarLabelled, RadialBar };
