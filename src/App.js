import React, { Component } from 'react';
import logo from './logo.svg';
import * as SiteHelper from './DataHelper/SiteHelper';
import * as DeviceHelper from './DataHelper/DeviceHelper';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import Devices from './Device/Devices';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    var self = this;

    self.state = {
      sites: [],
      devices: {},
    };

    SiteHelper.get()
      .then(function (response) {
        self.setState({ 
          sites: response.data,
          devices: self.state.devices
        });
      }) 
      .catch(function (error) {
        console.log(error);
      });

    DeviceHelper.get()
      .then(function (response) {
        console.log(response)
        self.setState({ 
          sites: self.state.sites,
          devices: response.data
        });
      }) 
      .catch(function (error) {
        console.log(error);
      });
  }

  handleClick = () => {
    console.log('clicked on!');
  }

  render() {
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
          <Tab eventKey={1} title="Gas" onClick={(e) => this.handleClick()}>
            <Devices devices={this.state.devices.gas}></Devices>
          </Tab> 
          <Tab eventKey={2} title="Hydro">
            <Devices devices={this.state.devices.hydrometer}></Devices>
          </Tab>
          {/* <Tab eventKey={3} title="Solar">
            <Devices devices={this.state.devices.solar}></Devices>
          </Tab>
          <Tab eventKey={4} title="Temperature/Humidity">
            <Devices devices={this.state.devices.tempHumid}></Devices>
          </Tab> */}
        </Tabs>
      </div>
    );
  }
}

export default App;
