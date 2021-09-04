import React from 'react';
import { Paper, Typography, Toolbar, AppBar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

export function SectionTitle({ children }) {
    return (
        <Paper style={{width:"100%"}}>
            <Typography>
                {children}
            </Typography>
        </Paper>
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
          <Typography variant="h6" className={classes.title}>
            Test End Control Software
          </Typography>
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

