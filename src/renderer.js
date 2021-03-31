const { ipcRenderer } = require('electron');
const { readFileSync } = require('original-fs');

var status = 0;

const input_start_x = document.getElementById('input_start_x');
const input_start_y = document.getElementById('input_start_y');
const input_end_x = document.getElementById('input_end_x');
const input_end_y = document.getElementById('input_end_y');
const input_zoom = document.getElementById('input_zoom');

const progressbar = document.getElementById('progress-bar-fill');
const input_btn_load = document.getElementById('input_btn_load');
input_btn_load.addEventListener('click', collectInput);

var sample = JSON.parse(readFileSync('src/settings/sample.json'));

input_start_x.value = sample.start.x;
input_start_y.value = sample.start.y;
input_end_x.value = sample.end.x;
input_end_y.value = sample.end.y;
input_zoom.value = sample.zoom;

function collectInput () 
{
    if (status != 0) return;

    sample.start.x = input_start_x.value;
    sample.start.y = input_start_y.value;
    sample.end.x = input_end_x.value;
    sample.end.y = input_end_y.value;
    sample.zoom = input_zoom.value;

    console.log('--sample event sent')
    ipcRenderer.send('sample', sample);

}

function onProgress (progress) {progressbar.style.width = `${progress*100}%`;}
function onStatus (id) {status = id;}
function setLoadButtonActive (active) {}


//#region WORKING EVENT HANDLER
ipcRenderer.on('progress', (event, progress) => {
    onProgress(progress);
});
//#endregion