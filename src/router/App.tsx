import React, { useEffect } from 'react';
import {
  Route,
  Switch,
  useLocation
} from 'react-router-dom';

import Home from '@/views/_pages/Home';
import Category from '@/views/_pages/Category';
import NoMatch from '@/views/_pages/404';



function usePageViews() {
  //Click the route to trigger the event
  const theLocation = useLocation();
  useEffect(() => {
    console.log('theLocation(): ', theLocation);

    //create a style element and append to head
    const $style = document.createElement("style");
    document.head.appendChild($style);
    $style.innerHTML = `
    html,body {
        height: 100%;
    }
    
    body {
        -webkit-app-region: drag;
        font-family: 'Helvetica Neue', Helvetica, 'Microsoft YaHei', STXihei, 'PingFang SC','Hiragino Sans GB', Arial, sans-serif;
    }
    
    #app, #main {
        height: 100%;
    }

    /* Ant Design Styles*/
    .ant-card,
        .ant-modal-wrap,
        .ant-table {
        -webkit-app-region: no-drag;
    }
    
    .ant-table-tbody>tr>td, 
        .ant-table-thead>tr>th, 
        .ant-table tfoot>tr>td, 
        .ant-table tfoot>tr>th {
        padding: 8px;
    }

    .ant-btn-primary {
      background-color: #4c7e1c;
      border-color: #4c7e1c;
      box-shadow: 0 2px 0 rgba(76, 126, 28, 0.5);
      text-shadow: none;
      transition: .1s ease-in-out;
    }

    .ant-btn:active,
    .ant-btn:focus,
    .ant-btn:hover {
      color: #67a32e;
      border-color: #4c7e1c;
    }


    .ant-btn-primary:active,
    .ant-btn-primary:focus,
    .ant-btn-primary:hover {
      background: #67a32e;
      border-color: #4c7e1c;
      color: #fff;
    }

    .ant-modal-header,
    .ant-modal-content {
      border-radius: 12px;
    }

    .ant-select:not(.ant-select-disabled):hover .ant-select-selector,
    .ant-input:hover {
      border-color: #67a32e;
    }

    .ant-select.ant-select-focused .ant-select-selector,
    .ant-select.ant-select-open .ant-select-selector {
      border-color: #67a32e !important;
    }

    .ant-select .ant-select-selector {
      box-shadow: none !important;
    }
  
    .ant-input-focused, 
    .ant-input:focus {
      border-color: #67a32e;
      box-shadow: 0 0 0 2px rgb(17 124 4 / 20%);
    }
    .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
      background-color: rgb(248, 248, 248);
    }

    `;


  }, [theLocation]);

}



export default function App() {
  usePageViews();
  return (
    <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/category">
          <Category />
        </Route>
        <Route path="*">
          <NoMatch />
        </Route>
    </Switch>
  );

};

