import React, { Component } from 'react'
import PropTypes from 'prop-types';


export class CredentialItem extends Component {

    getValidityStyle = () => {
        var daysLeft = Math.ceil(Math.abs(this.props.credential.validity - new Date()) / (1000 * 60 * 60 * 24));
        if( daysLeft < 0 ) return { backgroundColor: '#DCDCDC' }
        else if( daysLeft < 30 ) return { backgroundColor: '#FFA07A' }
        else if( daysLeft < 360 ) return { backgroundColor: '#FFFF00' }
        else return { backgroundColor: '#F0FFFF' }
    }


    render() {
        const { name, issuer, validity } = this.props.credential
        return (
            <div style={{...this.getValidityStyle(), ...styles.item}}>
                <p> {name} </p>
                <p> {issuer} </p>
                <p> {validity.getDate()}-{validity.getMonth()}-{validity.getFullYear()} </p>

            </div>
        )
    }
}

// Prop types
CredentialItem.propTypes = {
    credential: PropTypes.object.isRequired
}


const styles = {
    item: {
        width: '20%',
        padding: 10,
        margin: 10
    }
}


export default CredentialItem
 