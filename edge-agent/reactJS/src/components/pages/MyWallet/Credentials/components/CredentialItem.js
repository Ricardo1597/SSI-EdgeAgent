import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

function CredentialItem(props) {
  const getValidityStyle = () => {
    var daysLeft = Math.ceil(
      Math.abs(props.credential.validity - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft < 0) return { backgroundColor: '#DCDCDC' };
    else if (daysLeft < 30) return { backgroundColor: '#FFA07A' };
    else if (daysLeft < 360) return { backgroundColor: '#FFFF00' };
    else return { backgroundColor: '#F0FFFF' };
  };

  const classes = useStyles();
  const { attrs, schema_id, cred_def_id, referent } = props.credential;
  const schemaParts = schema_id.split(':');
  const schemaName = schemaParts[schemaParts.length - 2];
  const schemaVersion = schemaParts[schemaParts.length - 1];
  const credDefParts = cred_def_id.split(':');
  const issuer =
    credDefParts[credDefParts.length - 7] +
    ':' +
    credDefParts[credDefParts.length - 6] +
    ':' +
    credDefParts[credDefParts.length - 5];

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography gutterBottom style={{ fontWeight: 'bold' }} variant="subtitle1" component="h2">
          {schemaName}
        </Typography>
        <Typography color="textSecondary" component="p" style={{ fontSize: 14 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 'bold' }}>Credential ID:</div>
            {referent}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 'bold' }}>Issuer DID:</div>
            {issuer}
          </div>
          <div>
            <div style={{ fontWeight: 'bold' }}>Attributes:</div>
            <ul className="mb-0" style={{ fontSize: 13 }}>
              {Object.keys(attrs).map((attr) => (
                <li key={attr}>
                  <strong>{attr}:</strong> {attrs[attr]}
                </li>
              ))}
            </ul>
          </div>
        </Typography>
      </CardContent>
    </Card>
  );
}

// Prop types
CredentialItem.propTypes = {
  credential: PropTypes.object.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: 350,
    borderRadius: 5,
    margin: 20,
    padding: 10,
  },
}));

export default CredentialItem;
