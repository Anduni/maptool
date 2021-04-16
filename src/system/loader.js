const { createWriteStream, existsSync, readFileSync } = require('fs');
const { Config } = require('../util/service');
const https = require('https');

module.exports = {downloadTile : downloadTile}

function downloadTile (tile) {
    const filepath = `src/data/buffer/${tile.x}_${tile.y}_${tile.z}.pbf`;
    const serverpath = `${Config().SERVER}/${tile.z}/${tile.x}/${tile.y}.vector.pbf?access_token=${Config().TOKEN}`;

    return new Promise ((resolve) => {
        if (existsSync(filepath)) {
            setTimeout(resolve, 100);
            console.log('TILE ' + x + ', ' + y + ' -- already downloaded');
            return;
        }

        // console.log('-- DOWNLOAD LOCKED');
        // return;

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
