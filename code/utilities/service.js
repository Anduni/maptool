const { app, Main } = require('electron');
const fs = require('fs');
const events = require('./events');
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
    
    UserDataPath : UserDataPath,
}

const userDataPath = app.getPath('userData') +'/';
function UserDataPath (file) {return userDataPath + file;}

// 0 ready; 1 loading; 2 sampling; -1 frozen
var status = 0;
function Status () {return status;}
function SetStatus (id) {
    status = id;
    sendEvent('status', status);
}

CheckUserData();

var config;
function Config () {return config;}
function updateConfig (data) {
    config = data;
    fs.writeFileSync(userDataPath + 'config.json', JSON.stringify(data, null, 2));
}

var sample;
function Sample () {return sample;}
function updateSample (data) {
    sample = data;
    fs.writeFileSync(userDataPath + 'sample.json', JSON.stringify(data, null, 2));
}

var filter;
function Filter () {return filter;}
function updateFilter (data) {
    filter = data;
    fs.writeFileSync(userDataPath + 'filter.json', JSON.stringify(data, null, 2));
}

function CheckUserData () {
    if(!fs.existsSync(UserDataPath('config.json'))) {
        config = DefaultConfig();
        fs.writeFileSync(UserDataPath('config.json'), JSON.stringify(config, null, 2));
    } else {
        config = JSON.parse(fs.readFileSync(UserDataPath('config.json')));
    }

    if(!fs.existsSync(UserDataPath('sample.json'))) {
        sample = DefaultSample();
        fs.writeFileSync(UserDataPath('sample.json'), JSON.stringify(sample, null, 2));
    } else {
        sample = JSON.parse(fs.readFileSync(UserDataPath('sample.json')));
    }

    if(!fs.existsSync(UserDataPath('filter.json'))) {
        filter = DefaultFilter();
        fs.writeFileSync(UserDataPath('filter.json'), JSON.stringify(filter, null, 2));
    } else {
        filter = JSON.parse(fs.readFileSync(UserDataPath('filter.json')));
    }

    if (!fs.existsSync(UserDataPath('buffer'))) {
        fs.mkdirSync(UserDataPath('buffer'));
    }
}
