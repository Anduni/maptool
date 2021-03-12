const { CalculateTileBuffer } = require("../util/service");
const loader = require("./loader");
const { DOWNLOAD } = require("./loader");
const { SAMPLE } = require("./sampler");


async function go (settings) {
    var tilebuffer = CalculateTileBuffer(settings.start, settings.end);
    console.log(tilebuffer);

    await DOWNLOAD(tilebuffer, settings.zoom, 'src/data/buffer');
    SAMPLE(tilebuffer[0], settings.zoom, 'src/data/buffer')
}



async function downloadBuffer (tilebuffer, zoom, path) {
    for (i = 0; i < tilebuffer.length; i++) {
        await loader.downloadTile(path, zoom, tilebuffer[i]);
        onProgress((i + 1) / tilebuffer.length * 100);
    }
}

module.exports = {
    go : go,
}