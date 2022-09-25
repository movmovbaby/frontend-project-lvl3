import axios from 'axios';

export default (url) => {
  const proxyURL = `https://allorigins.hexlet.app/get?disableCache=true&url=${url}`;
  return axios.get(proxyURL);
};
