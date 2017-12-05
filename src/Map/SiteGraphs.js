import React, { Component } from 'react';
import {ListGroup, ListGroupItem} from 'react-bootstrap/lib';
import DeviceGraph from '../Device/DeviceGraph';
import './SiteGraphs.css';

class SiteGraphs extends Component {
  render() {
    const { sampleRate, devices } = this.props;
    return (
        <ListGroup>
        {devices ? devices.map((row, index) => 
          <ListGroupItem key={index}>
            <DeviceGraph callback={this.props.callback} sampleRate={sampleRate} device={row.id} name={"lumosity"}/>
          </ListGroupItem>
        ) : <p>No location selected</p>}
        </ListGroup>
    );
  }
}

export default SiteGraphs;
