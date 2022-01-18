/**
 * Generate html file
 */
const path = require('path');
const fs = require('fs');

function buildHtml(htmlFilePath, folderPath, folderName, logoPath, fn) {

    // read HTML source code
    //------------------
    if ( fs.existsSync( htmlFilePath ) ) {
        fs.readFile( htmlFilePath, 'utf8', function( err, htmlContent ) {
            if ( err ) throw err;
            
            // CSS file
            const cssPath = `${folderPath}/app.min.css`;

            if ( fs.existsSync( cssPath ) ) {
                fs.readFile( cssPath, 'utf8', function( err, cssContent ) {
                    if ( err ) throw err;

                    const logo = fs.readFileSync(logoPath, {encoding: 'base64'});
                    const imgPathRegExp = new RegExp(`file://${path.join(__dirname, '../db')}`, 'g' );
                    const folderNameRegExp = new RegExp(`./${folderName}`, 'g' );
                    htmlContent = htmlContent.replace(/<link\s+rel\=\"stylesheet\".*?>/ig, `<style id="app.min.css">
                    ${cssContent}
                    .app-content__wrapper .content__sidebar {
                        width: 100px;
                      }
                      .app-content__wrapper .content-area {
                        width: calc(100% - 98px);
                      }
                      .app-content__wrapper .content__sidebar .board {
                        width: 189px;
                        padding-bottom: 10px;
                        transform: translateX(-46px);
                        border-radius: 0;
                        bottom: 0;
                        top: 0;
                      }
                      .app-content__wrapper .content__sidebar .board .secondary-btn a {
                        display: none;
                      }
                      .app-content__wrapper .content__sidebar .board .brand img {
                        width: 70px;
                      }
                      .ant-modal-root {
                        display: none;
                      }
                    </style>`)
                    .replace(/<script.*?>(.*?)<\/script>/ig, '')
                    .replace(/<a\s+class\=\"app-deletebtn-project\".*?>(.*?)<\/a>/ig, '')
                    .replace(/<div\s+class\=\"addnew\".*?>(.*?)<\/div>/ig, '')
                    .replace(imgPathRegExp, '.')
                    .replace(folderNameRegExp, './img')
                    .replace(/<div\s+class\=\"brand\".*?>(.*?)<\/div>/ig, `<div class="brand"><img src="data:image/png;base64, ${logo}"></div>`);

                    // remove file folder
                    //------------------
                    fs.rmdirSync(folderPath, { recursive: true });
                 
                    // re-build file
                    //------------------
                    const stream = fs.createWriteStream(htmlFilePath);
                    stream.once('open', function (fd) {
                        stream.end(htmlContent);
                        fn.call(null, fd);
                    });

        
                });
            
            }
                    


        });
    
    }





}

module.exports = buildHtml;

