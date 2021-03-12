const { CalculateTileBuffer } = require("../util/service");
const { DOWNLOAD } = require("./loader");
const { SAMPLE } = require("./sampler");


async function go (settings) {
    var tilebuffer = CalculateTileBuffer(settings.start, settings.end);
    console.log(tilebuffer);

    await DOWNLOAD(tilebuffer, settings.zoom, 'src/data/buffer');
    SAMPLE(tilebuffer[0], settings.zoom, 'src/data/buffer')
}


module.exports = {
    go : go,
}