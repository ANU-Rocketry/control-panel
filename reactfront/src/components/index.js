import React from 'react';
import { Paper, Typography, Toolbar, AppBar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';

export function SectionTitle({ children }) {
    return (
        <div style={{width:"100%", padding: "6px", height:"40px"}}>
            <h5>
                {children}
            </h5>
        </div>
    );
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    paddingLeft: theme.spacing(2),
  },
}));

export function TopBar() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <h6 variant="h6" className={classes.title}>
            Test End Control Software
          </h6>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export function Panel({ children, title }) {
  return (
    <div className='panel'>
        <SectionTitle>{title}</SectionTitle>
        <Paper style={{width:"100%", height:"calc(100% - 52px"}}>
          {children}
        </Paper>
    </div>
  );
}

export const BigSwitch = withStyles((theme) => ({
  root: {
    width: 60,
    height: 32,
    padding: 1,
    display: 'flex',
  },
  switchBase: {
    padding: 2,
    color: theme.palette.grey[500],
    '&$checked': {
      transform: 'translateX(26px)',
      color: theme.palette.common.white,
      '& + $track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      },
    },
  },
  thumb: {
    width: 28,
    height: 28,
    boxShadow: 'none',
  },
  track: {
    border: `1px solid ${theme.palette.grey[500]}`,
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: theme.palette.common.white,
  },
  checked: {},
}))(Switch);

export const NormalSwitch = withStyles((theme) => ({
  root: {
    position: 'absolute',
    top: "-10px",
    left: "-10px",
    width: "6vw",
  },
}))(Switch);

export function ToggleSwitch({ value, setValue }) {
  return (
    <label className='toggle-switch'>
      <span className={value ? 'inactive' : 'active'}>Off</span>
      <BigSwitch checked={value} onChange={() => setValue(!value)} />
      <span className={value ? 'active' : 'inactive'}>On</span>
    </label>
  );
}



