import React, { Component, Fragment } from 'react';

import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { withStyles } from '@material-ui/core/styles';

import FirstStep from './FirstStep';
import SecondStep from './SecondStep';
import ConfirmationStep from './ConfirmationStep';

import axios from 'axios';
import config from '../../../../../../config';

import { connect } from 'react-redux';

// Step titles
const labels = ['General Information', 'My Attributes', 'Confirm Information'];

class StepForm extends Component {
  state = {
    step: 0,
    connectionId: '',
    connections: (JSON.parse(localStorage.getItem('connections')) || [])
      .filter((connection) => connection.state === 'complete')
      .map((connection) => {
        return {
          id: connection.connectionId,
          alias: connection.alias,
        };
      }),
    credDefId: '',
    comment: '',
    schemaId: null,
    credAttributes: {},
    formErrors: {
      connectionId: '',
      credDefId: '',
      comment: '',
      credAttributes: {},
    },
  };

  // Proceed to next step
  handleNext = () => this.setState({ step: this.state.step + 1 });
  // Go back to prev step
  handleBack = () => this.setState({ step: this.state.step - 1 });

  // Handle fields change
  handleChange = (e) => {
    const { name, value } = e.target;

    this.setState({
      [name]: value,
    });

    // Handle errors
    let errors = this.state.formErrors;
    errors[name] = '';
    switch (name) {
      case 'connectionId': // e0f748a8-f7b7-4970-9fa5-d2bd9872b7cd (uuid)
        if (value.length < 1) {
          errors['connectionId'] = 'Cannot be empty';
        } else if (!value.match(/^[a-z0-9-]+$/)) {
          errors['connectionId'] = 'Invalid characters';
        }
        break;
      case 'credDefId': // credDefId: creddef:mybc:did:mybc:EbP4aYNeTHL6q385GuVpRV:3:CL:14:TAG1
        if (value.length < 1) {
          errors['credDefId'] = 'Cannot be empty';
        } else if (!value.match(/^[a-zA-Z0-9:\-]+$/)) {
          errors['credDefId'] = 'Invalid characters';
        }
        break;
      case 'comment':
        if (!value.match(/[a-zA-Z-0-9 ]*/)) {
          errors['comment'] = 'Invalid characters';
        }
        break;
      default:
        break;
    }
    this.setState({ formErrors: errors });
  };

  handleChangeSchema = (schema) => {
    let newCredAttributes = {};
    let errors = this.state.formErrors;
    errors.credAttributes = {};
    schema.attrNames.forEach((attr) => {
      newCredAttributes[attr] = {
        name: attr,
        value: '',
      };
      errors.credAttributes[attr] = '';
    });
    this.setState({
      schemaId: schema.id,
      credAttributes: newCredAttributes,
      formErrors: errors,
    });
  };

  handleChangeAttributeValue = (e) => {
    const { name, value } = e.target;

    let credAttributes = this.state.credAttributes;
    credAttributes[name].value = value;
    this.setState({
      credAttributes: credAttributes,
    });

    // Handle errors
    let errors = this.state.formErrors;
    errors['credAttributes'][name] = '';
    if (!value.length) {
      errors['credAttributes'][name] = 'Cannot be empty';
    }
    this.setState({
      formErrors: errors,
    });
  };

  isFormValid = () => {
    let valid = true;
    Object.values(this.state.formErrors).forEach((val) => {
      val.length && (valid = false);
    });

    return valid;
  };

  onSubmit = (e) => {
    e.preventDefault();

    if (!this.isFormValid()) {
      return;
    }

    const jwt = this.props.accessToken;

    axios
      .post(
        `${config.endpoint}/api/credential-exchanges/send-proposal`,
        {
          connectionId: this.state.connectionId,
          comment: this.state.comment,
          schemaId: this.state.schemaId,
          credDefId: this.state.credDefId,
          credAttributes: Object.values(this.state.credAttributes),
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then((res) => {
        console.log(res.data);
        alert('Proposal sent with success!');
      })
      .catch((err) => {
        console.error(err);
        alert('Error sending credential proposal. Please try again.');
      });
  };

  handleSteps = (step) => {
    switch (step) {
      case 0:
        return (
          <FirstStep
            handleNext={this.handleNext}
            handleChange={this.handleChange}
            handleChangeSchema={this.handleChangeSchema}
            connectionId={this.state.connectionId}
            connections={this.state.connections}
            credDefId={this.state.credDefId}
            comment={this.state.comment}
            formErrors={{
              connectionId: this.state.formErrors.connectionId,
              credDefId: this.state.formErrors.credDefId,
              comment: this.state.formErrors.comment,
            }}
          />
        );
      case 1:
        return (
          <SecondStep
            handleNext={this.handleNext}
            handleBack={this.handleBack}
            handleChange={this.handleChangeAttributeValue}
            credAttributes={this.state.credAttributes}
            formErrors={this.state.formErrors.credAttributes}
          />
        );
      case 2:
        return (
          <ConfirmationStep
            handleNext={this.handleNext}
            handleBack={this.handleBack}
            onSubmit={this.onSubmit}
            connectionId={this.state.connectionId}
            credDefId={this.state.credDefId}
            schemaId={this.state.schemaId}
            comment={this.state.comment}
            credAttributes={this.state.credAttributes}
          />
        );
      default:
        break;
    }
  };

  render() {
    console.log(this.state);

    return (
      <Fragment>
        <Stepper
          activeStep={this.state.step}
          style={{ paddingTop: 50, paddingBottom: 50 }}
          alternativeLabel
        >
          {labels.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <div>{this.handleSteps(this.state.step)}</div>
      </Fragment>
    );
  }
}

// Styles
const useStyles = (theme) => ({});

const mapStateToProps = (state) => {
  return {
    accessToken: state.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(StepForm));
