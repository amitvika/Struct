import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';

// For POST requests
axios.interceptors.response.use(
  (res) => {
    // Add configurations here
    if (res.status === 201) {
      console.log('Posted Successfully');
    }
    return res;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      window.localStorage.clear('token');
      window.location = '/login';
      // console.log(error.response.data);
      // console.log(error.response.status);
      // console.log(error.response.headers);
    }
    return Promise.reject(error);
  }
);

ReactDOM.render(<App />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
