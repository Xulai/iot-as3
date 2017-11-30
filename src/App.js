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
        console.log(this.state.devices);
      }) 
      .catch(function (error) {
        console.log(error);
      });

    DeviceHelper.get()
      .then(response =>  {
        console.log(response)
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

    const { devices } = this.state;


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
            /* For every device in the devices object, create a tab with its info */
            Object.keys(this.state.devices).map((item, i) => (

            /* TODO: for some reason this.state.devices.item as devices prop doesn't work */
            <Tab eventKey={i} title={item} key={i} name={item}>
              <Devices devices={this.state.devices.hydrometer}></Devices>
            </Tab>
          )
        )}  
        </Tabs>
      </div>
    );
  }
}

export default App;
