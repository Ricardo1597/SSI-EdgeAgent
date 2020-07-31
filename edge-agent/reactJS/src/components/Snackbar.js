import React, { Fragment } from 'react';
import { withSnackbar } from 'notistack';
import Button from '@material-ui/core/Button';

function Snackbar({ enqueueSnackbar, closeSnackbar, message, variant }) {
  const action = (key) => (
    <Fragment>
      <Button
        style={{ color: 'white' }}
        onClick={() => {
          closeSnackbar(key);
        }}
      >
        <strong>Dismiss</strong>
      </Button>
    </Fragment>
  );

  exports.enqueueSnackbar(message, {
    variant: variant,
    autoHideDuration: 5000,
    action,
  });
}

export default withSnackbar(Snackbar);
