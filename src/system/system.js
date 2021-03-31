const { BrowserWindow, ipcMain } = require("electron");
const { SetStatus, updateSample } = require("../util/service");
const { createStack } = require("../util/tiles");
const { downloadTile } = require("./loader");

function startSampleJob (data) {
    updateSample(data);
    SetStatus(1);
    downloadBuffer(createStack(data));
}

async function downloadBuffer (stack) {
    for (i = 0; i < stack.length; i++) {
        await downloadTile(stack[i]).then((result) => {
            // data = result;
            console.log(`downloaded tile ${i}`);
        });
        sendEvent('progress', (i+1)/stack.length);
    }
    SetStatus(0);
    // sampleBuffer(stack);
}

ipcMain.on('sample', (event, sample) => {
    console.log('-- sample event received');
    startSampleJob(sample);
});

//#region WORKING EVENT SENDER
function sendEvent(event, data) {
    BrowserWindow.getFocusedWindow().webContents.send(event, data);
}
//#endregion

console.log('--init system');