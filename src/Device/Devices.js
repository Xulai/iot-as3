import React, { Component } from 'react';
import {ListGroup, ListGroupItem} from 'react-bootstrap/lib';
import DeviceGraph from './DeviceGraph';
import './Devices.css';

class Devices extends Component {
  render() {
    return (
      <ListGroup>
        {this.props.devices ? this.props.devices.map((row, index) => 
          <ListGroupItem key={index}>
            <DeviceGraph sampleRate={this.props.sampleRate} device={row} name={this.props.name}/>
          </ListGroupItem>
        ) : <p>Still Loading</p>}
      </ListGroup>
    );
  }
}

export default Devices;
