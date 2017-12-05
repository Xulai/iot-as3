import React, { Component } from 'react';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import DeviceGraph from '../Device/DeviceGraph';
import './SiteGraphs.css';

class SiteGraphs extends Component {
  render() {
    const { devices } = this.props;

    return (
        <ListGroup>
        {devices ? devices.map((row, index) => 
          <ListGroupItem key={index}>
            <DeviceGraph device={row.id} name={"lumosity"}/>
          </ListGroupItem>
        ) : <p>No location selected</p>}
        </ListGroup>
    );
  }
}

export default SiteGraphs;
