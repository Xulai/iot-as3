import React, { Component } from 'react';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import DeviceGraph from './DeviceGraph';
import './Devices.css';

class Devices extends Component {
  render() {
    return (
      <ListGroup>
        {this.props.devices ? this.props.devices.map((row, index) => 
          <ListGroupItem key={index}>
            <DeviceGraph device={row} />
          </ListGroupItem>
        ) : <p>Still Loading</p>}
      </ListGroup>
    );
  }
}

export default Devices;
