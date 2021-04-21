const fs = require('fs');
const { sendEvent } = require('./events');

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

var config = JSON.parse(fs.readFileSync('settings/config.json'));
function Config () {return config;}
function updateConfig (data) {
    config = data;
    fs.writeFileSync('settings/config.json', JSON.stringify(data, null, 2));
}

var sample = JSON.parse(fs.readFileSync('settings/sample.json'));
function Sample () {return sample;}
function updateSample (data) {
    sample = data;
    fs.writeFileSync('settings/sample.json', JSON.stringify(data, null, 2));
    // console.log(sample);
}

var filter = JSON.parse(fs.readFileSync('settings/filter.json'));
function Filter () {return filter;}
function updateFilter (data) {
    filter = data;
    fs.writeFileSync(`settings/filter.json`, JSON.stringify(data, null, 2));
}