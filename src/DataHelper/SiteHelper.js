import axios from 'axios';

export function get() {
  return axios.get('http://shed.kent.ac.uk/sites');
}
