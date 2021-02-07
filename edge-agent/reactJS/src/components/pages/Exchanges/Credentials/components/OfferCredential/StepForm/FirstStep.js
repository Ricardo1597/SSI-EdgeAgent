import React, { Fragment } from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import { withStyles } from '@material-ui/core/styles';

const FirstStep = ({
  handleNext,
  handleChange,
  handleChangeSchema,
  connections,
  credDefs,
  connectionId,
  credDefId,
  comment,
  formErrors,
  classes,
}) => {
  const isFormValid = () => {
    let valid = true;
    Object.values(formErrors).forEach((error) => {
      error.length && (valid = false);
    });
    return valid;
  };

  const isEmpty = connectionId.length === 0 || credDefId.length === 0;

  return (
    <Fragment>
      <Grid container style={{ maxWidth: 420 }} spacing={2}>
        <Grid item xs={12}>
          <FormControl error={formErrors.connectionId !== ''} style={{ width: '100%' }}>
            <InputLabel>Connection *</InputLabel>
            <Select
              required
              label="Connection *"
              name="connectionId"
              id="connectionId"
              value={connectionId}
              onChange={handleChange}
            >
              {connections.map(({ id, alias }) => {
                return (
                  <MenuItem key={id} value={id}>
                    {alias || id}
                  </MenuItem>
                );
              })}
            </Select>
            <FormHelperText>{formErrors.connectionId}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl error={formErrors.credDefId !== ''} style={{ width: '100%' }}>
            <InputLabel>Credential Definition ID *</InputLabel>
            <Select
              required
              label="Credential Definition ID *"
              name="credDefId"
              id="credDefId"
              value={credDefId}
              onChange={handleChange}
            >
              {credDefs.map((id) => {
                return (
                  <MenuItem key={id} value={id}>
                    {id}
                  </MenuItem>
                );
              })}
            </Select>
            <FormHelperText>{formErrors.credDefId}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comment"
            name="comment"
            id="comment"
            value={comment}
            onChange={handleChange}
            error={formErrors.comment !== ''}
            helperText={formErrors.comment}
          />
        </Grid>
      </Grid>
      <div style={{ display: 'flex', marginTop: 50, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          disabled={isEmpty || !isFormValid()}
          color="primary"
          onClick={() => {
            handleChangeSchema(credDefId);
            handleNext();
          }}
        >
          Next
        </Button>
      </div>
    </Fragment>
  );
};

// Styles
const useStyles = (theme) => ({});

export default withStyles(useStyles)(FirstStep);
