import React, { Component } from 'react';
import _ from "lodash";
import * as DeviceHelper from '../DataHelper/DeviceHelper';
import CheckRange from '../CheckRange';
import './DeviceGraph.css';

import { Charts, ChartContainer, ChartRow, YAxis, LineChart } from "react-timeseries-charts";
import { Index, TimeSeries } from "pondjs";
import * as moment from 'moment';

class DeviceGraph extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      combinedSeries: null, 
      samples: null,
      samples2: null,
      error: false,
      text: 'testing message!'
    };
  }

  componentDidMount() {
    this.getValues(this.props.sampleRate);
    //console.log('mounted');
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.sampleRate !== this.props.sampleRate) {
      this.getValues(nextProps.sampleRate);
    }
  }


  getValues(sampleRate, props) {
    DeviceHelper.showSampleRate(this.props.device, sampleRate)
    .then(response => {

      var sensorName;
      var values;
      var data;

      console.log(this.props.callback);
      if(this.props.device === 'gh2_co2Production_gas' && this.props.callback) {
        this.props.callback("it worked");
      }

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
  
  render() {

    const { combinedSeries, samples, samples2, error } = this.state;
    return (
      <div>{ !_.isEmpty(samples) && !error 
      ? 
      <div className="center-block" style={{width:"700px"}}>
        <h3>{this.props.device}</h3>
        <ChartContainer test={samples} timeRange={samples.timerange()} width={700}>
            <ChartRow height="300">
                <YAxis id="axis1" label="" min={samples.min()} max={samples.max()} width="100" type="linear" format=",.2f"/>
                <Charts>
                    <LineChart axis="axis1" series={samples}/>
                    {//!_.isEmpty(samples2) ? <LineChart axis="axis2" series={samples2}/> : null
                    }
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
