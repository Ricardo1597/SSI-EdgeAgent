import React, { Component } from 'react'
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';


export class CredentialItem extends Component {

    getValidityStyle = () => {
        var daysLeft = Math.ceil(Math.abs(this.props.credential.validity - new Date()) / (1000 * 60 * 60 * 24));
        if( daysLeft < 0 ) return { backgroundColor: '#DCDCDC' }
        else if( daysLeft < 30 ) return { backgroundColor: '#FFA07A' }
        else if( daysLeft < 360 ) return { backgroundColor: '#FFFF00' }
        else return { backgroundColor: '#F0FFFF' }
    }


    render() {
        const { attrs, schema_id, cred_def_id } = this.props.credential
        const schemaParts = schema_id.split(':');
        const schemaName = schemaParts[2];
        const schemaVersion = schemaParts[3];
        const issuer = cred_def_id.split(':')[0];
        return (
            <Card style={styles.root}>
                <Card.Body>
                    <Card.Title>Schema name: {schemaName}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">Schema version: {schemaVersion}</Card.Subtitle>
                    Issuer: {issuer}
                    <div>
                        Attributes:
                        <ul>
                            {Object.keys(attrs).map(attr => (
                                <li key={attr}>{attr}: {attrs[attr]}</li>
                            ))}
                        </ul>
                    </div>
                </Card.Body>
            </Card>
        )
    }
}

// Prop types
CredentialItem.propTypes = {
    credential: PropTypes.object.isRequired
}


const styles = {
    root: {
        maxWidth: 350,
        borderRadius: 20,
        margin: 20,
    },
    content: {
        padding: 24,
    },
    item: {
        width: '20%',
        padding: 10,
        margin: 10
    }
}


export default CredentialItem
 