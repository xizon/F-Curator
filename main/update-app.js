/**
 * Update Application
 */
 const axios = require('axios');
 const { version } = require('../package.json');
 
 function versionCompare(v1, v2, options) {
     let lexicographical = options && options.lexicographical,
         zeroExtend = options && options.zeroExtend,
         v1parts = v1.split('.'),
         v2parts = v2.split('.');
 
     function isValidPart(x) {
         return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
     }
 
     if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
         return NaN;
     }
 
     if (zeroExtend) {
         while (v1parts.length < v2parts.length) v1parts.push("0");
         while (v2parts.length < v1parts.length) v2parts.push("0");
     }
 
     if (!lexicographical) {
         v1parts = v1parts.map(Number);
         v2parts = v2parts.map(Number);
     }
 
     for (let i = 0; i < v1parts.length; ++i) {
         if (v2parts.length == i) {
             return 1;
         }
 
         if (v1parts[i] == v2parts[i]) {
             continue;
         }
         else if (v1parts[i] > v2parts[i]) {
             return 1;
         }
         else {
             return -1;
         }
     }
 
     if (v1parts.length != v2parts.length) {
         return -1;
     }
 
     return 0;
 }
 
 function githubReleaseApi() {
     const feedURL = 'https://api.github.com/repos/xizon/F-Curator/releases';
 
     return axios
         .get(feedURL, {
             timeout: 15000
         })
         .then(response => {
             return response.data;
         })
         .catch(error => {
             // return Promise.reject(error);
             if (error.response) {
                 return 'e';
             }
 
         });
 }
 
 
 function updateApp(fn) {
     return async () => {
         const appInfo = await githubReleaseApi();
         const currentVer = version;
         const latestVer = appInfo[0].tag_name.trim().toLowerCase().replace('version','v').replace('v','');
 
         const hasLatest = versionCompare(currentVer, latestVer);
 
         //console.log(appInfo);
         //console.log(versionCompare(currentVer, latestVer));
 
         if ( hasLatest === -1 ) {
             fn.call(null,latestVer);
             //console.log( "A new update is ready to install", `Version ${latestVer} is downloaded and will be automatically installed on Quit` );
         }
     }
 }
 
 module.exports = updateApp;