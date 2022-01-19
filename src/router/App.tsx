import React, { useEffect } from 'react';
import {
  Route,
  Switch,
  useLocation
} from 'react-router-dom';

import Home from '@/views/_pages/Home';
import Category from '@/views/_pages/Category';
import NoMatch from '@/views/_pages/404';

const isMac = process.platform === 'darwin';

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
        font-family: 'Helvetica Neue', Helvetica, 'Microsoft YaHei', STXihei, 'PingFang SC','Hiragino Sans GB', Arial, sans-serif;
    }

    .app-content__wrapper .content__sidebar .panel-dragarea {
      -webkit-app-region: drag;
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

    .app-search__wrapper .ant-input-search .ant-input-group .ant-input-affix-wrapper:not(:last-child) {
      border-bottom-left-radius: 6px;
      border-top-left-radius: 6px;
    }

    .app-search__wrapper .ant-input-search>.ant-input-group>.ant-input-group-addon:last-child .ant-input-search-button {
      border-radius: 0 6px 6px 0;
    }  


    /* Add buttons to app of Windows  */
    nav#title-bar {
        display: block;
        width: 100%;
        height: 30px;
        background-color: #070906;
        -webkit-app-region: drag;
        -webkit-user-select: none;
        position: fixed;
        z-index: 1;
    }
    
    nav#title-bar #titleshown {
        width: 30%;
        height: 100%;
        line-height: 30px;
        color: #f7f7f7;
        float: left;
        padding: 0 0 0 1em;
    }
    
    nav#title-bar #buttons {
        float: right;
        width: 150px;
        height: 100%;
        line-height: 30px;
        background-color: #222222;
        -webkit-app-region: no-drag;
    }
    
    nav#title-bar #buttons #minimize,
    nav#title-bar #buttons #maximize,
    nav#title-bar #buttons #quit {
        float: left;
        height: 100%;
        width: 33%;
        text-align: center;
        color: #f7f7f7;
        cursor: default;
    }
    
    nav#title-bar #buttons #minimize:hover {
        background-color: #070906aa;
    }
    nav#title-bar #buttons #maximize:hover {
        background-color: #070906aa;
    }
    nav#title-bar #buttons #quit:hover {
        background-color: #ff0000dd;
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

