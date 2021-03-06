/**
 * //////////////////////////////////////////////////////
 * Basic
 * //////////////////////////////////////////////////////
 */
const path = require('path');
const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const crawl = require('./crawl');
const buildHtml = require('./build-html');
const exportHtml = require('./export-html');  
const restoreDatabase = require('./restore-database');  
const updateApp = require('./update-app');  
const isMac = process.platform === 'darwin';

let win = null;

// set dock icon
if (isMac) {
    app.dock.setIcon(path.join(__dirname, '../public/assets/images/icon.png'));
}

// Initialize the database
const defaultCatText = 'Uncategorized';
const StormDB = require('stormdb');
const engine = new StormDB.localFileEngine(path.join(__dirname, '../db/db.json'));
const db = new StormDB(engine);
db.default({ "classList": [defaultCatText], "webList": [] });
db.save();



// get app information
const { version, description, applicationName, officialWebsite } = require('../package.json');
const appInfo = { "version": version, "description": description, "name": applicationName, "website": officialWebsite };

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
    if (process.env.NODE_ENV === 'development') win.openDevTools();


    // and load the index.html of the app.
    // win.loadFile("index.html");
    win.loadFile(path.join(__dirname, '../public/index.html'));

    // auto fullscreen
    win.maximize();
    win.show();

}

function initRendererHomePage() {
    // send app info
    win.webContents.send('APP_INFO', appInfo);

    // send to Renderer
    win.webContents.send('INITIALIZE_DATA', { "categories": db.get("classList").state.classList, "urls": db.get("webList").state.webList });

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
        console.log('Current URLs Data: ', data);

        if (data) {
            crawl(data.category, data.title, data.url, function (response) {

                // Save data to local database
                if (typeof (response.error) === 'undefined') {
                    db.get("webList").push(response);
                    db.save();
                }

                // send to Renderer
                win.webContents.send('INITIALIZE_DATA', { "categories": db.get("classList").state.classList, "urls": db.get("webList").state.webList });

            });

        } else {

            // send to Renderer
            win.webContents.send('INITIALIZE_DATA', { "categories": db.get("classList").state.classList, "urls": db.get("webList").state.webList });

        }

    });



    // Categories
    //------------------
    ipcMain.on('DATA_UPDATED_CATEGORIES', (event, data) => {
        console.log('Current Categories Data: ', data);

        if (data) {
            // Save data to local database
            db.get("classList").push(data);
            db.save();

        }

        // send to Renderer
        win.webContents.send('INITIALIZE_DATA', { "categories": db.get("classList").state.classList, "urls": db.get("webList").state.webList });

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


    // Export html file
    //------------------
    ipcMain.on('EXPORT_DATA_HTML', (event, data) => {
        const htmlName = 'db';
        const htmlFilePath = path.join(__dirname, '../db/'+htmlName+'.html');
        win.webContents.savePage(htmlFilePath, 'HTMLComplete').then((res) => {
            console.log('Page was saved successfully.')

            const folderName = `${htmlName}_files`;
            const folderPath = path.join(__dirname, '../db/'+folderName);
            const logoPath = path.join(__dirname, '../public/assets/images/main/side-logo-white.png');
            
            buildHtml(htmlFilePath, folderPath, folderName, logoPath, function() {
                exportHtml( function(res) {
                    win.webContents.send('EXPORT_INFO', {"ok": res});
                });
            });
            
            
        }).catch(err => {
            win.webContents.send('EXPORT_INFO', {"error": err});
        });
    });



    // Button action of Windows
    //------------------
    ipcMain.on('WINDOWS_BUTTON_MIN', (event, data) => {
        console.log('WINDOWS_BUTTON_MIN');
        win.minimize();
    });
    ipcMain.on('WINDOWS_BUTTON_MAX', (event, data) => {
        win.maximize();
    });
    ipcMain.on('WINDOWS_BUTTON_CLOSE', (event, data) => {
        win.close();
    });


    // Import database 
    //------------------
    ipcMain.on('IMPORT_DATABASE', (event, data) => {
        const { dialog } = require('electron');
        let filepath = undefined;

        // If the platform is 'win32' or 'Linux'
        if (!isMac) {
            // Resolves to a Promise<Object>
            dialog.showOpenDialog({
                title: 'Select the Zip File to be uploaded',
                defaultPath: path.join(__dirname, '../public/assets/'),
                buttonLabel: 'Upload',
                // Restricting the user to only Text Files.
                filters: [
                    {
                        name: 'Zip Files',
                        extensions: ['zip']
                    },],
                // Specifying the File Selector Property
                properties: ['openFile']
            }).then(file => {
                // Stating whether dialog operation was
                // cancelled or not.
                console.log(file.canceled);
                if (!file.canceled) {
                    // Updating the GLOBAL filepath variable 
                    // to user-selected file.
                    filepath = file.filePaths[0].toString();

                    //unzip database
                    restoreDatabase(filepath, function(res) {
                        win.webContents.send('IMPORT_INFO', {"ok": res});
                    });
                }
            }).catch(err => {
                win.webContents.send('IMPORT_INFO', {"error": err});
            });
        }
        else {
            // If the platform is 'darwin' (macOS)
            dialog.showOpenDialog({
                title: 'Select the Zip File to be uploaded',
                defaultPath: path.join(__dirname, '../public/assets/'),
                buttonLabel: 'Upload',
                filters: [
                    {
                        name: 'Zip Files',
                        extensions: ['zip']
                    },],
                // Specifying the File Selector and Directory 
                // Selector Property In macOS
                properties: ['openFile', 'openDirectory']
            }).then(file => {
                console.log(file.canceled);
                if (!file.canceled) {
                    filepath = file.filePaths[0].toString();
                    
                    //unzip database
                    restoreDatabase(filepath, function(res) {
                        win.webContents.send('IMPORT_INFO', {"ok": res});
                    });
                }
            }).catch(err => {
                win.webContents.send('IMPORT_INFO', {"error": err});
            });
        }
    });



    // Simulate CommandOrControl+M in electron app
    //------------------
    const { globalShortcut } = require('electron');
    globalShortcut.register('CommandOrControl+M', () => {
        console.log('CommandOrControl+M');
    });

    // Make a link from Electron open in browser
    //------------------
    win.webContents.on('new-window', function (e, url) {
        e.preventDefault();
        require('electron').shell.openExternal(url);
    });


    // Updating Applications
    //------------------
    //if (!isDev) {
        win.webContents.once("did-frame-finish-load", (event) => {
            updateApp(function(ver) {
                win.webContents.send('NOTIFY_UPDATE', {"version": ver, "website": officialWebsite});
            })();
            
        })
   // }
 

})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (!isMac) {
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

