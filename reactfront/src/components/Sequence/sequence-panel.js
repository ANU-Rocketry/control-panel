import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { FormHelperText, List, ListItem, Paper } from '@material-ui/core';
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

export default function SequencePanel() {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
        <SectionTitle>Sequences</SectionTitle>
        <div className={classes.box}>   
            <List>
                <ListItem>
                    Sleep
                </ListItem>
                <ListItem>
                    Open
                </ListItem>
                <ListItem>
                    Close
                </ListItem>
            </List>
        </div>     
    </Paper>
  );
}
