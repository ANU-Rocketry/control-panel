import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SafteyPanel from './Saftey/saftey-panel';
import { List, ListItem } from '@material-ui/core';
import SequencePanel from './Sequence/sequence-panel';
import ControlPanel from './Controls/control-panel';
import GraphPanel from './Graphing/graph-panel';

const useStyles = makeStyles((theme) => ({
  root: {
    
  },
}));

export default function MainBody() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
    <List>
        <ListItem>
            <SafteyPanel/>
            <SequencePanel/>
        </ListItem>
        <ListItem>
            <ControlPanel/>
            <GraphPanel/>
        </ListItem>
    </List>
    </div>
  );
}