import React from 'react';
import { Paper, Typography, Toolbar, AppBar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';

export function SectionTitle({ children }) {
    return (
        <div style={{width:"100%", padding: "6px"}}>
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
    <Paper className='panel'>
        <SectionTitle>{title}</SectionTitle>
        <div>
            {children}
        </div>
    </Paper>
  );
}

export const CustomSwitch = withStyles((theme) => ({
  root: {
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex',
  },
  switchBase: {
    padding: 2,
    color: theme.palette.grey[500],
    '&$checked': {
      transform: 'translateX(12px)',
      color: theme.palette.common.white,
      '& + $track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      },
    },
  },
  thumb: {
    width: 12,
    height: 12,
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

export function ToggleSwitch({ value, setValue }) {
  return (
    <label className='toggle-switch'>
      <span className={value ? 'inactive' : 'active'}>Off</span>
      <CustomSwitch checked={value} onChange={() => setValue(!value)} />
      <span className={value ? 'active' : 'inactive'}>On</span>
    </label>
  );
}
