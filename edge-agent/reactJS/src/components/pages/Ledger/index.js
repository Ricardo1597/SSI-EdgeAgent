import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import JSONPretty from 'react-json-pretty';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import styled from 'styled-components';
import { withSnackbar } from 'notistack';

import ReadSchemaForm from './components/forms/ReadSchemaForm';
import ReadCredDefForm from './components/forms/ReadCredDefForm';
import ReadNymForm from './components/forms/ReadNymForm';
import WriteSchemaForm from './components/forms/WriteSchemaForm';
import WriteCredDefForm from './components/forms/WriteCredDefForm';
import WriteNymForm from './components/forms/WriteNymForm';

const Root = styled.div`
  width: '100%';
  min-height: calc(100vh - 55px);
`;

const MyFormControl = styled(FormControl)`
  width: 100%;
`;

const MyForm = styled.div`
  margin-top: 30px;
`;

const FormDiv = styled.div`
  width: 500px;
  padding: 40px;
  text-align: center;
  background-color: white;
`;

const ResultDiv = styled.div`
  padding: 10px;
  padding-top: 30px;
  padding-bottom: 30px;
  background-color: white;
  width: calc(100vw - 575px);
`;

const Result = styled.div`
  padding: 20px;
  padding-bottom: 0px;
  min-height: calc(100vh - 210px);
  overflow-y: scroll;
  overflow-x: scroll;
  text-align: start;
`;

const GridForm = styled(Grid)`
  border-radius: 5;
`;

const GridResult = styled(Grid)`
  border-radius: 5;
  flex-grow: 1 !important; // needed to force the use of this style
  min-width: 500;
`;

const SubmitTransaction = ({ enqueueSnackbar, closeSnackbar }) => {
  const [type, setType] = useState('read');
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

  const getDIDPermissions = () => {
    const dids = JSON.parse(localStorage.getItem('dids'));
    return dids &&
      dids.filter((did) => did.role !== null && did.role !== 'no role' && did.role !== '201')
        .length > 0
      ? true
      : false;
  };

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
    } else if (type === 'write' && getDIDPermissions()) {
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
    <Root className="root-background p-4">
      <Grid container>
        <GridForm item>
          <FormDiv>
            <Typography component="span" variant="h5">
              Submit Transaction
            </Typography>
            <MyForm>
              <Grid container align="left" spacing={3}>
                <Grid item xs={4}>
                  <MyFormControl>
                    <InputLabel>Type *</InputLabel>
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
                    <InputLabel>Operation *</InputLabel>
                    {type === 'read' ? ( // no permissions needed
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
                    ) : type === 'write' && getDIDPermissions() ? (
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
                    ) : null}
                  </MyFormControl>
                </Grid>
                <Grid item xs={12}>
                  {transactionForm()}
                </Grid>
              </Grid>
            </MyForm>
          </FormDiv>
        </GridForm>
        <GridResult item className="ml-4" align="center">
          <ResultDiv>
            <Typography component="span" variant="h6">
              <strong>Transaction Result</strong>
            </Typography>
            <Result className="scrollBar">
              <JSONPretty data={result}></JSONPretty>
            </Result>
          </ResultDiv>
        </GridResult>
      </Grid>
    </Root>
  );
};

export default withSnackbar(SubmitTransaction);
