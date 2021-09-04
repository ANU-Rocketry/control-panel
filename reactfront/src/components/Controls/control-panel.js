import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { FormHelperText, List, ListItem, Paper } from '@material-ui/core';
import { SectionTitle } from '..';

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

export default function ControlPanel() {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
        <SectionTitle>Controls</SectionTitle>
    </Paper>
  );
}
