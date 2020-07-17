import React, { Fragment } from "react"
import Grid from "@material-ui/core/Grid"
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"

// Destructure props
const SecondStep = ({
  handleNext,
  handleBack,
  handleChange,
  credAttributes,
  formErrors
}) => {

    const isFormValid = () => { 
        let valid = true;
        Object.values(credAttributes).forEach(attr => {
            attr.value.length === 0 && (valid=false);
        })
        Object.values(formErrors).forEach(error => {
            error.length && (valid=false);
        })
        console.log("Cheguei: ", valid)
        return valid;
    }
    
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
        <Fragment>
            <Grid container spacing={2}>
                { Object.keys(credAttributes).length
                    ? (
                        Object.keys(credAttributes).map(key => {
                            return (
                                <Grid item key={key} xs={12}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        required
                                        label={capitalizeFirstLetter(key)}
                                        name={key}
                                        id={key}
                                        value={credAttributes[key].value}
                                        onChange={handleChange}
                                        error={formErrors[key] !== ""}
                                        helperText={formErrors[key]}
                                    />
                                </Grid>
                            )  
                        })
                    ) : null
                }
                <div
                    style={{ display: "flex", marginTop: 50, justifyContent: "flex-end" }}
                >
                    <Button
                    variant="contained"
                    color="default"
                    onClick={handleBack}
                    style={{ marginRight: 20 }}
                    >
                    Back
                    </Button>
                    <Button
                    variant="contained"
                    disabled={!isFormValid()}
                    color="primary"
                    onClick={handleNext}
                    >
                    Next
                    </Button>
                </div>
            </Grid>
        </Fragment>
    )
}

export default SecondStep
