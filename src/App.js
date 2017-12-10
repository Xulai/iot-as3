import React, { Component } from 'react';
import logo from './logo.svg';
import * as SiteHelper from './DataHelper/SiteHelper';
import * as DeviceHelper from './DataHelper/DeviceHelper';
import {Tabs, Tab, FormGroup, FormControl} from 'react-bootstrap/lib';
import Devices from './Device/Devices';
import LocMap from './Map/LocMap';
import _ from "lodash";
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sampleRate: "10minute",
      sites: [],
      devices: {},
      dateRanges: ["Today", "This week", "This month"],
      selectedDateRange: "Today"
    };

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
        this.setState({ 
          devices: response.data
        });
      }) 
      .catch(error => {
        console.log(error);
      });    
  }

  adjustRangeDependingOnSampleRate = () => {
    if(this.state.sampleRate === "10minute") {
      this.setState({
        dateRanges: ["Today", "This week"]
      });
      console.log(this.state.dateRanges);
    } else if(this.state.sampleRate === "minute") {
      this.setState({
        dateRanges: ["Today"]
      });
      console.log(this.state.dateRanges);
    } else if(this.state.sampleRate === "hour") {
      this.setState({
        dateRanges: ["Today", "This week", "This month"]
      });
      console.log(this.state.dateRanges);
    }
  }

  render() {

    const { devices, sites, dateRanges, selectedDateRange } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Graph Test</h1>
        </header>
        <p className="App-intro">
          Simple test with graphs
        </p>
        <FormGroup style={{width: "200px"}} controlId="formControlsSelect">
          <FormControl componentClass="select" defaultValue="10minute" onChange={event => { this.setState({sampleRate: event.target.value}); this.adjustRangeDependingOnSampleRate(); }}>
            <option value="minute">minute</option>
            <option value="10minute">10minute</option>
            <option value="hour">hour</option>
          </FormControl>
        </FormGroup>

        <FormGroup style={{width: "200px"}} controlId="formControlsSelect">
          <FormControl componentClass="select" defaultValue="Today" onChange={event => { this.setState({selectedDateRange: event.target.value}); }}>
            {
              dateRanges.map((range, i) => <option key={i} value={range}>{range}</option>)
            }
          </FormControl>
        </FormGroup>
        <Tabs id="viewTabs" defaultActiveKey={5}>
          { 
            /* For every device in the devices object */
            Object.keys(this.state.devices).map((item, i) => (
              /* Create a tab with its info */
              <Tab eventKey={i} title={item} key={i} name={item}>
                <Devices sampleRate={this.state.sampleRate} devices={this.state.devices[item]} name={item}></Devices>
              </Tab>
            ))
          }  
          <Tab eventKey={5} title={"Map"} key={5} name={"Map"}>
            { !_.isEmpty(this.state.devices) && !_.isEmpty(this.state.sites) 
              ? <LocMap selectedDateRange={selectedDateRange} sampleRate={this.state.sampleRate} devices={this.state.devices} sites={this.state.sites}></LocMap>
              : <p> Loading! </p>
            }
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default App;
