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
      sampleRate: "10minute",
      sites: [],
      devices: {},
      combinedSeries: null, 
      samples: null,
      samples2: null,
      error: false
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

        
        Object.keys(this.state.devices).map(device => {
          this.getValues("gh2_co2Production_gas", this.state.sampleRate);
        });
      }) 
      .catch(error => {
        console.log(error);
      });

      
  }

  

  getValues(device, sampleRate) {
      console.log('test');
      DeviceHelper.showSampleRate(device, sampleRate)
      .then(response => {


        var sensorName;
        var values;
        var data;

       // console.log(this.props.activeSite.id)

        
        var siteFilter = this.props.sites.filter(site => {
          return site.id == this.props.activeSite.id;
        });

        for(var data in response.data) {
          if (response.data.hasOwnProperty(data) && response.data.site_id === this.props.activeSite.id) {
            console.log(response.data[data]);
          }
        }

        // if(this.props.device === 'gh2_co2Production_gas' && this.props.callback) {
        //   this.props.callback("it worked");
        // }

        if(!_.isEmpty(response.data.light_value)) {
          sensorName = "light";
          values = response.data.light_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
          data = {
            "name": "Light values",
            "columns": ["time", "value"],
            "points": values
          };    
        } else if(!_.isEmpty(response.data.gas_values)) {
          sensorName = "gas";
          values = response.data.gas_values.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
          data = {
          "name": "CO2 Generator",
          "columns": ["time", "value"],
          "points": values
        };
        } else if(!_.isEmpty(response.data.solar_value)) {
          sensorName = "solar";
          values = response.data.solar_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
          data = {
            "name": "Solar values",
            "columns": ["time", "value"],
            "points": values
          };
        } else if(!_.isEmpty(response.data.moisture_value)) {
          sensorName = "hydrometer";
          values = response.data.moisture_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
          data = {
            "name": "Soil moisture values",
            "columns": ["time", "value"],
            "points": values
          };
        } else if(!_.isEmpty(response.data.temperature_value)) {
          sensorName = "Temperature and Humidity";
          values = response.data.temperature_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
          data = {
            "name": "Temperature",
            "columns": ["time", "value"],
            "points": values
          };
          
          <CheckRange values={data.points} low={7} high={29} />

          //Don't think this is actually doing anything here - Trying to create both temp graphs and humidity graphs on the same page
          var humidityValues = response.data.humidity_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
          var humidityData = {
            "name": "Humidity",
            "columns": ["time", "value"],
            "points": humidityValues
          };

          this.setState({
            samples2: new TimeSeries(humidityData),
            error: false,
          });
        }

        var series = new TimeSeries(data);
                
        let combinedSeries = null;
        
        if(!_.isEmpty(this.state.samples2)) {
          combinedSeries = TimeSeries.timeSeriesListMerge({
              name: "combination",
              seriesList: [series, this.state.samples2]
          });
        } else if (!_.isEmpty(series)) {
          combinedSeries = series;
        }

        this.setState({ 
          combinedSeries: combinedSeries, 
          samples: series,
          error: false,
        });

      }) 
      .catch(error =>  {
        this.setState({
          combinedSeries: null, 
          samples: null,
          samples2: null,
          error: true,
        });
        console.log(error);
      });
    }

  componentWillReceiveProps(nextProps) {
    if(nextProps.sampleRate !== this.props.sampleRate) {
      this.getValues(nextProps.sampleRate);
    }
  }

  render() {

    const { devices, sites, sampleRate, combinedSeries, samples, error } = this.state;
    sites.map(site => site.status = "All is fine");
    

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Cooksey's Farm</h1>
        </header>
        <FormGroup style={{width: "200px"}} controlId="formControlsSelect">
          <FormControl componentClass="select" defaultValue="10minute" onChange={event => { this.setState({sampleRate: event.target.value}); }}>
            <option value="minute">minute</option>
            <option value="10minute">10minute</option>
            <option value="hour">hour</option>
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
              ? <LocMap samples={samples} error={error} combinedSeries={combinedSeries} sampleRate={sampleRate} sites={sites} devices={this.state.devices} sites={this.state.sites}></LocMap>
              : <p> Loading! </p>
            }
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default App;
