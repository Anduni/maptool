const { BrowserWindow } = require("electron");

module.exports = {
    sendEvent : sendEvent,
    updateMainWindow : updateMainWindow,
}

var mainWindow;
function updateMainWindow (window) {
    mainWindow = window;
}

function sendEvent(event, data) 
{
    mainWindow.webContents.send(event, data);
}