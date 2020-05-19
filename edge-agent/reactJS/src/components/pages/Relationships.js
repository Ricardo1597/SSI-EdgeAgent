import React, { Component } from 'react'
import Card from 'react-bootstrap/Card';

import axios from 'axios'


class Relationships extends Component {
    state = {
        connections: [],
        connectionid: ''
    }

    componentWillMount() {
        const jwt = localStorage.getItem('my-jwt')

        axios.get('/connections/', {}, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            if (res.status === 200) {
                console.log(res.data)
                this.setState({
                    connections: res.data.allConnections
                })
            } else {
                const error = new Error(res.error);
                throw error;
            }
        })
        .catch(err => {
              console.error(err);
              alert('Error getting connections. Please try again.');
        });
    }

    getAction = (state) => {
        switch(state) {
            case 'invitation':
                return <Card.Link href="#">Accept Invitation</Card.Link>;
            case 'request':
                return <Card.Link href="#">Accept Request</Card.Link>;
            default:
                return;
        }
    }

    render() {
        return (
            <div>
                {this.state.connections.map(connection => (                    
                    <Card style={styles.root} key={connection.connection_id}>
                        <Card.Body>
                            <Card.Title>{connection.alias}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">{connection.created_at}</Card.Subtitle>
                            <Card.Text>
                                {connection.state}
                            </Card.Text>
                            <Card.Link href="#">Remove</Card.Link>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        )
    }
}

const styles = ({
    root: {
        maxWidth: 350,
        borderRadius: 20,
        margin: 20,
    },
    content: {
        padding: 24,
    },
});

export default Relationships
