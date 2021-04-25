const { ipcRenderer, remote } = require('electron');
const { readFileSync } = require('original-fs');

var status = 0;

const input_start_x = document.getElementById('input_start_x');
const input_start_y = document.getElementById('input_start_y');
const input_end_x = document.getElementById('input_end_x');
const input_end_y = document.getElementById('input_end_y');
const input_zoom = document.getElementById('input_zoom');

const progressbar = document.getElementById('progress-bar-fill');
const input_btn_load = document.getElementById('btn-load');
input_btn_load.addEventListener('click', collectInput);

document.querySelector('#btn-settings').addEventListener('click', function() {ipcRenderer.send('settings');});


var sample = JSON.parse(readFileSync(remote.app.getPath('userData') + '/Local Storage/sample.json'));

input_start_x.value = sample.start.x;
input_start_y.value = sample.start.y;
input_end_x.value = sample.end.x;
input_end_y.value = sample.end.y;
input_zoom.value = sample.zoom;

function collectInput () 
{
    if (status != 0) return console.log('--load not available');

    sample.start.x = parseInt(input_start_x.value, 10);
    sample.start.y = parseInt(input_start_y.value, 10);
    sample.end.x = parseInt(input_end_x.value, 10);
    sample.end.y = parseInt(input_end_y.value, 10);
    
    sample.zoom = parseInt(input_zoom.value, 10);

    sample.center = {
        x: sample.start.x - Math.floor(0.5 * (sample.end.x - sample.start.x)),
        y: sample.start.y - Math.floor(0.5 * (sample.end.y - sample.start.y)),
    }

    console.log('--sample event sent')
    ipcRenderer.send('sample', sample);

    setProgress(0);
}

function setProgress (progress, smooth=false) 
{
    smooth ? progressbar.classList.add('smooth') : progressbar.classList.remove('smooth'); 
    progressbar.style.width = `${progress*100}%`;
}

function setStatus (id) {status = id;}

function setLoadButton (available) {
    available ? input_btn_load.classList.remove('locked') : input_btn_load.classList.add('locked');
}

//#region WORKING EVENT HANDLER
ipcRenderer.on('progress', (event, progress) => {
    setProgress(progress, true);
});

ipcRenderer.on('status', (event, status) => {
    setStatus(status);
    setLoadButton(status == 0);
    if(status == 0) { setProgress(0); }
})


//#endregion