const { app } = require('electron');
const fs = require('fs');
const { sendEvent } = require('./events');
const { DefaultConfig, DefaultSample, DefaultFilter } = require('./templates');

module.exports = {
    Status : Status,
    SetStatus : SetStatus,
    Config : Config,
    updateConfig : updateConfig,
    Sample : Sample,
    updateSample : updateSample,
    Filter : Filter,
    updateFilter : updateFilter,
}

// 0 ready; 1 loading; 2 sampling; -1 frozen
var status = 0;
function Status () {return status;}
function SetStatus (id) {
    status = id;
    sendEvent('status', status);
}

const userpath = app.getPath('userData');
console.log(userpath);

var config = JSON.parse(fs.readFileSync(userpath + '/Local Storage/config.json'));
function Config () {return config;}
function updateConfig (data) {
    config = data;
    fs.writeFileSync(userpath + '/Local Storage/config.json', JSON.stringify(data, null, 2));
}

var sample = JSON.parse(fs.readFileSync(userpath + '/Local Storage/sample.json'));
function Sample () {return sample;}
function updateSample (data) {
    sample = data;
    fs.writeFileSync(userpath + '/Local Storage/sample.json', JSON.stringify(data, null, 2));
}

var filter = JSON.parse(fs.readFileSync(userpath + '/Local Storage/filter.json'));
function Filter () {return filter;}
function updateFilter (data) {
    filter = data;
    fs.writeFileSync(userpath + '/Local Storage/filter.json', JSON.stringify(data, null, 2));
}
