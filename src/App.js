import React, { Component } from 'react';
import logo from './logo.svg';
import * as SiteHelper from './DataHelper/SiteHelper';
import * as DeviceHelper from './DataHelper/DeviceHelper';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import Devices from './Device/Devices';
import LocMap from './Map/LocMap';
import _ from "lodash";
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sites: [],
      devices: {},
    };

    SiteHelper.get()
      .then(response => {
        this.setState({ 
          sites: response.data,
          devices: this.state.devices
        });
        console.log(response.data);
      }) 
      .catch(function (error) {
        console.log(error);
      });

    DeviceHelper.get()
      .then(response =>  {
        this.setState({ 
          sites: this.state.sites,
          devices: response.data
        });
      }) 
      .catch(error => {
        console.log(error);
      });
  }

  handleClick = () => {
    console.log('clicked on!');
  }

  render() {

    const { devices, sites } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Graph Test</h1>
        </header>
        <p className="App-intro">
          Simple test with graphs
        </p>
        <Tabs id="blah" defaultActiveKey={2}>
          { 
            /* For every device in the devices object */
            Object.keys(this.state.devices).map((item, i) => (
              /* Create a tab with its info */
              <Tab eventKey={i} title={item} key={i} name={item}>
                <Devices devices={this.state.devices[item]} name={item}></Devices>
              </Tab>
            ))
          }  
          <Tab eventKey={5} title={"Map"} key={5} name={"Map"}>
            { !_.isEmpty(this.state.devices) && !_.isEmpty(this.state.sites) 
              ? <LocMap devices={this.state.devices} sites={this.state.sites}></LocMap>
              : <p> Loading! </p>
            }
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default App;
