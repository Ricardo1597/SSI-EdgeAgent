import React from 'react';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import JSONPretty from 'react-json-pretty';

export default function NymCard({ nym, didDocument }) {
  const getRole = (role) => {
    switch (role) {
      case null:
        return 'Common user';
      case '0':
        return 'Trustee user';
      case '2':
        return 'Steward user';
      case '101':
        return 'Trust anchor user';
      case '201':
        return 'Network monitor user';
      default:
        return 'Peer did';
    }
  };

  return (
    <Card style={styles.card} align="left">
      <div style={{ fontSize: 16 }}>
        <div align="center">
          <Typography component="span" variant="h6">
            <strong>DID</strong>
          </Typography>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', marginTop: 7, marginBottom: -3 }}>DID:</div>
          <div style={{ fontSize: 15 }}>{nym.dest}</div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', marginTop: 7, marginBottom: -3 }}>Verkey:</div>
          <div style={{ fontSize: 15 }}>{nym.verkey}</div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', marginTop: 7, marginBottom: -3 }}>Role:</div>
          <div style={{ fontSize: 15 }}>{getRole(nym.role)}</div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', marginTop: 7 }}>Added by:</div>
          <div style={{ fontSize: 15 }}>{nym.identifier}</div>
        </div>
      </div>
      <div style={{ marginTop: 25 }}>
        <div align="center">
          <Typography style={{ marginBottom: 3, fontSize: 19 }}>DID Document</Typography>
        </div>
        <JSONPretty data={didDocument}></JSONPretty>
      </div>
    </Card>
  );
}

// Styles
const styles = {
  card: {
    padding: 30,
    marginTop: 30,
    marginBottom: 15,
  },
};
