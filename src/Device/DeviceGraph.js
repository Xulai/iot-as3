import React, { Component } from 'react';
import _ from "lodash";
import * as DeviceHelper from '../DataHelper/DeviceHelper';
import CheckRange from '../CheckRange';
import './DeviceGraph.css';

import { Charts, ChartContainer, ChartRow, YAxis, LineChart } from "react-timeseries-charts";
import { Index, TimeSeries } from "pondjs";
import * as moment from 'moment';

class DeviceGraph extends Component {

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


  // getValues(sampleRate) {
  //   console.log(this.props.selectedDateRange);
  //   DeviceHelper.showSampleRate(this.props.device, sampleRate)
  //   .then(response => {

  //     var sensorName;
  //     var values;
  //     var data;

  //     if(!_.isEmpty(response.data.light_value)) {
  //       sensorName = "light";


  //       values = response.data.light_value;
    

  //       values = values.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);

  //       var diditwork = this.getDateRange(values, "Today");
  //       console.log(diditwork);


  //       //console.log(response.data.light_value);
  //       values = response.data.light_value.map(value => [parseInt(moment(value[0]).format('X')) * 1000, value[1]]);
  //       //values = this.movingAverage(values, 20);
  //       values = this.smoothValues(values);
  //       //values = this.checkAndFixAnomalousVals(values);
  //       data = {
  //         "name": "Light values",
  //         "columns": ["time", "value"],
  //         "points": values
  //       };		
  //     } else if(!_.isEmpty(response.data.gas_values)) {
  //       sensorName = "gas";
  //       values = response.data.gas_values.map(value => [parseInt(moment(value[0]).format('X')) * 1000, value[1]]);
  //       values = this.smoothValues(values);
  //       data = {
  //       "name": "CO2 Generator",
  //       "columns": ["time", "value"],
  //       "points": values
		//   };
  //     } else if(!_.isEmpty(response.data.solar_value)) {
  //       sensorName = "solar";
  //       values = response.data.solar_value.map(value => [parseInt(moment(value[0]).format('X')) * 1000, value[1]]);
  //       values = this.smoothValues(values);
  //       data = {
  //         "name": "Solar values",
  //         "columns": ["time", "value"],
  //         "points": values
  //       };
  //     } else if(!_.isEmpty(response.data.moisture_value)) {
  //       sensorName = "hydrometer";
  //       values = response.data.moisture_value.map(value => [parseInt(moment(value[0]).format('X')) * 1000, value[1]]);
  //       values = this.smoothValues(values);
  //       data = {
  //         "name": "Soil moisture values",
  //         "columns": ["time", "value"],
  //         "points": values
  //       };
  //     } else if(!_.isEmpty(response.data.temperature_value)) {
  //       sensorName = "Temperature and Humidity";
  //       values = response.data.temperature_value.map(value => [parseInt(moment(value[0]).format('X')) * 1000, value[1]]);
  //       values = this.smoothValues(values);
  //       data = {
  //         "name": "Temperature",
  //         "columns": ["time", "value"],
  //         "points": values
  //       };
        
  //       var humidityValues = response.data.humidity_value.map(value => [parseInt(moment(value[0]).format('X')) * 1000, value[1]]);
  //       humidityValues = this.smoothValues(humidityValues)
  //       var humidityData = {
  //         "name": "Humidity",
  //         "columns": ["time", "value"],
  //         "points": humidityValues
  //       };

  //       this.setState({
  //         samples2: new TimeSeries(humidityData),
  //         //samplesTimeRange2: this.getTimeRange(humidityValues),
  //         error: false,
  //       });
  //     }

  //     var series = new TimeSeries(data);
              
  //     let combinedSeries = null;
      
  //     if(!_.isEmpty(this.state.samples2)) {
  //       combinedSeries = TimeSeries.timeSeriesListMerge({
  //           name: "combination",
  //           seriesList: [series, this.state.samples2]
  //       });
  //     } else if (!_.isEmpty(series)) {
  //       combinedSeries = series;
  //     }

  //     this.setState({ 
  //       combinedSeries: combinedSeries, 
  //       samples: series,
  //       //samplesTimeRange: this.getTimeRange(values),
  //       acceptableVariance: this.checkAcceptableVariance(),
  //       error: false,
  //     });
  //     //console.log(this.state.samples.timerange());
  //   }) 
  //   .catch(error =>  {
  //     this.setState({
  //       combinedSeries: null, 
  //       samples: null,
  //       samples2: null,
  //       //samplesTimeRange: null,
  //       //samplesTimeRange2: null,
  //       acceptableVariance: null,
  //       error: true,
  //     });
  //     console.log(error);
  //   });
  // }
  
  render() {
    const { sampleRate, device, type} = this.props;
    const samples = this.props[this.getSampleRateString(sampleRate)];

    return (
      <div>{ !_.isEmpty(samples)
      ? 
        <div className="" style={{width:"400px"}}>
        <h3>{device.name} - {type}</h3>
        { 
          device.error !== true && samples.sizeValid() > 0
          ? 
            <div>
              {
                samples.sizeValid() < (samples.size() - samples.size()/4)  ? <p>There are some intermittent errors with the sensor</p> : null
              }
              <ChartContainer test={samples} timeRange={samples.timerange()} width={700}>
                  <ChartRow height="300">
                      <YAxis id="axis1" label="" min={samples.min()} max={samples.max()} width="100" type="linear" format=",.2f"/>
                      <Charts>
                          <LineChart axis="axis1" series={samples}/>
                      </Charts>
                  </ChartRow>
              </ChartContainer>
            </div>
          : <p>There was an error loading the device data, please check on the device</p>
        }
        </div>
      : <p>Loading Graph</p>}
      </div>
    );
  }
}

export default DeviceGraph;
