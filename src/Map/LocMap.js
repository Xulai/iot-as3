import React, { Component } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"
import axios from 'axios';
import {Tabs, Tab, ListGroup, ListGroupItem} from 'react-bootstrap/lib';
import _ from "lodash";
import * as DeviceHelper from '../DataHelper/DeviceHelper';
import SiteGraphs from './SiteGraphs';
import FarmMap from './FarmMap';
import './LocMap.css';

class LocMap extends Component {

  constructor(props) {
    super(props);

    this.state = {
      devices: null,
      activeSite: null,
      activeDevices: null,
      message: 'meh'
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
              devices: results.map(r => r.data)
            });
          });
  }

  switchGraphs = (siteId) => {
    if(this.state.devices) {

      var activeDevices = [];
      this.state.devices.map((device) => {
        if(device.site_id === siteId) {
          activeDevices.push(device);
        }
      });

      this.setState({ 
        activeSite: _.find(this.props.sites, {id: siteId}),
        activeDevices: activeDevices
      });
    }
  }

  
  changeMessage = (text) => {
    this.setState({
      message: text
    })

    console.log(this.state.message);
  }
  
  render() {
      
    const { devices, activeSite, activeDevices } = this.state;
    return (
        <div className="container">
          <div className="center-block" style={{height:"400px",width:"800px"}}>
            <FarmMap
                googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `400px`, width: `800px` }} />}
                mapElement={<div style={{ height: `100%` }} />} 
                sites={this.props.sites} 
                devices={devices} 
                switchGraphs={this.switchGraphs}
            />
          </div>
          {
            !_.isEmpty(activeSite)
            ? <Tabs id="blah" defaultActiveKey={0}>
                  <Tab eventKey={0} title={"All"} key={0} name={"All"}><SiteGraphs sampleRate={this.props.sampleRate} devices={activeDevices}/></Tab>
                  { !_.isEmpty(activeSite.zones) 
                    ?  activeSite.zones.map((zone, index) => 
                        <Tab eventKey={index+1} title={zone.name} key={index+1} name={zone.name}>
                          <SiteGraphs callback={this.changeMessage} sampleRate={this.props.sampleRate} devices={_.filter(activeDevices, {zone_id: zone.id})}/>
                        </Tab>
                      ) 
                    : null
                  }
              </Tabs>
            : <p>Pick a Location</p>
          }
        </div>
    );
  }
}

export default LocMap;
