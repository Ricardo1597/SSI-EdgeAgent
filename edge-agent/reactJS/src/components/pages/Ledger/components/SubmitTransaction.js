import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import JSONPretty from 'react-json-pretty';
import Container from '@material-ui/core/Container';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Card from '@material-ui/core/Card';
import styled from 'styled-components';
import { withSnackbar } from 'notistack';

import ReadSchemaForm from './forms/ReadSchemaForm';
import ReadCredDefForm from './forms/ReadCredDefForm';
import ReadNymForm from './forms/ReadNymForm';
import WriteSchemaForm from './forms/WriteSchemaForm';
import WriteCredDefForm from './forms/WriteCredDefForm';
import WriteNymForm from './forms/WriteNymForm';

const MyFormControl = styled(FormControl)`
  width: 100%;
`;

const MyForm = styled.div`
  margin-top: 30px;
`;

const FormDiv = styled.div`
  width: 100%;
  padding: 40px;
  text-align: center;
  background-color: white;
  margin: 20px;
`;

const MyCard = styled(Card)`
  padding: 20px;
  margin-top: 30px;
`;

const SubmitTransaction = ({ enqueueSnackbar, closeSnackbar }) => {
  const [type, setType] = useState(null);
  const [operation, setOperation] = useState(null);
  const [result, setResult] = useState('');

  const showSnackbarVariant = (message, variant) => {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      action: (key) => (
        <>
          <Button
            style={{ color: 'white' }}
            onClick={() => {
              closeSnackbar(key);
            }}
          >
            <strong>Dismiss</strong>
          </Button>
        </>
      ),
    });
  };

  // const handleChange = (e) => {
  //   const { name, value } = e.target;

  //   // Handle validation
  //   let errors = {
  //     schemaId: '',
  //     credDefId: '',
  //     nym: '',
  //   };
  //   switch (name) {
  //     case 'schemaId': // schemaId: schema:mybc:did:mybc:V4SGRU86Z58d6TV7PBUe6f:2:cc:1.3
  //       setSchemaId(value);
  //       if (!value.match(/^[a-zA-Z0-9:\-._]*$/)) {
  //         errors['schemaId'] = 'Invalid characters';
  //       }
  //       break;
  //     case 'credDefId': // credDefId: creddef:mybc:did:mybc:EbP4aYNeTHL6q385GuVpRV:3:CL:14:TAG1
  //       setCredDefId(value);
  //       if (!value.match(/^[a-zA-Z0-9:\-]*$/)) {
  //         errors['credDefId'] = 'Invalid characters';
  //       }
  //       break;
  //     case 'nym': // did: did:mybc:Th7MpTaRZVRYnPiabds81Y
  //       setNym(value);
  //       if (!value.match(/^[a-zA-Z0-9:]*$/)) {
  //         errors['nym'] = 'Invalid characters';
  //       } else if (value.length && value.split(':').length !== 3) {
  //         errors['nym'] = 'Invalid DID';
  //       }
  //       break;
  //     default:
  //       break;
  //   }
  //   setFormErrors(errors);
  // };

  const transactionForm = () => {
    if (type === 'read') {
      switch (operation) {
        case 'schema':
          return <ReadSchemaForm setResult={setResult} showSnackbarVariant={showSnackbarVariant} />;
        case 'credDef':
          return (
            <ReadCredDefForm setResult={setResult} showSnackbarVariant={showSnackbarVariant} />
          );
        case 'nym':
          return <ReadNymForm setResult={setResult} showSnackbarVariant={showSnackbarVariant} />;
        default:
          return null;
      }
    } else if (type === 'write') {
      switch (operation) {
        case 'schema':
          return (
            <WriteSchemaForm setResult={setResult} showSnackbarVariant={showSnackbarVariant} />
          );
        case 'credDef':
          return (
            <WriteCredDefForm setResult={setResult} showSnackbarVariant={showSnackbarVariant} />
          );
        case 'nym':
          return <WriteNymForm setResult={setResult} showSnackbarVariant={showSnackbarVariant} />;
        default:
          return null;
      }
    } else return null;
  };

  return (
    <Container className="px-0" style={{ height: 450, width: 500 }}>
      <FormDiv>
        <Typography component="span" variant="h5">
          Submit Transaction
        </Typography>
        <MyForm>
          <Grid container align="left" spacing={3}>
            <Grid item xs={4}>
              <MyFormControl>
                <InputLabel>Type</InputLabel>
                <Select
                  required
                  fullWidth
                  label="Type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <MenuItem value="read">Read</MenuItem>
                  <MenuItem value="write">Write</MenuItem>
                </Select>
              </MyFormControl>
            </Grid>
            <Grid item xs={8}>
              <MyFormControl>
                <InputLabel>Operation</InputLabel>
                <Select
                  required
                  fullWidth
                  label="Operation"
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                >
                  <MenuItem value="schema">Schema</MenuItem>
                  <MenuItem value="credDef">Credential Definition</MenuItem>
                  <MenuItem value="nym">Nym</MenuItem>
                </Select>
              </MyFormControl>
            </Grid>
            <Grid item xs={12}>
              {transactionForm()}
            </Grid>
          </Grid>
        </MyForm>
      </FormDiv>
      {result ? (
        <MyCard align="left">
          <div align="center">
            <Typography component="span" variant="h6">
              <strong>Transaction Result</strong>
            </Typography>
          </div>
          <JSONPretty data={result}></JSONPretty>
        </MyCard>
      ) : null}
    </Container>
  );
};

export default withSnackbar(SubmitTransaction);
