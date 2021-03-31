const fs = require('fs');

module.exports = {
    Status : Status,
    SetStatus : SetStatus,
    Config : Config,
    Sample : Sample,
    updateConfig : updateConfig,
    updateSample : updateSample,
}

// 0 ready; 1 loading; 2 sampling; -1 frozen
var status = 0;
function Status () {return status;}
function SetStatus (id) {
    status = id;
}

var config = JSON.parse(fs.readFileSync('src/settings/config.json'));
function Config () {return config;}
function updateConfig (data) {
    config = data;
    fs.writeFileSync('src/settings/config.json', JSON.stringify(data));
}

var sample = JSON.parse(fs.readFileSync('src/settings/sample.json'));
function Sample () {return sample;}
function updateSample (data) {
    sample = data;
    fs.writeFileSync('src/settings/sample.json', JSON.stringify(data));
    console.log(sample);
}