import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';

export default function SchemaCard({ schema }) {
  return (
    <Card style={styles.card} align="left">
      <div align="center">
        <Typography component="span" variant="h6">
          <strong>Schema</strong>
        </Typography>
      </div>
      <Grid container spacing={1} style={{ marginTop: 5 }}>
        <Grid item xs={12}>
          <strong>Name:</strong> {schema.name}
        </Grid>
        <Grid item xs={12}>
          <strong>Version:</strong> {schema.version}
        </Grid>
        <Grid item xs={12}>
          <strong>Attributes:</strong>
          <ul>
            {schema.attrNames.map((attr) => {
              return <li key={attr}>{attr}</li>;
            })}
          </ul>
        </Grid>
      </Grid>
    </Card>
  );
}

// Styles
const styles = {
  card: {
    width: 350,
    padding: 30,
    marginTop: 30,
    marginBottom: 15,
  },
};
