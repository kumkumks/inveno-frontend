import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:7000', // Replace with your API base URL
  timeout: 10000, // Set a timeout for requests (in milliseconds)
});

export default api;