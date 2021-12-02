import React from 'react';
import { Paper, Toolbar, AppBar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';

export function SectionTitle({ children }) {
    return (
        <div style={{width:"100%", padding: "6px", height:"40px"}}>
            <h1>
                {children}
            </h1>
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
          <h1 className={classes.title}>
            Test Stand Control Software
          </h1>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export function Panel({ children, title, ...props }) {
  return (
    <div className='panel' {...props}>
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
    <div className='toggle-switch' style={{ width: 60}}>
      <span className={value ? 'inactive' : 'active'}>Off</span>
      <BigSwitch checked={value} onChange={() => setValue(!value)} />
      <span className={value ? 'active' : 'inactive'} style={{ textAlign:'right', width:'100%', display:'block' }}>On</span>
    </div>
  );
}



