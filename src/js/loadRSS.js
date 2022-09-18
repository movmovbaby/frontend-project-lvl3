import axios from 'axios';

export default (url) => {
  const proxyURL = `https://allorigins.hexlet.app/raw?url=${url}&disableCache=true`;
  return axios.get(proxyURL);
};
