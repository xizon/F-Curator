/**
 * //////////////////////////////////////////////////////
 * Basic
 * //////////////////////////////////////////////////////
 */
 const path = require('path');
 const { app, BrowserWindow } = require('electron');
 const crawl = require('./crawl');
 let win = null;
 
 // set dock icon
 app.dock.setIcon( path.join(__dirname, '../public/assets/images/icon.png') );
 
 // Initialize the database
 const defaultCatText = 'Uncategorized';
 const StormDB = require('stormdb');
 const engine = new StormDB.localFileEngine( path.join(__dirname, '../db/db.json') );
 const db = new StormDB(engine);
 db.default({ "classList": [defaultCatText], "webList": [] });
 db.save();
 
 
 
 // get app information
 const { version, description, applicationName } = require('../package.json');
 const appInfo = {"version":version, "description":description, "name":applicationName};
 
 // Create the browser window.
 function createWindow() {
     
     win = new BrowserWindow({
         width: 1440,
         height: 800,
         fullscreenable: false,
         resizable: true,
         webPreferences: {
             preload: path.join(__dirname, 'preload.js'),
             nodeIntegration: true,
             contextIsolation: false
         },
         titleBarStyle: 'hidden',
         transparent: true,
         icon: path.join(__dirname, '../public/assets/images/icon.png')
     });
     
     // for development
     if ( process.env.NODE_ENV === 'development' ) win.openDevTools();
     
 
     // and load the index.html of the app.
     // win.loadFile("index.html");
     win.loadFile( path.join(__dirname, '../public/index.html') );
 
     
 }
 
 function initRendererHomePage() {
     // send app info
     win.webContents.send('APP_INFO', appInfo);
 
     // send to Renderer
     win.webContents.send('INITIALIZE_DATA', {"categories":db.get("classList").state.classList,"urls":db.get("webList").state.webList});
 
     // access DOM elements
     win.webContents.executeJavaScript(`
         const $input = document.getElementById('app-input-url');
         if ( $input !== null ) {
             $input.addEventListener("click", function () { 
                 $input.select();
             });
         }
 
     `);
 }
 
 // This method will be called when Electron has finished
 // initialization and is ready to create browser windows.
 // Some APIs can only be used after this event occurs.
 //app.whenReady().then(createWindow);
 app.on('ready', () => {
     createWindow();
 
 
     /**
      * //////////////////////////////////////////////////////
      * Communicate asynchronously to the renderer process ( Initialization Data )
      * //////////////////////////////////////////////////////
      */
      win.webContents.on('did-finish-load', () => {
         initRendererHomePage();
     });
     
 
     /**
      * //////////////////////////////////////////////////////
      * Communicate asynchronously to the renderer process.
      * //////////////////////////////////////////////////////
      */
     const { ipcMain } = require('electron');
 
     // Listen event through runCommand channel
     // And return the result to Renderer.
 
     // URLs
     //------------------
     ipcMain.on('DATA_UPDATED_URLS', (event, data) => {
         console.log( 'Current URLs Data: ', data );
 
         if ( data ) {
             crawl(data.category, data.title, data.url, function( response ) {
                 
                 // Save data to local database
                 if ( typeof(response.error) === 'undefined') {
                     db.get("webList").push( response );
                     db.save();
                 }
 
                 // send to Renderer
                 win.webContents.send('INITIALIZE_DATA', {"categories":db.get("classList").state.classList,"urls":db.get("webList").state.webList});
 
             });
 
         } else {
 
             // send to Renderer
             win.webContents.send('INITIALIZE_DATA', {"categories":db.get("classList").state.classList,"urls":db.get("webList").state.webList});
 
         }
 
     });
 
 
 
     // Categories
     //------------------
     ipcMain.on('DATA_UPDATED_CATEGORIES', (event, data) => {
         console.log( 'Current Categories Data: ', data );
 
         if ( data ) {
             // Save data to local database
             db.get("classList").push( data );
             db.save();
 
         }
 
         // send to Renderer
         win.webContents.send('INITIALIZE_DATA', {"categories":db.get("classList").state.classList,"urls":db.get("webList").state.webList});
 
     });
 
     // Save sorted data
     //------------------
     ipcMain.on('DATA_UPDATED_SORTED_URLS', (event, data) => {
         //console.log( 'sorted data: ', data );
 
         // change value of highest element
         db.get("webList")
            .set(data);
 
         // save db
         db.save();
 
     });
 
 
     ipcMain.on('DATA_UPDATED_SORTED_CATEGORIES', (event, data) => {
         //console.log( 'sorted data: ', data );
 
         // change value of highest element
         db.get("classList")
            .set(data);
 
         // save db
         db.save();
 
     });
 
     // Get app info
     //------------------
     ipcMain.on('GET_APP_INFO', (event, data) => {
         win.webContents.send('APP_INFO', appInfo);
     });
 
 
     /**
      * //////////////////////////////////////////////////////
      * Simulate CommandOrControl+M in electron app
      * //////////////////////////////////////////////////////
      */
     const { globalShortcut } = require('electron');
     globalShortcut.register('CommandOrControl+M', () => {
         console.log('CommandOrControl+M');
     });
     
     /**
      * //////////////////////////////////////////////////////
      * Make a link from Electron open in browser
      * //////////////////////////////////////////////////////
      */
     win.webContents.on('new-window', function (e, url) {
         e.preventDefault();
         require('electron').shell.openExternal(url);
     });
 
 
 })
 
 // Quit when all windows are closed, except on macOS. There, it's common
 // for applications and their menu bar to stay active until the user quits
 // explicitly with Cmd + Q.
 app.on('window-all-closed', () => {
     if (process.platform !== 'darwin') {
         app.quit();
     }
 });
 
 app.on('activate', () => {
     if (BrowserWindow.getAllWindows().length === 0) {
         createWindow();
 
         win.webContents.on('did-finish-load', () => {
             initRendererHomePage();
         });
 
     }
 });
 
 
 
 
 /**
  * //////////////////////////////////////////////////////
  * Create a Menu
  * //////////////////////////////////////////////////////
  */
 const { Menu } = require('electron');
 const menu = require('./application-menu');
 Menu.setApplicationMenu(menu);
 
 
 
 
 