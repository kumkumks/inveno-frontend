import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Replace with your API base URL
  timeout: 10000, // Set a timeout for requests (in milliseconds)
  withCredentials: true, // Include credentials (cookies) in requests if needed
});



export default api;