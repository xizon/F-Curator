import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import App from './App';

// Compatible with Node's main process

export default () => {
  return (

    //If the file is in the root directory, you can leave it empty. If in another directory, 
    //you need set the property "basename" of <BrowserRouter>
    //!!!
    //This path is equivalent to the proxy configuration you added in Apache or Nginx (but no trailing slash)
    //The base URL for all locations. If your app is served from a sub-directory on your server, 
    //you’ll want to set this to the sub-directory. A properly formatted basename should have a leading slash, but no trailing slash.
    <Router basename="">
      <div id="main">
        <App />
      </div>
    </Router>

  );
};
