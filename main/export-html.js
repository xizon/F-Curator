/**
 * Export HTML File
 */
 const path = require('path');
 const fs = require('fs');
 const archiver = require('archiver');
 const dabaBasePath = path.join(__dirname, '../db/');
 const { applicationName } = require('../package.json');
 
 /**
  * @param {String} sourceDir: /some/folder/to/compress
  * @param {String} outPath: /path/to/created.zip
  * @returns {Promise}
  */
 function zipDirectory(sourceDir, outPath) {
     const archive = archiver('zip', { zlib: { level: 9 } });
     const stream = fs.createWriteStream(outPath);
 
     return new Promise((resolve, reject) => {
         archive
             .directory(sourceDir, false)  // append files from a sub-directory, putting its contents at the root of archive
             .on('error', err => reject(err))
             .pipe(stream)
             ;
 
         stream.on('close', () => resolve());
         archive.finalize();
     });
 }
 
 function exportHtml( fn ) {
     // Dind the desktop path of macOS
     const homeDir = require('os').homedir(); // See: https://www.npmjs.com/package/os
     const desktopDir = `${homeDir}/Desktop`;
     zipDirectory(dabaBasePath, `${desktopDir}/${applicationName}-html.zip`).then((res) => {
        fn.call(null, `${desktopDir}/${applicationName}-html.zip`);
     });

 }
 
 module.exports = exportHtml;