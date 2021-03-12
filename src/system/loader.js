const { createWriteStream, existsSync } = require('fs');
const { updateProgressBar } = require('../main');
const { Config } = require('../util/service');
const fs = require('fs');
const https = require('https');
const { writeFile } = require('fs-extra');

function downloadTile (path, zoom, tile) {
    // zoom = 17;
    // tile = {x: 69642, y: 44731};

    const filepath = `${path}/${tile.x}_${tile.y}_${zoom}.pbf`;
    const serverpath = `${Config().SERVER}/${zoom}/${tile.x}/${tile.y}.vector.pbf?access_token=${Config().TOKEN}`;
    
    // console.log(serverpath);
    return sleep(100); // download job dummy
    
    return new Promise ((resolve) => {
        if (existsSync(filepath)) {
            console.log('TILE ' + x + ', ' + y + ' -- already downloaded');
            resolve();
            return;
        }
        https.get(serverpath, (response) => {
            let file = createWriteStream(filepath);
            response.on('data', (chunk) => {
                file.write(chunk);
            });
            response.on('end', () => {
                file.end();
                console.log('TILE ' + x + ', ' + y + ' -- download successfull');
                // callback ------------------------------------ //
                resolve();
            });
            response.on('error', () => {
                console.log('error while downloading tile');
                resolve();
            });
        });
    });
    
    /*
    write chunks to data object
    save data object as .pbf file when done 
    */
    // writeFile('src/data/output', data);
}

// for dummy
const sleep = ms => { return new Promise(resolve => setTimeout(resolve, ms)); }

module.exports = {downloadTile : downloadTile}