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
      combinedSeries: null, 
      samples: null,
      samples2: null,
      error: false,
      acceptableVariance: null
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

  //Returns acceptable percentage variance between two values based on sample rate
  //Anything outside of this range will be treated as anomalous values
  checkAcceptableVariance() {
    const sampleRate = this.props.sampleRate;
    if(sampleRate === "minute")
      return 5; //+-5% acceptable variance
    else if(sampleRate === "10minute")
      return 20; //+-20% acceptable variance
    else if(sampleRate === "hour")
      return 100; //+-100% acceptable variance
  }


  isAnomalous(val1, val2)
  {
	  var var1Variance = (val1/100) * this.checkAcceptableVariance();
	  if(Math.abs(val1 - val2) > var1Variance) {
		 return true; 
	  }
	  return false;
  }

  // checkAndFixAnomalousVals(values) {
  //   var prePreviousValue;
	//   var middleValue;
	//   var currentValue;
  //   for(var i = 2; i < values.length; i++) {
  //     prePreviousValue = values[i-2][1];
  //     middleValue = values[i-1][1];
  //     currentValue = values[i][1];
  //     if(this.isAnomalous(prePreviousValue, middleValue) && this.isAnomalous(currentValue, middleValue)) { //this means that the middle value is out of range of both surrounding values
  //       //console.log([values[i-1][1], (prePreviousValue + currentValue) / 2]);
  //       //console.log([prePreviousValue, middleValue, currentValue]);
  //       values[i-1][1] = (prePreviousValue + currentValue) / 2; //set anomalous middle value to average of surrounding values
  //       //console.log(values[i-1][1]);
  //     }
  //   }
  //   return values;
  // }

  // findEndPosOfTimespan(values, startPos, timespan)
  // {
  //   var endOfArray = values.length-1;
  //   for(var position = startPos; position < endOfArray; position++)
  //   {
  //     if((values[position][0] - timespan) >= 0)
  //     {
  //       if (position >= endOfArray)
  //         return endOfArray-1; //so that we don't try to compare the current (end) value to the non-existant next value;
  //       else
  //         return position;
  //     }
  //   }
  //   return null;
  // }

  // findPosition(values, startTime)
  // {
  //   for(var position = 0; position < values.length; position++) 
  //   {
  //     if (values[position][0] >= startTime)
  //       // if (position === 0)
  //       //   return 1;
  //       // else
  //       return position;
  //   }
  //   return null;
  // }

  avgOfTimespan(values, timeSpan, startTime, pos)
  {
    var total = 0;
    var n = 0;
    var currentTime = values[pos][0];
    var endOfArray = values.length-1;
    while ((currentTime - startTime - timeSpan) <= 0) {
      total += values[pos][1];
      pos++;
      n++;
      if(pos >= endOfArray)
        return {
          "avg": total/n,
          "endPos": endOfArray-1 //so that we don't try to compare the current (end) value to the non-existant next value;
        };
      currentTime = values[pos][0];
    }
    return {
      "avg": total/n,
      "endPos": pos-1
    };
  }

  // calcAvg(values)
  // {
  //   var n = values.length;
  //   var total = 0;
  //   for(var i = 0; i < n; i++)
  //   {
  //     total += values[i];
  //   }
  //   return total/n;
  // }

  // movingAverage(values, sectionSize) {
  //   var smoothedValues = values.slice(0, values.length - sectionSize-1);
  //   //var currentAvgSection;
  //   //var sectionAvg;
  //   var sectionTotal;
  //   var n;
  //   for(var i = 0; i < values.length - sectionSize; i++)
  //   {
  //     n = 0;
  //     sectionTotal = 0;
  //     for(var pos = i; pos <= pos + sectionSize; pos++)
  //     {
  //       if(pos < values.length)
  //       {
  //         sectionTotal += values[pos][1];
  //         n++;
  //       }
  //     }
  //     smoothedValues[i][1] = sectionTotal/n;
  //     smoothedValues[i][0] = values[i][0];
  //   }
  //   return smoothedValues;
  // }

  smoothValues(values) {
    var timespan;
    var avgofTimespan;
    //var avg;
    var currentVal;
    var preVal;
    var nextVal;
    var startPos = 0;
    var startTime = values[0][0];
    if(this.props.sampleRate === "minute")
      timespan = 1000; // 1 second
    else if(this.props.sampleRate === "10minute")
      timespan = 5000; //10000; // 10 seconds
    else if(this.props.sampleRate === "hour")
      timespan = 60000; // 1 minute
    
    while(startTime <= values[values.length-1][0]){
      avgofTimespan = this.avgOfTimespan(values, timespan, startTime, startPos);
      //console.log(avgofTimespan.avg, values, timespan, startPos, avgofTimespan.endPos);
      for(var i = startPos; i <= avgofTimespan.endPos; i++)
      {
        //if(isAnomalous(values[i-1][0], values[i][0]) && isAnomalous(values[i+1][0], values[i][0]))
        if(i === 0)
          i++;
        preVal = values[i-1][1];
        currentVal = values[i][1];
        nextVal = values[i+1][1];
        //avg = (preVal + nextVal) / 2;
        if(this.isAnomalous(preVal, currentVal) || this.isAnomalous(nextVal, currentVal))//) > (avgofTimespan.avg / 10)) //difference is more than 10% of avgofTimespan
        {
          //console.log(values[i][1]);
          if((preVal - currentVal) > 0)
          {
            values[i][1] = preVal - (avgofTimespan.avg/10);
          }
          else
            values[i][1] = preVal + (avgofTimespan.avg/10);
        }
      }
      startPos = avgofTimespan.endPos;
      startTime += timespan;
    }
    return values;
  }

  getValues(sampleRate) {
    DeviceHelper.showSampleRate(this.props.device, sampleRate)
    .then(response => {

      var sensorName;
      var values;
      var data;

      if(!_.isEmpty(response.data.light_value)) {
        sensorName = "light";
        //console.log(response.data.light_value);
        values = response.data.light_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
        //values = this.movingAverage(values, 20);
        values = this.smoothValues(values);
        //values = this.checkAndFixAnomalousVals(values);
        data = {
          "name": "Light values",
          "columns": ["time", "value"],
          "points": values
        };		
      } else if(!_.isEmpty(response.data.gas_values)) {
        sensorName = "gas";
        values = response.data.gas_values.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
        values = this.smoothValues(values);
        data = {
        "name": "CO2 Generator",
        "columns": ["time", "value"],
        "points": values
		  };
      } else if(!_.isEmpty(response.data.solar_value)) {
        sensorName = "solar";
        values = response.data.solar_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
        values = this.smoothValues(values);
        data = {
          "name": "Solar values",
          "columns": ["time", "value"],
          "points": values
        };
      } else if(!_.isEmpty(response.data.moisture_value)) {
        sensorName = "hydrometer";
        values = response.data.moisture_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
        values = this.smoothValues(values);
        data = {
          "name": "Soil moisture values",
          "columns": ["time", "value"],
          "points": values
        };
      } else if(!_.isEmpty(response.data.temperature_value)) {
        sensorName = "Temperature and Humidity";
        values = response.data.temperature_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
        values = this.smoothValues(values);
        data = {
          "name": "Temperature",
          "columns": ["time", "value"],
          "points": values
        };
        
        var humidityValues = response.data.humidity_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);
        humidityValues = this.smoothValues(humidityValues)
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
        acceptableVariance: this.checkAcceptableVariance(),
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
