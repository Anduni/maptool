const { StartSampleJob } = require('./system/system');
const { updateSample, Sample, Status } = require('./util/service');

const input_start_x = document.getElementById('input_start_x');
const input_start_y = document.getElementById('input_start_y');
const input_end_x = document.getElementById('input_end_x');
const input_end_y = document.getElementById('input_end_y');
const input_zoom = document.getElementById('input_zoom');

const input_btn_load = document.getElementById('input_btn_load');
input_btn_load.addEventListener('click', getInput);

const progressbar = document.getElementById('progress-bar-fill');

var sample = Sample();

input_start_x.value = sample.start.x;
input_start_y.value = sample.start.y;
input_end_x.value = sample.end.x;
input_end_y.value = sample.end.y;
input_zoom.value = sample.zoom;

function getInput () {
    if (Status() != 0) return;

    sample.start.x = input_start_x.value;
    sample.start.y = input_start_y.value;
    sample.end.x = input_end_x.value;
    sample.end.y = input_end_y.value;
    sample.zoom = input_zoom.value;

    updateSample(sample);
    StartSampleJob();
}

function updateProgressBar (progress) {
    progressbar.style.width = `${progress}%`;
}

module.exports = {
    updateProgressBar : updateProgressBar,
}