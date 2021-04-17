const { ipcMain } = require("electron");
const { SetStatus, updateSample } = require("../util/service");
const { createStack } = require("../util/tiles");
const { sendEvent } = require("./events");
const { downloadTile } = require("./loader");
const { sampleStack } = require("./sampler");

function startSampleJob (data) {
    updateSample(data);
    SetStatus(1);
    downloadBuffer(createStack(data));
}

async function downloadBuffer (stack) {
    for (i = 0; i < stack.length; i++) {
        await downloadTile(stack[i]).then((result) => {
            // data = result;
            // console.log(`downloaded tile ${i}`);
            sendEvent('progress', (i + 1) / stack.length);
        });
    }
    console.log('all tiles loaded');
    SetStatus(0);

    // sampleBuffer(stack);

    sampleStack(stack);
}

ipcMain.on('sample', (event, sample) => {
    console.log('-- sample event received');
    startSampleJob(sample);
});


console.log('--init system');
