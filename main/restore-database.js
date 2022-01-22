/**
 * Restore the database(.zip)
 */
const path = require('path');
const extract = require('extract-zip')
const dabaBasePath = path.join(__dirname, '../db/');

/**
 * @param {String} sourceDir: /some/folder/to/compress.zip
 * @param {String} outPath: /path/to/
 * @returns {Promise}
 */
function unzipFile(sourceDir, outPath, fn) {
    return async () => {
        try {
            await extract(sourceDir, { dir: outPath });
            fn.call(null, outPath);
        } catch (err) {
            // handle any errors
            fn.call(null, err);
        }
    }
}

function restoreDatabase(sourceDir, fn) {
    unzipFile( sourceDir, dabaBasePath, fn)();
}


module.exports = restoreDatabase;

