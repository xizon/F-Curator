/**
 * Crawl and validation check for URL
 */

const { save } = require('./downloader');
const path = require('path');
const targetDir = path.resolve(__dirname, `../db/img`);

//Crawl libraries
const got = require('got');
const jsdom = require("jsdom");
const JSDOM = jsdom.JSDOM;


function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

function crawl(category = '', title = '', vgmUrl, fn) {
    
    vgmUrl = vgmUrl.replace(/\/\s*$/, '' );

    if ( !isValidHttpUrl( vgmUrl ) ) {
        fn.call(null, {'error':  'Illegal URL'});
        return;
    }

    let res = {};
    got(vgmUrl, {
        timeout: {
            request: 5000
        }
    }).then(response => {
        const dom = new JSDOM(response.body);
        let _title = dom.window.document.querySelector('title').textContent;
        let _icon = dom.window.document.head.querySelectorAll('link[rel~="icon"]')[0].href;

        
        //check title
        if ( typeof(title) !== 'undefined' && title !== '' ) _title = title;

        //check icon
        if ( _icon.substr(0, 2) === '//' ) {
            const _url = new URL(vgmUrl);
            const _protocol = _url.protocol;
            _icon = _protocol + _icon;
        }
    
        if ( isValidHttpUrl(_icon) ) {

            //delete Search Params
            const _iconNew = new URL(_icon);
            const _iconParams = _iconNew.search;
            _icon = _icon.replace(_iconParams,'');
            
            save( _icon, targetDir, function( fileName ) {
                res = {
                    'category': category,
                    'title': _title.substring(0, 30),
                    'link': vgmUrl,
                    'icon': fileName !== null ? `../db/img/${fileName}` : ''
                };
                fn.call(null, res);
            })();
        } else {
            res = {
                'category': category,
                'title': _title.substring(0, 30),
                'link': vgmUrl,
                'icon': ''
            };
            fn.call(null, res);
        }


    }).catch(err => {

        res = {
            'category': category,
            'title': ( typeof(title) !== 'undefined' && title !== '' ) ? title.substring(0, 30) : 'Untitled',
            'link': vgmUrl,
            'icon': ''
         };

         fn.call(null, res);
    });

}

module.exports = crawl;

