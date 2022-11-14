/**
 * Extract remote resources
 */

/**
 * Usage:
 * 
const { save } = require('./downloader');
const path = require('path');
const targetDir = path.resolve(__dirname, `../db/img`);
save( 'https://examples.png', targetDir, function( res ) {
    console.log(res);
})();
 * 
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');

const { renameImage } = require('./rename.js');

const newDir = path.resolve(__dirname, `../db/img`);
if (!fs.existsSync(newDir)) {
    fs.mkdirSync(newDir);
}


function getBase64(url) {
    return axios
        .get(url, {
            timeout: 15000,
            responseType: 'arraybuffer'
        })
        .then(response => {
            return Buffer.from(response.data, 'binary').toString('base64');
        })
        .catch(error => {
            // return Promise.reject(error);
            if (error.response) {
                return 'e';
            }
            
    });
}



function save(url, targetDir, callback, name = '') {
	return async () => {
        const b64string = getBase64( url );
        let fileData = new Buffer.from(await b64string, 'base64');

        if ( fileData.toString() === '' ) {
            callback.call(null, null);
        } else {
            //console.log('fileData: ', fileData); // <Buffer ff d8 ff e0 00 . 15556 more bytes>
            
            const extension = path.extname(url);
            let fileName = (typeof(name) === 'undefined' || name === '' ) ? path.basename(url) : name;

            fileName = renameImage(url);
            const targetPath = `${targetDir}/${fileName}`;

            //
            if (!fs.existsSync(targetPath)) {
                fs.writeFileSync(targetPath, fileData);
            }

            callback.call(null, fileName);
        }

	}
}

function move(oldPath, newPath, callback) {
    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                console.log("err", err);

                callback(err);
            }
            return;
        }
        callback();
    });
    function copy() {
        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);
        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function () {
            let fileName = path.basename(newPath)
            console.log(fileName, "  file uploaded")
            //remove path from destination
            //fs.unlink(oldPath, callback);
            // do your stuff
        });
        readStream.pipe(writeStream);
    }
}

module.exports = {
    move,
    save
};