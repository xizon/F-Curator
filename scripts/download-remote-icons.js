/**
 * Download remote icons
 */
const crawl = require('../main/crawl');
const path = require('path');

const Data = require('../db/db.json');

// Initialize the database
const StormDB = require('stormdb');
const engine = new StormDB.localFileEngine(path.join(__dirname, '../db/db.json'));
const db = new StormDB(engine);

Data.webList.forEach( item => {

    crawl(item.category, item.title, item.link, function (response) {

        // Save icon & save database
        if (typeof (response.error) === 'undefined') {
            db.get("webList").push(response);
            db.save();
        }

    }, 500000);
});


db.get("classList").set(Data.classList);
db.save();

