import React, { Component } from 'react';
import _ from "lodash";
import * as DeviceHelper from '../DataHelper/DeviceHelper';
import LineChart from 'recharts/lib/chart/LineChart';
import XAxis from 'recharts/lib/cartesian/XAxis';
import YAxis from 'recharts/lib/cartesian/YAxis';
import Line from 'recharts/lib/cartesian/Line';
import CartesianGrid from 'recharts/lib/cartesian/CartesianGrid';
import Tooltip from 'recharts/lib/component/Tooltip';
import Legend from 'recharts/lib/component/Legend';
import './DeviceGraph.css';

class DeviceGraph extends Component {
  constructor(props) {
    super(props);
    var self = this;
    
    self.state = {
      samples: [],
      error: false,
    };

    DeviceHelper.showSampleRate(this.props.device, "minute")
    .then(function (response) {


      var data = _.map(response.data.moisture_value, function(arr) {
          return _.keyBy(arr, function(o) {
            return o ? 'value' : 'timestamp';
        });
      });

      //console.log(this.state.samples);

      self.setState({ 
        samples: data,
        error: false,
      });

      //console.log(this.state.samples);
    }) 
    .catch(function (error) {
      self.setState({ 
        samples: self.state.samples,
        error: true,
      });
      console.log(error);
    });
  }
  
  render() {

    //console.log(this.state.samples);

    return (
      <div>{ this.state.samples && !this.state.error
        ?  <LineChart width={600} height={300} data={this.state.samples} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
            <XAxis dataKey="timestamp"/>
            <YAxis dateKey/>
            <CartesianGrid strokeDasharray="3 3"/>
            <Tooltip/>
            <Legend />
            <Line type="monotone" dataKey="value" dot={false} stroke="#8884d8"/>
            </LineChart>
        : <p>Loading Graph</p>}</div>
      
    );
  }
}

export default DeviceGraph;
