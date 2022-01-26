/**
 * Create a Menu
 */
 const { app, Menu, shell } = require('electron');
 const { officialWebsite } = require('../package.json');
 const isMac = process.platform === 'darwin';

 const template = [
     {
 
         // Enable copy and paste
         label: "Edit",
         submenu: [
             { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
             { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
             { type: "separator" },
             { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
             { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
             { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
             { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
         ]
     },
     {
         label: 'Help',
         role: 'help',
         submenu: [
           {
             label: 'Official Website',
             click() { 
                 shell.openExternal(officialWebsite);
             }
           },
        //    {
        //      label: 'Toggle Developer Tools',
        //      click(item, focusedWindow) {
        //        if (focusedWindow) focusedWindow.webContents.toggleDevTools();
        //      }
        //    }
         ],
       }
 ];
 
 // Add the first item
 if ( isMac ) {
     const name = 'F-Curator';
     template.unshift({
         label: name,
         submenu: [
         {
             label: `About ${name}`,
             role: 'about',
         },
         { type: 'separator' },
         {
             label: 'Services',
             role: 'services',
             submenu: [],
         },
         { type: 'separator' },
         {
             label: `Hide ${name}`,
             accelerator: 'Command+H',
             role: 'hide',
         },
         {
             label: 'Hide Others',
             accelerator: 'Command+Alt+H',
             role: 'hideothers',
         },
         {
             label: 'Show All',
             role: 'unhide',
         },
         { type: 'separator' },
         {
             label: `Quit ${name}`,
             accelerator: 'Command+Q',
             click() { app.quit(); },
         },
         ],
     });
 }
 
 const menu = Menu.buildFromTemplate(template);
 
 module.exports = menu;
 
 