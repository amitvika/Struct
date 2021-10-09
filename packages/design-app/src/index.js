import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import App from './App';
import reportWebVitals from './reportWebVitals';
import LoadingModal from '@monostruct/common/components/LoadingModal';
import './index.css';

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
      window.location = '/';
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
  document.getElementById('root')
);

reportWebVitals();
