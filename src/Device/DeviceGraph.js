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
