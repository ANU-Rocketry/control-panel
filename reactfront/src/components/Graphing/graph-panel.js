import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { FormHelperText, List, ListItem, Paper } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    height: "calc(100vh - 320px)",
    width: "50%",
    paddingLeft: 5,
    paddingRight: 5,
  },
  box: {
    display: "flex",
  },
  titleBar: {
    width: "100%",
  }
}));

export default function GraphPanel() {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
        <Paper className={classes.tittleBar}>
            Graphs
        </Paper>
    </Paper>
  );
}
