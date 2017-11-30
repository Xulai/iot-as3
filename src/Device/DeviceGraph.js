import React, { Component } from 'react';
import _ from "lodash";
import * as DeviceHelper from '../DataHelper/DeviceHelper';
// import LineChart from 'recharts/lib/chart/LineChart';
// import XAxis from 'recharts/lib/cartesian/XAxis';
// import YAxis from 'recharts/lib/cartesian/YAxis';
// import Line from 'recharts/lib/cartesian/Line';
// import CartesianGrid from 'recharts/lib/cartesian/CartesianGrid';
// import Tooltip from 'recharts/lib/component/Tooltip';
// import Legend from 'recharts/lib/component/Legend';
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
    console.log('mounted');
  }

  getValues() {

    DeviceHelper.showSampleRate(this.props.device, "10minute")
    .then(response => {

      var values = response.data.moisture_value.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);

      const data = {
          "name": "humidity",
          "columns": ["time", "value"],
          "points": values
      };

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
      <ChartContainer test={samples} timeRange={samples.timerange()} width={700}>
          <ChartRow height="300">
              <YAxis id="axis1" label="" min={samples.min()} max={samples.max()} width="100" type="linear" format="$,.2f"/>
              <Charts>
                  <LineChart axis="axis1" series={samples}/>
              </Charts>
          </ChartRow>
      </ChartContainer>
       : <p>Loading Graph</p>}
      </div>
    );
  }
}

export default DeviceGraph;
