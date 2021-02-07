import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

export default function AttributeInfoDialog({
  attribute,
  open,
  handleClose,
  isPredicate,
  isRequest,
}) {
  const secondsToLocalDateTime = (seconds) => {
    const date = new Date(seconds * 1000);
    return date.toLocaleDateString() + ' @ ' + date.toLocaleTimeString();
  };

  console.log('attribute: ', attribute);
  return (
    <>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <div className="p-1" style={{ width: 500 }}>
          <DialogTitle id="form-dialog-title">Attribute Information</DialogTitle>
          <DialogContent className="mx-1" style={{ marginTop: -15 }}>
            {attribute ? (
              <>
                {isPredicate ? (
                  <>
                    <ListItem style={{ width: '33%', display: 'inline-block' }}>
                      <ListItemText primary="Name" secondary={attribute.name} />
                    </ListItem>
                    <ListItem style={{ width: '33%', display: 'inline-block' }}>
                      <ListItemText
                        primary="Predicate"
                        secondary={isRequest ? attribute.p_type : attribute.predicate}
                      />
                    </ListItem>
                    <ListItem style={{ width: '33%', display: 'inline-block' }}>
                      <ListItemText
                        primary="Name"
                        secondary={isRequest ? attribute.p_value : attribute.threshold}
                      />
                    </ListItem>
                  </>
                ) : (
                  <>
                    <ListItem
                      style={{
                        width: !isRequest ? '50%' : '100%',
                        display: 'inline-block',
                      }}
                    >
                      <ListItemText primary="Name" secondary={attribute.name} />
                    </ListItem>
                    {!isRequest ? (
                      <ListItem style={{ width: '50%', display: 'inline-block' }}>
                        <ListItemText primary="Value" secondary={attribute.value} />
                      </ListItem>
                    ) : null}
                  </>
                )}
                <Divider />
                {attribute.non_revoked ? (
                  <>
                    <ListItem style={{ width: '50%', display: 'inline-block' }}>
                      <ListItemText
                        primary="Non Revoked (From)"
                        secondary={secondsToLocalDateTime(attribute.non_revoked.from)}
                      />
                    </ListItem>
                    <ListItem style={{ width: '50%', display: 'inline-block' }}>
                      <ListItemText
                        primary="Non Revoked (To)"
                        secondary={secondsToLocalDateTime(attribute.non_revoked.to)}
                      />
                    </ListItem>
                    <Divider />
                  </>
                ) : null}
                {attribute.cred_def_id ? (
                  <>
                    <ListItem>
                      <ListItemText
                        primary="Credential Definition ID"
                        secondary={attribute.cred_def_id}
                      />
                    </ListItem>

                    <Divider />
                  </>
                ) : null}
              </>
            ) : (
              <p>No attribute received.</p>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </>
  );
}
