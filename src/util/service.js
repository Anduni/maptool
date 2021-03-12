module.exports = {
    Config : Config,
    CalculateTileBuffer : CalculateTileBuffer,
}

const fs = require('fs');

var config = {};

function Config () {
    return config;
}

function LoadConfig () {
    config = JSON.parse(fs.readFileSync('src/settings/config.json'));
    return config;
}

function SaveConfig (_config) {
    config = _config;
    fs.writeFileSync('src/settings/config.json', JSON.stringify(config));
}

function CalculateTileBuffer (startID, endID) {
    var tileBuffer = [];
    for (y = startID.y; y <= endID.y; y++) {
        for (x = startID.x; x <= endID.x; x++) {
            tile = {x : x, y : y,};
            tileBuffer.push(tile);
        }
    }
    console.log(`tilebuffer: ` + tileBuffer.length)
    return tileBuffer;
}

// init 
LoadConfig();