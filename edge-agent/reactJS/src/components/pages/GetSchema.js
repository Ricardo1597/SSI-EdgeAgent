import React, { useState } from 'react'

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';

import config from '../../config'
import axios from 'axios';
import { connect } from 'react-redux';


function GetSchema() {
    const [schemaId, setSchemaId] = useState("");
    const [schema, setSchema] = useState(null);
  
    const onSubmit = (e) => {
      e.preventDefault();
      const jwt = this.props.accessToken;

      axios.get(`${config.endpoint}/api/getSchema`, {
        params: {
          schemaId
        },
        headers: { Authorization: `Bearer ${jwt}`} 
      })
      .then(res => {
        if (res.status === 200) {
          console.log(res.data)
          setSchema(res.data.schema)
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch(err => {
          console.error(err);
          alert('Error creating DID. Please try again.');
      });
    }

    const renderSchema = () => {
        if(schema) {

            return (
                <Card style={styles.card}>
                    <p>Name: {schema.name}</p>
                    <p>Version: {schema.version}</p>                    
                    Attributes:
                    <ul>
                        {schema.attrNames.map(attr => {
                            return <li key={attr}>{attr}</li>
                        })}
                    </ul>
                </Card>
            )
        }
        else return null
    } 

    return (

        <div style={styles.pageMargin}>

            <div style={styles.form}>
                <h3>Get a Schema</h3>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={1}>
                        <TextField 
                            required
                            variant="outlined"
                            margin="normal"
                            type="text"
                            id="schema"
                            label="Schema"
                            name="schema"
                            placeholder='Leave this blank for a new random DID' 
                            autoFocus
                            value={schemaId}
                            onChange={e => setSchemaId(e.target.value)}
                            style={styles.input}
                        />
                        <Button 
                            type="submit"
                            variant="contained"
                            color="primary" 
                            style={styles.btn}
                        >Get
                        </Button>
                    </Grid>
                    <Grid>
                        {renderSchema()}
                    </Grid>
                </form>
            </div>
        </div>
    )
}

// Styles

const styles = {
    form: {
        margin: 30
    },
    btn: {
        height: 40,
        margin: 22,
    },
    input: {
        width: '400px',
    },
    table: {
        margin: 30,
        width: '500px',
    },
    pageMargin: {
        margin: 30,
    },
    card: {
        width: '200px',
        padding: 20,
        margin: 20
    }
}


const mapStateToProps = (state) => {
    return {
        accessToken: state.accessToken
    }
}
  
export default connect(mapStateToProps)(GetSchema)