import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';
import LoadingModal from '@ravibasil/common/components/LoadingModal';

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

ReactDOM.render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingModal isLoading={true} />}>
      <App />
    </React.Suspense>
  </React.StrictMode>,
  document.getElementById('root'));

reportWebVitals();
