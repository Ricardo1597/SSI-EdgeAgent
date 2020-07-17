import React, { Fragment } from "react"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import Divider from "@material-ui/core/Divider"
import Button from "@material-ui/core/Button"

// Destructure props
const ConfirmationStep = ({
  onSubmit,
  handleBack,
  connectionId, 
  credDefId, 
  schemaId, 
  comment,
  credAttributes
}) => {
  return (
    <Fragment>
      <List disablePadding>
        <ListItem>
          <ListItemText primary="Connection ID" secondary={connectionId} />
        </ListItem>

        <Divider />

        <ListItem>
          <ListItemText primary="Credential Definition ID" secondary={credDefId} />
        </ListItem>

        <Divider />

        <ListItem>
          <ListItemText primary="Schema ID" secondary={schemaId} />
        </ListItem>

        <Divider />

        <ListItem>
          <ListItemText primary="Comment" secondary={comment.length > 0 ? comment : "No Comment"}/>
        </ListItem>

        {
          Object.entries(credAttributes).map(([key, value]) => {
            return (
              <Fragment key={key}>
                <Divider />
                
                <ListItem>
                  <ListItemText primary={key} secondary={value.value} />
                </ListItem>
              </Fragment>
            )
          })
        }
      </List>

      <div
        style={{ display: "flex", marginTop: 50, justifyContent: "flex-end" }}
      >
        <Button variant="contained" color="default" onClick={handleBack}>
          Back
        </Button>
        <Button
          style={{ marginLeft: 20 }}
          variant="contained"
          color="secondary"
          onClick={onSubmit}
        >
          Confirm
        </Button>
      </div>
    </Fragment>
  )
}

export default ConfirmationStep
