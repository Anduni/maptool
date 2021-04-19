const { ipcMain } = require("electron");
const { SetStatus, updateSample } = require("./utilities/service");
const { createStack } = require("./utilities/tiles");
const { sendEvent } = require("./utilities/events");
const { downloadTile } = require("./components/loader");
const { sampleStack } = require("./components/sampler");

function startSampleJob (data) {
    updateSample(data);
    SetStatus(1);
    downloadBuffer(createStack(data));
}

async function downloadBuffer (stack) {
    for (i = 0; i < stack.length; i++) {
        await downloadTile(stack[i]).then((result) => {
            sendEvent('progress', (i + 1) / stack.length);
        });
    }
    console.log('all tiles loaded');

    sampleStack(stack);
}

ipcMain.on('sample', (event, sample) => {
    console.log('-- sample event received');
    startSampleJob(sample);
});

console.log('--init system');
