const { BrowserWindow } = require("electron");

module.exports = {
    sendEvent : sendEvent
}

function sendEvent(event, data) 
{
    BrowserWindow.getFocusedWindow().webContents.send(event, data);
}