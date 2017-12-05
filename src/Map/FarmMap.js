import React, { Component } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"


const FarmMap = withScriptjs(withGoogleMap((props) => 
	<GoogleMap
	    mapTypeId="satellite"
	    zoom={16}
	    center={{ lat: 51.3083, lng: 1.1036 }}
	    defaultOptions={{
	      disableDefaultUI: true,
	      gestureHandling: 'none',
	      zoomControl: false
	    }} 
	  >
      { 
          /* For each Site */
          props.sites.map((item, index) => (
          /* Create a marker */
              <Marker key={index} label={item.id} position={{ lat: item.lat, lng: item.lon }} onClick={(e) => props.switchGraphs(item.id, e)} />
          ))
      }  
  </GoogleMap>));



export default FarmMap;