import React, { Component } from 'react';
import {ListGroup, ListGroupItem} from 'react-bootstrap/lib';
import _ from "lodash";
import DeviceGraph from './DeviceGraph';
import './Devices.css';

class Devices extends Component {

  shouldComponentUpdate(nextProps) {
    const sampleRate = this.props.sampleRate;
    return true;
    // console.log();
    // return nextProps.sampleRate !== sampleRate
    //   || _.isEqual(nextProps[this.getSampleRateString(sampleRate)], this.props[this.getSampleRateString(sampleRate)]);
  }
  
  getSampleRateString(sampleRate) {
    switch (sampleRate) {
      case "30sec":
        return "thirtysec";
      case "10minute":
        return "tenminute";
      default:
        return sampleRate;
    }
  }

  render() {
    return (
      <ListGroup>
        {!_.isEmpty(this.props.devices) ? this.props.devices.map((device, index) => {
          if(device.type === "tempHumid") {return [
            <ListGroupItem key={device + "_temperature"}>
              <DeviceGraph 
                sampleRate={this.props.sampleRate} 
                device={device} 
                type={"temp"}
                thirtysec={this.props.thirtysec[device.id + "_temperature"]} 
                minute={this.props.minute[device.id + "_temperature"]} 
                tenminute={this.props.tenminute[device.id + "_temperature"]} 
                hour={this.props.hour[device.id + "_temperature"]} 
              />
            </ListGroupItem>,
            <ListGroupItem key={device + "_humidity"}>
              <DeviceGraph 
                sampleRate={this.props.sampleRate} 
                device={device} 
                type={"humid"}
                thirtysec={this.props.thirtysec[device.id + "_humidity"]} 
                minute={this.props.minute[device.id + "_humidity"]} 
                tenminute={this.props.tenminute[device.id + "_humidity"]} 
                hour={this.props.hour[device.id + "_humidity"]} 
              />
            </ListGroupItem>
          ];} else {
           return <ListGroupItem key={index}>
              <DeviceGraph 
                sampleRate={this.props.sampleRate} 
                device={device} 
                type={device.type}
                thirtysec={this.props.thirtysec[device.id]} 
                minute={this.props.minute[device.id]} 
                tenminute={this.props.tenminute[device.id]} 
                hour={this.props.hour[device.id]} 
              />
            </ListGroupItem>;
           }
        }) : <p>Still Loading</p>}
      </ListGroup>
    );
  }
}

export default Devices;
