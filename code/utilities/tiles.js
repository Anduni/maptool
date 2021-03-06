module.exports = {
    createStack : createStack,
}

/**
 * 
 * @param {sample} sample 
 * @returns stack of all tiles in the sample
 */
function createStack (sample) {
    var stack = [];
    for (y = sample.start.y; y <= sample.end.y; y++) {
        for (x = sample.start.x; x <= sample.end.x; x++) {
            tile = {
                x: x, 
                y: y, 
                z: sample.zoom
            };
            stack.push(tile);
        }
    }
    console.log(`stack size: ${stack.length}`);
    return stack;
}