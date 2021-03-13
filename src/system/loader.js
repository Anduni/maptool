const { createWriteStream, existsSync } = require('fs');
const { Config } = require('../util/service');
const https = require('https');

function downloadTile (tile) {
    // const filepath = `${path}/${tile.x}_${tile.y}_${tile.z}.pbf`;
    const serverpath = `${Config().SERVER}/${tile.z}/${tile.x}/${tile.y}.vector.pbf?access_token=${Config().TOKEN}`;
    // console.log(serverpath);
    
    var data = "";
    return new Promise ((resolve) => {
        setTimeout(resolve, 100);
        data += "pbf data";
    });

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

}

const sleep = ms => { return new Promise(resolve => setTimeout(resolve, ms)); }

module.exports = {downloadTile : downloadTile}