import React, { Component } from 'react';
import logo from './logo.svg';
import axios from 'axios';
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
      sampleRate: "hour",
      sites: [],
      //devices: {},
      dateRanges: ["Today", "This week", "This month"],
      selectedDateRange: "Today",
      devices: [],
      deviceTypes: {},
      "30sec": {},
      minute: {},
      "10minute": {},
      hour: {}
    };
  }


  /**
   * [componentWillMount description]
   * @return {[type]} [description]
   */
  componentWillMount() {
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

        this.getDevices(response.data) 
          .then((results) => {
            this.setState({ 
              deviceTypes: response.data,
              devices: results.map(r => _.assignIn(r.data, {type: this.getDeviceType(r.data, response.data)}))
            });
            console.log(this.state.devices);
            this.getAllValues();
          });
      }) 
      .catch(error => {
        console.log(error);
      });    
  }

  /**
   * [description]
   * @return {[type]} [description]
   */
  adjustRangeDependingOnSampleRate = (sampleRate) => {
    if(sampleRate === "10minute") {
      this.setState({
        dateRanges: ["Today", "This week"]
      });
      console.log(this.state.dateRanges);
    } else if(sampleRate === "minute") {
      this.setState({
        dateRanges: ["Today"]
      });
      console.log(this.state.dateRanges);
    } else if(sampleRate === "hour") {
      this.setState({
        dateRanges: ["Today", "This week", "This month"]
      });
      console.log(this.state.dateRanges);
    }
  }



  /**
   * [getDeviceType description]
   * @param  {[type]} device      [description]
   * @param  {[type]} deviceTypes [description]
   * @return {[type]}             [description]
   */
  getDeviceType(device, deviceTypes) {
    return _.findKey(deviceTypes, (item) => (item.indexOf(device.id) !== -1));
  }


  /**
   * [getDevices description]
   * @param  {[type]} deviceTypes [description]
   * @return {[type]}             [description]
   */
  getDevices(deviceTypes) {
    let promises = [];

    let keys = Object.keys(deviceTypes);
    keys.map((key, index) => {
      deviceTypes[key].map((device) => {
        promises.push(DeviceHelper.show(device));
      });
    });
    
    return axios.all(promises);
  }

  /**
   * [shouldComponentUpdate description]
   * @param  {[type]} nextProps [description]
   * @return {[type]}           [description]
   */
  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.state.devices, nextProps.devices);
  }
  
  /**
   * [getAllValues description]
   * @param  {[type]} sampleRate [description]
   * @return {[type]}            [description]
   */
  getAllValues(sampleRate) {
    if(_.isEmpty(sampleRate)) {
      sampleRate = this.state.sampleRate;
    }
    
    this.state.devices.map(device => this.getValues(device.id, sampleRate));
  }

  /**
   * [getValues description]
   * @param  {[type]} device     [description]
   * @param  {[type]} sampleRate [description]
   * @return {[type]}            [description]
   */
  getValues(device, sampleRate) {
    var requestRate = sampleRate;
    if(requestRate === "30sec") {
      requestRate = "minute";
    }

    DeviceHelper.showSampleRate(device, requestRate)
      .then(response => {
        this.formatValues(response.data, device, sampleRate);
      }) 
      .catch(error =>  {
        console.log(error);
      });
  }

  /**
   * [getDateRange description]
   * @param  {[type]} values     [description]
   * @param  {[type]} startRange [description]
   * @return {[type]}            [description]
   */
  getDateRange(values, startRange) {

    // 10 mins - week and day
    // 1 min - day
    // hour - day, week, month
    var date = new Date();
    var week = new Date(date.setDate(date.getDate() - 7));
    var month = new Date(date.setDate(date.getDate() - 31));
    var startRange;
    var currentDate;

    if(startRange === "Today") {
      // Today's date
      startRange = new Date();
      // Starting from midnight
      startRange.setHours(0,0,0,0);
    } else if(startRange === "This week") {
      // The past week
      startRange = week;
      // Starting from midnight
      startRange.setHours(0,0,0,0);
    } else if(startRange === "This month") {
      // The past month
      startRange = month;
      // Starting from midnight
      startRange.setHours(0,0,0,0);
    }

  
    console.log(week);

    console.log(startRange);

    
    for(var i = 0; i < values.length; i++) 
    {
      currentDate = new Date(values[i][0] * 1000);

      if(currentDate.getTime() >= startRange.getTime())
        return values.slice(i);
    }
    return [];
  }


  //Returns acceptable percentage variance between two values based on sample rate
  //Anything outside of this range will be treated as anomalous values
  /**
   * [checkAcceptableVariance description]
   * @return {[type]} [description]
   */
  checkAcceptableVariance() {
    const sampleRate = this.props.sampleRate;
    if(sampleRate === "minute")
      return 5; //+-5% acceptable variance
    else if(sampleRate === "10minute")
      return 20; //+-20% acceptable variance
    else if(sampleRate === "hour")
      return 100; //+-100% acceptable variance
  }

  /**
   * [isAnomalous description]
   * @param  {[type]}  val1 [description]
   * @param  {[type]}  val2 [description]
   * @return {Boolean}      [description]
   */
  isAnomalous(val1, val2) {
    var var1Variance = (val1/100) * this.checkAcceptableVariance();
    if(Math.abs(val1 - val2) > var1Variance) {
     return true; 
    }
    return false;
  }


  /**
   * [avgOfTimespan description]
   * @param  {[type]} values    [description]
   * @param  {[type]} timeSpan  [description]
   * @param  {[type]} startTime [description]
   * @param  {[type]} pos       [description]
   * @return {[type]}           [description]
   */
  avgOfTimespan(values, timeSpan, startTime, pos) {
    var total = 0;
    var n = 0;
    var currentTime = values[pos][0];
    var endOfArray = values.length-1;
    //var lowestVal = values[pos][1];
    while ((currentTime - startTime - timeSpan) <= 0) {
      total += values[pos][1];
      pos++;
      n++;
      // if(values[pos][1] < lowestVal)
      //   lowestVal = values[pos][1];
      if(pos >= endOfArray)
        return {
          "avg": total/n,
          "endPos": endOfArray-1, //so that we don't try to compare the current (end) value to the non-existant next value;
          //"lowestVal": lowestVal
        };
      currentTime = values[pos][0];
    }
    return {
      "avg": total/n,
      "endPos": pos-1,
      //"lowestVal": lowestVal
    };
  }


  /**
   * [smoothValues description]
   * @param  {[type]} values [description]
   * @return {[type]}        [description]
   */
  smoothValues(values) {
    var timespan;
    var avgofTimespan;
    var avg;
    var currentVal;
    var preVal;
    var nextVal;
    var startPos = 0;
    var startTime = values[0][0];
    if(this.props.sampleRate === "minute")
      timespan = 1000; // 1 second
    else if(this.props.sampleRate === "10minute")
      timespan = 10000; //10000; // 10 seconds
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
        avg = (preVal + nextVal) / 2;
        // if(i+20 < values.length)
        //   avg = this.calcAvg(values.slice(i, i+20));
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
        else
          values[i][1] = avg;
          

      }
      startPos = avgofTimespan.endPos;
      startTime += timespan;
    }
    return values;
  }

  /**
   * [changeStatus description]
   * @param  {[type]} siteObject [description]
   * @return {[type]}            [description]
   */
  changeStatus(siteObject) {

    //
  }


  /**
   * [formatValues description]
   * @param  {[type]} responseData [description]
   * @param  {[type]} device       [description]
   * @param  {[type]} sampleRate   [description]
   * @return {[type]}              [description]
   */
  formatValues(responseData, device, sampleRate) {
    var newState = {}, values, data;
    newState[sampleRate] = _.cloneDeep(this.state[sampleRate]); 

    console.log(responseData);
    // sites = our object containing site info but no value
    // responseData - object contining site info but with values
    // for every value in responsedata.light value 
    // check which green house it is in
    // check that value is suitable for that green house
    // if not 
    // for every site in sites
    // find the one with the same id as found in responseData.light value
    // give that site a different status
    

    if(!_.isEmpty(responseData.light_value)) {
      if(sampleRate === "minute") {
        responseData.light_value = responseData.light_value.filter(function(_, i) {
          return (i + 1) % 2;
        })          
      }

      

      //
      values = responseData.light_value;

      // console.log(values);

      for(var i = 0; i < responseData; i++) {
        console.log(responseData[i].site_id)
        // for(var j = 0; i < responseData.light_value) {

        // }
      }

      values = values.map(value => [parseInt(moment(value[0]).format('X')), value[1]]);

      

      //
      var diditwork = this.getDateRange(values, "Today");
      //console.log(diditwork);

      values = responseData.light_value.map(value => [parseInt(moment(value[0]).format('X')) * 1000, value[1]]);
      //values = this.movingAverage(values, 20);
      values = this.smoothValues(values);
      //values = this.checkAndFixAnomalousVals(values);
      
      

      data = {
        "name": "Light values",
        "columns": ["time", "value"],
        "points": values
      };    
      newState[sampleRate][device] = new TimeSeries(data);
    } else if(!_.isEmpty(responseData.gas_values)) {
      if(sampleRate === "minute") {
        responseData.gas_values = responseData.gas_values.filter(function(_, i) {
          return (i + 1) % 2;
        })          
      }

      values = responseData.gas_values.map(value => [parseInt(moment(value[0]).format('X')) * 1000, value[1]]);
      //values = this.movingAverage(values, 20);
      values = this.smoothValues(values);
      //values = this.checkAndFixAnomalousVals(values);
      data = {
        "name": "CO2 Generator",
        "columns": ["time", "value"],
        "points": values
      };
      newState[sampleRate][device] = new TimeSeries(data);
    } else if(!_.isEmpty(responseData.solar_value)) {
      if(sampleRate === "minute") {
        responseData.solar_value = responseData.solar_value.filter(function(_, i) {
          return (i + 1) % 2;
        })          
      }

      values = responseData.solar_value.map(value => [parseInt(moment(value[0]).format('X')) * 1000, value[1]]);
      //values = this.movingAverage(values, 20);
      values = this.smoothValues(values);
      //values = this.checkAndFixAnomalousVals(values);
      data = {
        "name": "Solar values",
        "columns": ["time", "value"],
        "points": values
      };
      newState[sampleRate][device] = new TimeSeries(data);
    } else if(!_.isEmpty(responseData.moisture_value)) {
      if(sampleRate === "minute") {
        responseData.moisture_value = responseData.moisture_value.filter(function(_, i) {
          return (i + 1) % 2;
        })          
      }

      values = responseData.moisture_value.map(value => [parseInt(moment(value[0]).format('X')) * 1000, value[1]]);
      //values = this.movingAverage(values, 20);
      values = this.smoothValues(values);
      //values = this.checkAndFixAnomalousVals(values);
      data = {
        "name": "Soil moisture values",
        "columns": ["time", "value"],
        "points": values
      };
      newState[sampleRate][device] = new TimeSeries(data);
    } else if(!_.isEmpty(responseData.temperature_value)) {
      if(sampleRate === "minute") {
        responseData.temperature_value = responseData.temperature_value.filter(function(_, i) {
          return (i + 1) % 2;
        })          
        responseData.humidity_value = responseData.humidity_value.filter(function(_, i) {
          return (i + 1) % 2;
        })          
      }

      values = responseData.temperature_value.map(value => [parseInt(moment(value[0]).format('X')) * 1000, value[1]]);
      //values = this.movingAverage(values, 20);
      values = this.smoothValues(values);
      //values = this.checkAndFixAnomalousVals(values);
      data = {
        "name": "Temperature",
        "columns": ["time", "value"],
        "points": values
      };

      var humidityValues = responseData.humidity_value.map(value => [parseInt(moment(value[0]).format('X')) * 1000, value[1]]);
      //values = this.movingAverage(values, 20);
      values = this.smoothValues(values);
      //values = this.checkAndFixAnomalousVals(values);
      var humidityData = {
        "name": "Humidity",
        "columns": ["time", "value"],
        "points": humidityValues
      };

      newState[sampleRate][device + "_temperature"] = new TimeSeries(data);
      newState[sampleRate][device + "_humidity"] = new TimeSeries(humidityData);
    }

    this.setState(newState);
  }


  /**
   * [description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  changeSampleRate = (event) => {
    let newRate = event.target.value;

    this.setState({sampleRate: newRate});

    if(_.isEmpty(this.state[newRate]))
      this.getAllValues(newRate);
  }



  render() {
    const { deviceTypes, devices, sites, sampleRate, minute, hour, dateRanges } = this.state;
    const thirtysec = this.state["30sec"];
    const tenminute = this.state["10minute"];

    devices.map(device => device.status = "Fine");
    
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Cooksey's Farm</h1>
        </header>
        <FormGroup style={{width: "200px"}} controlId="formControlsSelect">
          <FormControl componentClass="select" defaultValue="hour" onChange={this.changeSampleRate}>
            <option value="30sec">30sec</option>
            <option value="minute">minute</option>
            <option value="10minute">10minute</option>
            <option value="hour">hour</option>
          </FormControl>
        </FormGroup>

        <FormGroup style={{width: "200px"}} controlId="formControlsSelect">
          <FormControl componentClass="select" defaultValue="Today" onChange={event => { this.setState({selectedDateRange: event.target.value}); this.adjustRangeDependingOnSampleRate(sampleRate); }}>
            {
              dateRanges.map((range, i) => <option key={i} value={range}>{range}</option>)
            }
          </FormControl>
        </FormGroup>
        <Tabs id="viewTabs" defaultActiveKey={5}>
          { 
            Object.keys(deviceTypes).map((item, i) => (
              <Tab eventKey={i} title={item} key={i} name={item}>
                <Devices 
                  sampleRate={sampleRate} 
                  devices={_.filter(devices, ['type', item])} 
                  thirtysec={thirtysec} 
                  minute={minute} 
                  tenminute={tenminute} 
                  hour={hour} 
                />
              </Tab>
            ))
          }  
          <Tab eventKey={5} title={"Map"} key={5} name={"Map"}>
            { !_.isEmpty(devices) && !_.isEmpty(sites) 
              ? <LocMap 
                  sites={sites} 
                  deviceTypes={deviceTypes} 
                  devices={devices}
                  thirtysec={thirtysec} 
                  sampleRate={sampleRate} 
                  minute={minute} 
                  tenminute={tenminute} 
                  hour={hour} 
                />
              : <p> Loading! </p>
            }
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default App;
