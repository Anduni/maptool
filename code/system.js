const { ipcMain, BrowserWindow } = require("electron");
const { SetStatus, updateSample, updateFilter } = require("./utilities/service");
const { createStack } = require("./utilities/tiles");
const { sendEvent } = require("./utilities/events");
const { downloadTile } = require("./components/loader");
const { sampleStack } = require("./components/sampler");
const { readFileSync } = require("original-fs");

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

ipcMain.on('filter', (event, filter) => {
    updateFilter(filter);
});

ipcMain.on('settings', (event) => {
    var settingsWindow = new BrowserWindow({
        width: 480,
        height: 720,
        icon: "asset/icon.ico",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule : true
        }
    });
    
    settingsWindow.loadFile('asset/views/settingsScreen.html');
    settingsWindow.setMenuBarVisibility(false);
})

console.log('--init system');
