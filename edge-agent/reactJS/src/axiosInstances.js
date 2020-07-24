import config from './config';
import axios from 'axios';

const api = axios.create({
  baseURL: `${config.endpoint}/api`,
});

export default api;
