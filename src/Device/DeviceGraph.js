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
      error: false
    };
  }

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
    const { error } = this.state;
    const { sampleRate, device } = this.props;
    const samples = this.props[this.getSampleRateString(sampleRate)]

    return (
      <div>{ !_.isEmpty(samples) && !error 
      ? <div className="center-block" style={{width:"700px"}}>
          <h3>{this.props.device.name} - {this.props.type}</h3>
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
