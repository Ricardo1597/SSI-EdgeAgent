import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    minWidth: 400,
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export default function PresentationCard(props) {
  const classes = useStyles();

  console.log(props.presentation);
  console.log(props.verified);
  return (
    <Card className={classes.root} variant="outlined">
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          Word of the Day
        </Typography>
        <Typography variant="h5" component="h2">
            Text
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          adjective
        </Typography>
        <Typography variant="body2" component="p">
          well meaning and kindly.
          <br />
          {'"a benevolent smile"'}
        </Typography>
        {props.verified === 'true' && (
          <img src='http://localhost:3000/valid-stamp.jpg' width={80} alt="Invalid Presentation" />
        )}
        {props.verified === 'false' && (
          <img src='http://localhost:3000/invalid-stamp.jpg' width={80} alt="Invalid Presentation" />
        )}
      </CardContent>
      <CardActions>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  );
}