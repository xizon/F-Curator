import React from 'react';
import ReactDOM from 'react-dom';
import App from '@/router';

//A <Router> that uses the hash portion of the URL (i.e. window.location.hash) to keep your UI in sync with the URL.
ReactDOM.render(
    <App />,
  document.getElementById('app'),
);