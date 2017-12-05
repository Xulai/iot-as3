import React, { Component } from 'react';
import _ from "lodash";
import * as DeviceHelper from '../DataHelper/DeviceHelper';
import './DeviceGraph.css';

import { Charts, ChartContainer, ChartRow, YAxis, LineChart } from "react-timeseries-charts";
import { Index, TimeSeries } from "pondjs";
import * as moment from 'moment';


class DeviceGraph extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      samples: [],
      error: false,
    };
  }

  componentDidMount() {
    this.getValues();
    //console.log('mounted');
  }

  getValues() {

    DeviceHelper.showSampleRate(this.props.device, "10minute")
    .then(response => {

      var sensorName;
      var values;
      var data;

      if(this.props.name === "lumosity") {
        sensorName = "light";
        values = response.data.light_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
        data = {
          "name": "Light values",
          "columns": ["time", "value"],
          "points": values
        };		
      } else if(this.props.name === "gas") {
        sensorName = "gas";
        values = response.data.gas_values.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
        data = {
        "name": "CO2 Generator",
        "columns": ["time", "value"],
        "points": values
		  };
      } else if(this.props.name === "solar") {
        sensorName = "solar";
        values = response.data.solar_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
        data = {
          "name": "Solar values",
          "columns": ["time", "value"],
          "points": values
        };
      } else if(this.props.name === "hydrometer") {
        sensorName = "hydrometer";
        values = response.data.moisture_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
        data = {
          "name": "Soil moisture values",
          "columns": ["time", "value"],
          "points": values
        };
      } else if(this.props.name === "tempHumid") {
        sensorName = "Temperature and Humidity";
        values = response.data.temperature_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
        data = {
          "name": "Temperature",
          "columns": ["time", "value"],
          "points": values
        };
        
        //Don't think this is actually doing anything here - Trying to create both temp graphs and humidity graphs on the same page
        var humidityValues = response.data.humidity_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
        var humidityData = {
          "name": "Humidity",
          "columns": ["time", "value"],
          "points": humidityValues
        };
        
        this.setState({
          samples: new TimeSeries(humidityData),
          error: false,
        });
      }

      var find = `${sensorName}_values`;

      var series = new TimeSeries(data);

      this.setState({ 
        samples: series,
        error: false,
      });

    }) 
    .catch(error =>  {
      this.setState({ 
        samples: [],
        error: true,
      });
      console.log(error);
    });
  }
  
  render() {

    const { samples, error } = this.state;

    return (
      <div>{ samples.length != 0 && !error 
      ? 
      <div class="center-block" style={{width:"700px"}}>
        <h3>{this.props.device}</h3>
        <ChartContainer test={samples} timeRange={samples.timerange()} width={700}>
            <ChartRow height="300">
                <YAxis id="axis1" label="" min={samples.min()} max={samples.max()} width="100" type="linear" format=",.2f"/>
                <Charts>
                    <LineChart axis="axis1" series={samples}/>
                </Charts>
            </ChartRow>
        </ChartContainer>
      </div>
       : <p>Loading Graph</p>}
      </div>
    );
  }
}

export default DeviceGraph;
