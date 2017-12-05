import React, { Component } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"


const CheckRange = (props => {

	console.log(test);
	// Loop through values
    props.values.map(value => {
      	// If the value is higher than accepted number
      	if(value < props.low) {
      		return 'too low';
      	// If the value is lower than accepted number
      	} else if (value > props.high) {
  			return 'too high';
  		}
    });
});
	


export default CheckRange;

