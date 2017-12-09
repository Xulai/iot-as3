import React, { Component } from 'react';
import axios from 'axios';
import {Tabs, Tab, ListGroup, ListGroupItem} from 'react-bootstrap/lib';
import _ from "lodash";
import * as DeviceHelper from '../DataHelper/DeviceHelper';
import Devices from '../Device/Devices';
import FarmMap from './FarmMap';
import CheckRange from '../CheckRange';
import './LocMap.css';

class LocMap extends Component {

  constructor(props) {
    super(props)

    this.state = {
      activeSite: null,
      activeDevices: null,
    };
  }

  switchGraphs = (siteId) => {
    if(this.props.devices) {
      var activeDevices = [];
      this.props.devices.map((device) => {
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
  
  render() {
    const { sites, sampleRate, devices, thirtysec, minute, tenminute, hour } = this.props;
    const { activeSite, activeDevices } = this.state;
    return (
        <div className="container">
          <div className="center-block" style={{height:"400px",width:"800px"}}>
            {
               !_.isEmpty(sites)
               ? <FarmMap
                   googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
                   loadingElement={<div style={{ height: `100%` }} />}
                   containerElement={<div style={{ height: `400px`, width: `800px` }} />}
                   mapElement={<div style={{ height: `100%` }} />} 
                   sites={sites} 
                   devices={devices} 
                   switchGraphs={this.switchGraphs}
               />
               : <p>Loading Map</p>
            }
          </div>
          <div className="status">Status: Fine</div>
          {
            !_.isEmpty(activeSite)
            ? <Tabs id="zoneTabs" defaultActiveKey={0}>
                  <Tab eventKey={0} title={"All"} key={0} name={"All"}>
                    <Devices 
                      sites={sites} 
                      sampleRate={sampleRate} 
                      devices={activeDevices}
                      thirtysec={thirtysec} 
                      minute={minute} 
                      tenminute={tenminute} 
                      hour={hour} 
                    />
                  </Tab>
                  { !_.isEmpty(activeSite.zones) 
                    ?  activeSite.zones.map((zone, index) => 
                        <Tab eventKey={index+1} title={zone.name} key={index+1} name={zone.name}>
                          <Devices 
                            sites={sites} 
                            sampleRate={sampleRate} 
                            devices={_.filter(activeDevices, {zone_id: zone.id})}
                            thirtysec={thirtysec} 
                            minute={minute} 
                            tenminute={tenminute} 
                            hour={hour} 
                          />
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
