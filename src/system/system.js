const main = require("../main");
const { Sample, SetStatus } = require("../util/service");
const { createStack } = require("../util/tiles");
const { downloadTile } = require("./loader");

module.exports = {
    StartSampleJob : StartSampleJob,
}

function StartSampleJob() {
    SetStatus(1);
    downloadBuffer(createStack(Sample()));
}

async function downloadBuffer (stack) {
    for (i = 0; i < stack.length; i++) {
        await downloadTile(stack[i]);
        console.log(`${(i + 1) / stack.length * 100}% done`);
        main.updateProgressBar((i + 1) / stack.length * 100);
    }
    SetStatus(0);
}