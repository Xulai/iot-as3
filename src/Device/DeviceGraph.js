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
      error: false
    };
  }

  // componentDidMount() {
  //   this.getValues(this.props.sampleRate);
  //   //console.log('mounted');
  // }
  // componentWillReceiveProps(nextProps) {
  //   if(nextProps.sampleRate !== this.props.sampleRate) {
  //     this.getValues(nextProps.sampleRate);
  //   }
  // }


  
  
  render() {

    const { combinedSeries, samples, samples2, error } = this.props;
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
