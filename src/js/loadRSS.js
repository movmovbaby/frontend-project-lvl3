import axios from 'axios';

export default (url) => {
  const proxyURL = `https://allorigins.hexlet.app/raw?url=${url}`;
  return axios.get(proxyURL);
};
