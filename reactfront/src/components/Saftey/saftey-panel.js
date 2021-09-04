import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SafteyCard from './saftey-card';
import { FormHelperText, Paper } from '@material-ui/core';
import { SectionTitle } from '..';

const useStyles = makeStyles((theme) => ({
  root: {
    height: 200,
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

export default function SafteyPanel() {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
        <SectionTitle>Saftey</SectionTitle>
        <div className={classes.box}>   
            <SafteyCard/>
            <SafteyCard/>
            <SafteyCard/>
        </div>     
    </Paper>
  );
}
