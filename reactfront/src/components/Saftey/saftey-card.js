import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import ArmingSwitch from './arming-switch';

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export default function SafteyCard() {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h5" component="h2">
          Saftey Switch
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          Disarms the test end
        </Typography>
        <ArmingSwitch/>
        {/* <Typography variant="body2" component="p">
          This switch will cause the test user interface to disconect please think be fore switching
        </Typography> */}
      </CardContent>
    </Card>
  );
}
