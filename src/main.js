const { go } = require('./system/system');
const service = require('./util/service');


const progressbar = document.getElementById('progress-bar-fill');


function onLoadTile () {
    let settings = {
        
        start : {
            x : document.getElementById('iStartX').value,
            y : document.getElementById('iStartY').value
        },
        end : {
            x : document.getElementById('iEndX').value,
            y : document.getElementById('iEndY').value
        },
        zoom : document.getElementById('iZoom').value
    }

    // settings.start.x = 69642;
    // settings.start.y = 69643;
    // settings.end.x = 44731;
    // settings.end.y = 44731;
    // settings.zoom = 17;

    service.samplesettings = settings;
    console.log (service.samplesettings);

    go(settings);    
}

function updateProgressBar (progress) {
    progressbar.style.width = `${progress}%`;
}

module.exports = {
    updateProgressBar : updateProgressBar,
}