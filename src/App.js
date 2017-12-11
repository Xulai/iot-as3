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

        this.getDevicesAndSetState(response.data);
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
      //console.log(this.state.dateRanges);
    } else if(sampleRate === "minute") {
      this.setState({
        dateRanges: ["Today"]
      });
      //console.log(this.state.dateRanges);
    } else if(sampleRate === "hour") {
      this.setState({
        dateRanges: ["Today", "This week", "This month"]
      });
      //console.log(this.state.dateRanges);
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

  getDevicesAndSetState(deviceTypes, tries=0, tryLimit=3) {
    if(tries < tryLimit) {
      this.getDevices(deviceTypes) 
      .then((results) => {
        this.setState({ 
          deviceTypes: deviceTypes,
          devices: results.map(r => _.assignIn(r.data, {type: this.getDeviceType(r.data, deviceTypes)}))
        });
        this.getAllValues();
      })
      .catch(error => {
        this.getDevicesAndSetState(deviceTypes, tries+1);
      });
    }
    
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
        promises.push(
          DeviceHelper.show(device)
            .catch(error => {
              return {
                name: device,
                id: device,
                error: true
              };
            })
        );
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


    // console.log(week);

    // console.log(startRange);


    
    for(var i = 0; i < values.length; i++) 
    {
      currentDate = new Date(values[i][0]);

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
  checkAcceptableVariance(sampleRate) {
    // const sampleRate = this.state.sampleRate;
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
  isAnomalous(val1, val2, sampleRate) {
    var var1Variance = (val1/100) * this.checkAcceptableVariance(sampleRate);
    if(Math.abs(val1 - val2) > var1Variance) {
     return true; 
    }
    return false;
  }


  /**
   * [description]
   * @param  {[type]} values [description]
   * @return {[type]}        [description]
   */
  getLastTwoDays = (values) => {
    var currentDate;
    var endOfArray = values.length-1;
    // var twoDaysAgo = ((new Date(values[endOfArray][0])).getDate() - 2).getTime();
    var nowDate = new Date();
    var twoDaysAgo = (new Date(nowDate.setDate(nowDate.getDate() - 2))).getTime();

    for(var pos = endOfArray; pos >= 0; pos--)
    {
      // console.log(values[pos][0]);
      currentDate = new Date(values[pos][0]);
      if(currentDate.getTime() <= twoDaysAgo)
        return values.slice(pos);
    }
    return values;
  }



  /**
   * [description]
   * @param  {[type]} values [description]
   * @return {[type]}        [description]
   */
  avgOverall = (values) => {

    values = this.getLastTwoDays(values);

    var total = 0;
    var n = values.length;
    for(var i = 0; i < n; i++)
    {
      total += values[i][1];
    }
    return total/n;
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
  smoothValues(values, sampleRate) {
    var timespan;
    var avgofTimespan;
    var avg;
    var currentVal;
    var preVal;
    var nextVal;
    var startPos = 0;
    var startTime = values[0][0];
    if(sampleRate === "minute")
      timespan = 1000; 
    else if(sampleRate === "10minute")
      timespan = 10000;  
    else if(sampleRate === "hour")
      timespan = 60000;
    
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
        if(this.isAnomalous(preVal, currentVal, sampleRate) || this.isAnomalous(nextVal, currentVal, sampleRate))//) > (avgofTimespan.avg / 10)) //difference is more than 10% of avgofTimespan
        {
          
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
   * [description]
   * @param  {[type]} message       [description]
   * @param  {[type]} overallAvg    [description]
   * @param  {[type]} highThreshold [description]
   * @param  {[type]} lowThreshold  [description]
   * @return {[type]}               [description]
   */
  checkAndSetStatus = (responseData, site, highMessage, lowMessage, overallAvg, lowThreshold, highThreshold) => {

    
    var sendMessage = "";
    var newArray = this.state.sites;

    if(overallAvg > highThreshold) {
      sendMessage = highMessage;
    }

    if(overallAvg < lowThreshold) {
      sendMessage = lowMessage;
    }

    if(sendMessage != "") {
      for (var i = 0; i < newArray.length; i++) {
        if (newArray[i].id === site) {
            if (newArray[i].status != 'Your zones are all safe.' && newArray[i].status) {
              newArray[i].status = `${newArray[i].status},${sendMessage} in ${responseData.name}`
            } else {
              newArray[i].status = `${sendMessage} in ${responseData.name}`;
            }
          
            this.setState({ 
              sites: newArray
            })
        }
      }
    } else {
      for(var i = 0; i < newArray.length; i++) {
        if(!newArray[i].status) {
          newArray[i].status = 'Your zones are all safe.';

          this.setState({ 
            sites: newArray
          })
        }
      }
    }
  }


  /**
   * [analyseSiteConditions description]
   * @param  {[type]} deviceID [description]
   * @return {[type]}          [description]
   */
  analyseSiteConditions(responseData, values) {
    var siteID = responseData.site_id;
    var deviceID = responseData.id;

    if(siteID === "gh1"){
      // Light
      if(deviceID === "gh1_plantzone_1_lux" || deviceID === "gh1_north_door_lux" || deviceID === "gh1_south_door_lux") {
        this.checkAndSetStatus(responseData, "gh1", "Unexpectedly high light exposure - check sensor", "Low light exposure for Cacti", this.avgOverall(values), 5000.000, 100000.000);
      }
      // Gas
      if(deviceID === "gh1_co2Production_gas") {
        this.checkAndSetStatus(responseData, "gh1", "High CO2 levels - dangerous for humans", "Low CO2 levels - check sensor/environment", this.avgOverall(values), 100, 1000.000);
      }
      // Moisture
      if(deviceID === "gh1_plantzone_1_moisture") {
        //this.checkAndSetStatus(responseData, "gh2", "Too much light", "Not enough light", this.avgOverall(values), 0.000, 1000.000);
      }
      // Temperature
      if(deviceID === "gh1_co2Production_temp" || deviceID === "gh1_south_door_temp" || deviceID === "gh1_north_door_temp" || deviceID === "gh1_plantzone_1_temp") {
        this.checkAndSetStatus(responseData, "gh2", "High temp", "Low temp", this.avgOverall(values), 7, 29);
      }
    }


    if(siteID === "gh2") {
      // Light
      if(deviceID === "gh2_plantzone_1_lux" || deviceID === "gh2_north_door_lux" || deviceID === "gh2_south_door_lux" || deviceID === "gh2_mains_lux") {
        this.checkAndSetStatus(responseData, "gh2", "High light exposure for Lettuce - check sensor/environment", "Low light exposure for Lettuce", this.avgOverall(values), 0.000, 1000.000);
      }
      // Gas
      if(deviceID === "gh2_co2Production_gas") {
        //this.checkAndSetStatus(responseData, "gh2", "Too much light", "Not enough light", this.avgOverall(values), 0.000, 1000.000);
      }
      // Moisture
      if(deviceID === "gh2_plantzone_1_moisture" ) {
        //this.checkAndSetStatus(responseData, "gh2", "Too much light", "Not enough light", this.avgOverall(values), 0.000, 1000.000);
      }
      // Temperature
      if(deviceID === "gh2_mains_moisture" || deviceID === "gh2_north_door_temp" || deviceID === "gh2_south_door_temp" || deviceID === "gh2_mains_temp" || deviceID === "gh2_plantzone_1_temp") {
        this.checkAndSetStatus(responseData, "gh2", "Too much light", "Not enough light", this.avgOverall(values), 7, 18);
      }
    }


    if(siteID === "gh3") {
      // Light
      if(deviceID === "gh3_seed_lux" || deviceID === "gh3_east_door_lux" || deviceID === "gh3_west_door_lux") {
        this.checkAndSetStatus(responseData, "gh3", "Too much light", "Not enough light", this.avgOverall(values), 500.000, 1000.000);
      }
      // Gas
      if(deviceID === "gh3_co2Production_gas") {
        //this.checkAndSetStatus(responseData, "gh3", "Too much light", "Not enough light", this.avgOverall(values), 500.000, 1000.000);
      }
      // Moist
      if(deviceID === "gh3_seed_moisture") {
        //this.checkAndSetStatus(responseData, "gh3", "Too much light", "Not enough light", this.avgOverall(values), 500.000, 1000.000);
      }
      // Temperature
      if(deviceID === "gh3_east_door_temp" || deviceID === "gh3_seed_temp" || deviceID === "gh3_west_door_temp") {
        this.checkAndSetStatus(responseData, "gh3", "Too much light", "Not enough light", this.avgOverall(values), 10, 26);
      }
    }


    if(siteID === "house") {
      // Light
      if(deviceID === "house_store_lux") {
        this.checkAndSetStatus(responseData, "gh3", "Too much light", "Not enough light", this.avgOverall(values), 0.000, 40.000);
      }

      // Temperature
      if(deviceID === "house_store_temp") {
        //
      }
    }

    //if(siteID === "outside") {
      // Light
      // if(deviceID === "outside_field_lux") {
      //   //this.checkAndSetStatus(responseData, "gh3", "Too much light", "Not enough light", this.avgOverall(values), 500.000, 1000.000);
      // }

      // Temperature
      // if(deviceID === "outside_field_temp" || deviceID === "outside_heap_temp") {
      //   //
      // }

      // Moisture
      // if(deviceID === "outside_field_moisture") {
      //   //
      // }

      // Solar
      // if(deviceID === "outside_shed_solar") {
      //   //
      // }
    //}
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

    // console.log(responseData);
    // sites = our object containing site info but no value
    // responseData - object contining site info but with values
    // for every value in responsedata.light value 
    // check which green house it is in
    // check that value is suitable for that green house
    // if not 
    // for every site in sites
    // find the one with the same id as found in responseData.light value
    // give that site a different status
    
    //this.state.sites.map(site => site.status = "Your zones are all safe.");


    if(!_.isEmpty(responseData.light_value)) {
      if(sampleRate === "minute") {
        responseData.light_value = responseData.light_value.filter(function(_, i) {
          return (i + 1) % 2;
        })
      }


      //
      //var diditwork = this.getDateRange(values, "Today");
      //console.log(diditwork);
      //values = responseData.light_value.map(value => [parseInt(moment(value[0]).format('X')) * 1000, value[1]]);
      //values = this.movingAverage(values, 20);
      //values = this.checkAndFixAnomalousVals(values);
      values = responseData.light_value.map(value => [parseInt(moment(value[0]).format('X')) * 1000, value[1]]);
      //console.log(values);
      values = this.smoothValues(values, sampleRate);
      
      this.analyseSiteConditions(responseData, values);
      
      // Check the light values for each site against requirements

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
      values = this.smoothValues(values, sampleRate);
      //values = this.checkAndFixAnomalousVals(values);
      this.analyseSiteConditions(responseData, values);
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
      values = this.smoothValues(values, sampleRate);
      //values = this.checkAndFixAnomalousVals(values);
      this.analyseSiteConditions(responseData, values);
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
      values = this.smoothValues(values, sampleRate);
      //values = this.checkAndFixAnomalousVals(values);
      this.analyseSiteConditions(responseData, values);
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
      values = this.smoothValues(values, sampleRate);
      //values = this.checkAndFixAnomalousVals(values);
      this.analyseSiteConditions(responseData, values);
      data = {
        "name": "Temperature",
        "columns": ["time", "value"],
        "points": values
      };

      var humidityValues = responseData.humidity_value.map(value => [parseInt(moment(value[0]).format('X')) * 1000, value[1]]);
      //values = this.movingAverage(values, 20);
      values = this.smoothValues(values, sampleRate);
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
    
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Cooksey's Farm</h1>
        </header>
        
        { /* 
        <FormGroup style={{width: "200px"}} controlId="formControlsSelect">
          <FormControl componentClass="select" defaultValue="Today" onChange={event => { this.setState({selectedDateRange: event.target.value}); this.adjustRangeDependingOnSampleRate(sampleRate); }}>
            {
              dateRanges.map((range, i) => <option key={i} value={range}>{range}</option>)
            }
          </FormControl>
        </FormGroup>
        */} 
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <FormGroup style={{width: "200px"}} controlId="formControlsSelect">
                <FormControl componentClass="select" defaultValue="hour" onChange={this.changeSampleRate}>
                  <option value="30sec">30sec</option>
                  <option value="minute">minute</option>
                  <option value="10minute">10minute</option>
                  <option value="hour">hour</option>
                </FormControl>
              </FormGroup>
            </div>
          </div>
          <div className="row">
            <div className="col-7">
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
            <div className="col-4">
              <ul>
                {
                  this.state.sites.map((site, i) => <li className="alert alert-info" key={i}>{site.id}: {site.status}</li>)
                }
              </ul>
            </div>
          </div>
        </div>
      </div>
  
      
    );
  }
}

export default App;
