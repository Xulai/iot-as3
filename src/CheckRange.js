

const CheckRange = (props => {

	// Loop through values
    props.values.map(value => {
      	// If the value is higher than accepted number
      	if(value < props.low) {
      		return 'too low';
      	// If the value is lower than accepted number
      	} else if (value > props.high) {
  			 return 'too high';
        } else {
          return 'all is ok';
        }
    });
});
	


export default CheckRange;

