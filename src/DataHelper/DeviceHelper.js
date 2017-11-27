import axios from 'axios';

export function get() {
  return axios.get('http://shed.kent.ac.uk/devices');
}

export function show(id) {
  return axios.get('http://shed.kent.ac.uk/device/' + id);
}

export function showSampleRate(id, sampleRate) {
  return axios.get('http://shed.kent.ac.uk/device/' + id + '/' + sampleRate);
}