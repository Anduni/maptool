const { createWriteStream, existsSync } = require('fs');
const { updateProgressBar } = require('../main');
const { Config } = require('../util/service');
require('fs');
const https = require('https');

function downloadTile (path, zoom, tile) {
    zoom = 17;
    tile = {x: 69642, y: 44731};

    const filepath = `${path}/${tile.x}_${tile.y}_${zoom}.pbf`;
    const serverpath = `${Config().SERVER}/${zoom}/${tile.x}/${tile.y}.vector.pbf?access_token=${Config().TOKEN}`;
    
    console.log(serverpath);

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
        });
    });

}


async function download (tilebuffer, zoom, path) {
    for (i = 0; i < tilebuffer.length; i++) {
        await downloadTile(path, zoom, tilebuffer[i]);
        onProgress((i + 1) / tilebuffer.length * 100);
    }
}


function onProgress (progress) { updateProgressBar(progress) }

const sleep = ms => { return new Promise(resolve => setTimeout(resolve, ms)); }


module.exports = {
    DOWNLOAD : download,
}