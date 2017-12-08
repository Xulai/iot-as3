import React, { Component } from 'react';
import {ListGroup, ListGroupItem} from 'react-bootstrap/lib';
import DeviceGraph from '../Device/DeviceGraph';
import './SiteGraphs.css';

class SiteGraphs extends Component {
  render() {
    const { sampleRate, devices, callback, text, sites, activeSite, combinedSeries, samples, error } = this.props;

    

    return (
        <ListGroup>
        {devices ? devices.map((row, index) => 
          <ListGroupItem key={index}>
            <DeviceGraph error={error} combinedSeries={combinedSeries} samples={samples} activeSite={activeSite} sites={sites} callback={callback} sampleRate={sampleRate} device={row.id} name={"lumosity"}/>
          </ListGroupItem>
        ) : <p>No location selected</p>}
        </ListGroup>
    );
  }
}

export default SiteGraphs;
