import React, { Component } from 'react';
import logo from './logo.svg';
import * as SiteHelper from './DataHelper/SiteHelper';
import * as DeviceHelper from './DataHelper/DeviceHelper';
import {Tabs, Tab, FormGroup, FormControl} from 'react-bootstrap/lib';
import Devices from './Device/Devices';
import LocMap from './Map/LocMap';
import _ from "lodash";
import CheckRange from './CheckRange';
import { Index, TimeSeries } from "pondjs";
import * as moment from 'moment';


import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sampleRate: "hour",
      sites: [],
      devices: [],
      deviceTypes: {},
      "30sec": {},
      minute: {},
      "10minute": {},
      hour: {}
    };
  }

  componentWillMount() {
    SiteHelper.get()
      .then(response => {
        this.setState({ 
          sites: response.data
        });
      }) 
      .catch(function (error) {
        console.log(error);
      });

    DeviceHelper.get()
      .then(response =>  {
        let devices = [];

        Object.keys(response.data).map(deviceType => {
          response.data[deviceType].map(device => {
            devices.push({
              name: device,
              type: deviceType,
            });
          })
        });

        this.setState({ 
          deviceTypes: response.data,
          devices: devices
        });

        this.getAllValues();
      }) 
      .catch(error => {
        console.log(error);
      });
  }

  getAllValues(sampleRate) {
    if(_.isEmpty(sampleRate)) {
      sampleRate = this.state.sampleRate;
    }
    
    this.state.devices.map(device => this.getValues(device.name, sampleRate));
  }

  getValues(device, sampleRate) {
    var requestRate = sampleRate;
    if(requestRate === "30sec") {
      requestRate = "minute";
    }

    DeviceHelper.showSampleRate(device, requestRate)
      .then(response => {
        this.formatValues(response.data, device, sampleRate);
      }) 
      .catch(error =>  {
        console.log(error);
      });
  }

  formatValues(responseData, device, sampleRate) {
    var newState = {}, values, data;
    newState[sampleRate] = _.cloneDeep(this.state[sampleRate]); 

    if(!_.isEmpty(responseData.light_value)) {
      if(sampleRate === "30sec") {
        responseData.light_value = responseData.light_value.filter(function(_, i) {
          return (i + 1) % 2;
        })          
      }

      values = responseData.light_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
      data = {
        "name": "Light values",
        "columns": ["time", "value"],
        "points": values
      };    
      newState[sampleRate][device] = new TimeSeries(data);
    } else if(!_.isEmpty(responseData.gas_values)) {
      if(sampleRate === "30sec") {
        responseData.gas_values = responseData.gas_values.filter(function(_, i) {
          return (i + 1) % 2;
        })          
      }

      values = responseData.gas_values.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
      data = {
        "name": "CO2 Generator",
        "columns": ["time", "value"],
        "points": values
      };
      newState[sampleRate][device] = new TimeSeries(data);
    } else if(!_.isEmpty(responseData.solar_value)) {
      if(sampleRate === "30sec") {
        responseData.solar_value = responseData.solar_value.filter(function(_, i) {
          return (i + 1) % 2;
        })          
      }

      values = responseData.solar_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
      data = {
        "name": "Solar values",
        "columns": ["time", "value"],
        "points": values
      };
      newState[sampleRate][device] = new TimeSeries(data);
    } else if(!_.isEmpty(responseData.moisture_value)) {
      if(sampleRate === "30sec") {
        responseData.moisture_value = responseData.moisture_value.filter(function(_, i) {
          return (i + 1) % 2;
        })          
      }

      values = responseData.moisture_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
      data = {
        "name": "Soil moisture values",
        "columns": ["time", "value"],
        "points": values
      };
      newState[sampleRate][device] = new TimeSeries(data);
    } else if(!_.isEmpty(responseData.temperature_value)) {
      if(sampleRate === "30sec") {
        responseData.temperature_value = responseData.temperature_value.filter(function(_, i) {
          return (i + 1) % 2;
        })          
        responseData.humidity_value = responseData.humidity_value.filter(function(_, i) {
          return (i + 1) % 2;
        })          
      }

      values = responseData.temperature_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
      data = {
        "name": "Temperature",
        "columns": ["time", "value"],
        "points": values
      };

      var humidityValues = responseData.humidity_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
      var humidityData = {
        "name": "Humidity",
        "columns": ["time", "value"],
        "points": humidityValues
      };

      newState[sampleRate][device + "_temperature"] = new TimeSeries(data);
      newState[sampleRate][device + "_humidity"] = new TimeSeries(humidityData);
    }
    this.setState(newState);
  }

  changeSampleRate = (event) => {
    let newRate = event.target.value;

    this.setState({sampleRate: newRate});

    if(_.isEmpty(this.state[newRate]))
      this.getAllValues();
  }

  render() {
    const { deviceTypes, devices, sites, sampleRate} = this.state;
    
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Cooksey's Farm</h1>
        </header>
        <FormGroup style={{width: "200px"}} controlId="formControlsSelect">
          <FormControl componentClass="select" defaultValue="hour" onChange={this.changeSampleRate}>
            <option value="30sec">30sec</option>
            <option value="minute">minute</option>
            <option value="10minute">10minute</option>
            <option value="hour">hour</option>
          </FormControl>
        </FormGroup>
        {/* <Tabs id="viewTabs" defaultActiveKey={5}>
          { 
            Object.keys(devices).map((item, i) => (
              <Tab eventKey={i} title={item} key={i} name={item}>
                <Devices sampleRate={sampleRate} devices={_.filter(devices, ['type', item])} name={item}></Devices>
              </Tab>
            ))
          }  
          <Tab eventKey={5} title={"Map"} key={5} name={"Map"}>
            { !_.isEmpty(devices) && !_.isEmpty(sites) 
              ? <LocMap sites={sites} deviceTypes={deviceTypes} devices={devices}></LocMap>
              : <p> Loading! </p>
            }
          </Tab>
        </Tabs> */}
      </div>
    );
  }
}

export default App;
