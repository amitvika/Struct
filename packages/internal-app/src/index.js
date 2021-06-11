import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
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
            window.location = '/';
            // console.log(error.response.data);
            // console.log(error.response.status);
            // console.log(error.response.headers);
        }
        return Promise.reject(error);
    }
);

ReactDOM.render(
    <App />,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
