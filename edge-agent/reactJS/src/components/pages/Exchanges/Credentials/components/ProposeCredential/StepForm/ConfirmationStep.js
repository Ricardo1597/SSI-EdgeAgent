import React, { Fragment } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

import DisplayAttributesTable from '../../../../../../sharedComponents/DisplayAttributesTable';

// Destructure props
const ConfirmationStep = ({
  onSubmit,
  handleBack,
  alias,
  connectionId,
  credDefId,
  schemaId,
  comment,
  credAttributes,
}) => {
  return (
    <Fragment>
      <List>
        {alias ? (
          <ListItem className="px-2" style={{ marginTop: -35 }}>
            <ListItemText primary="Connection" secondary={alias} />
          </ListItem>
        ) : null}

        <Divider />

        <ListItem className="px-2">
          <ListItemText primary="Connection ID" secondary={connectionId} />
        </ListItem>

        <ListItem className="px-2">
          <ListItemText primary="Credential Definition ID" secondary={credDefId} />
        </ListItem>

        <Divider />

        <ListItem className="px-2">
          <ListItemText primary="Schema ID" secondary={schemaId} />
        </ListItem>

        <Divider />

        <ListItem className="px-2">
          <ListItemText primary="Comment" secondary={comment.length > 0 ? comment : 'No Comment'} />
        </ListItem>

        <Divider />

        <ListItem className="px-2">
          <ListItemText primary="Attributes" />
        </ListItem>

        <div className="px-2" style={{ marginTop: -5 }}>
          <DisplayAttributesTable
            columns={[
              { id: 'name', label: 'Name' },
              { id: 'value', label: 'Value' },
            ]}
            rows={Object.values(credAttributes)}
            idColumn="name"
          />
        </div>

        {/* {Object.entries(credAttributes).map(([key, value]) => {
          return (
            <Fragment key={key}>
              <Divider />

              <ListItem>
                <ListItemText primary={key} secondary={value.value} />
              </ListItem>
            </Fragment>
          );
        })} */}

        <Divider />
      </List>

      <div style={{ display: 'flex', marginTop: 50, justifyContent: 'flex-end' }}>
        <Button variant="contained" color="default" onClick={handleBack}>
          Back
        </Button>
        <Button style={{ marginLeft: 20 }} variant="contained" color="secondary" onClick={onSubmit}>
          Confirm
        </Button>
      </div>
    </Fragment>
  );
};

export default ConfirmationStep;
