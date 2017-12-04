import React, { Component } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"
import axios from 'axios';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import * as DeviceHelper from '../DataHelper/DeviceHelper';
import DeviceGraph from '../Device/DeviceGraph';
import './LocMap.css';

class LocMap extends Component {

  constructor(props) {
    super(props);

    this.state = {
      devices: null,
      activeDevices: null
    };
  }
 
  componentDidMount() {
    this.getDevices();
    //console.log('mounted');
  }

  getDevices() {
    let promises = [];

      let keys = Object.keys(this.props.devices);
      keys.map((key, index) => {
        this.props.devices[key].map((device) => {
          promises.push(DeviceHelper.show(device));
        });
      });
      
      axios.all(promises)
          .then((results) => {
            this.setState({ 
              devices: results.map(r => r.data),
              activeDevices: this.state.activeDevices
            });
          });
  }

  switchGraphs(siteId) {
    if(this.state.devices) {
      var activeDevices = [];
      this.state.devices.map((device) => {
        if(device.site_id === siteId) {
          activeDevices.push(device);
        }
      });

      this.setState({ 
        devices: this.state.devices,
        activeDevices: activeDevices
      });
    }
  }
  
  render() {
      
    const { devices, activeDevices } = this.state;

    var Map = withScriptjs(withGoogleMap(
        (props) => <GoogleMap
        zoom={16}
        center={{ lat: 51.3083, lng: 1.1036 }}
        defaultOptions={{
          disableDefaultUI: true,
          gestureHandling: 'none',
          zoomControl: false
        }} 
      >
          { 
              /* For each Site */
              this.props.sites.map((item, index) => (
              /* Create a marker */
                  <Marker key={index} label={item.id} position={{ lat: item.lat, lng: item.lon }}onClick={(e) => this.switchGraphs(item.id, e)} />
              ))
          }  
      </GoogleMap>));
    return (
        <div>
        <Map
            googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: `400px`, width: `800px` }} />}
            mapElement={<div style={{ height: `100%` }} />} 
        />
        {activeDevices ? activeDevices.map((row, index) => 
          <ListGroupItem key={index}>
            <DeviceGraph device={row.id} name={"lumosity"}/>
          </ListGroupItem>
        ) : <p>No locations selected</p>}
        </div>
    );
  }
}

export default LocMap;
