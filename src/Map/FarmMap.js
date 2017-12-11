import React from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from "react-google-maps"


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
          /* Create a marker & info window */
   
            <Marker key={index} label={item.id} position={{ lat: item.lat, lng: item.lon }} onClick={(e) => props.switchGraphs(item.id, e)}>
          	</Marker>
        
        
          ))
      }  
  </GoogleMap>));



export default FarmMap;