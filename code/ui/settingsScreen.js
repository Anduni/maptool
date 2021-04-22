const { ipcRenderer } = require('electron');
const fs = require('fs');

var filter_entry_template = document.getElementById('filter-entry-template');
var filter_value_template = document.getElementById('filter-value-template');

var filter_container = document.getElementById('filters');
document.querySelector('#btn-save').addEventListener('click', SaveFilters);

var filter = JSON.parse(fs.readFileSync(`settings/filter.json`));

// var filter = {
//     layers: [
//         "road",
//         "building",
//         "water",
//         "rail"
//       ],
//       rail: {
//           key: "abc",
//           values: [
//               "a",
//               "b",
//               "c"
//           ]
//       },
//       road: {
//         key: "type",
//         values: [
//           "footway",
//           "path"
//         ],
//         type: "path"
//       },
//       building: {
//         key: "type",
//         values: [
//           "industrial",
//           "building"
//         ],
//         type: "shape"
//       },
//       water: {
//         key: "type",
//         values: [
//             "river"
//         ],
//         type: "shape"
//       }
// }

PopuplateFilterInputs(filter);

function PopuplateFilterInputs (_filter) {
    _filter.layers.forEach((layer) => {
        var entry_instance = document.importNode(filter_entry_template.content, true);
        entry_instance.querySelector('#filter-layer').value = layer;
        entry_instance.querySelector('#filter-key').value = _filter[layer].key;
        entry_instance.querySelector('button').addEventListener('click', function() {addValueField(layer);});
        entry_instance.querySelector('#geometry-type').value = _filter[layer].geometrytype;
        
        _filter[layer].values.forEach((value) => {
            var value_instance = document.importNode(filter_value_template.content, true);
            value_instance.querySelector('#filter-value').value = value;
            value_instance.querySelector('button').addEventListener('click', function () {removeValueField(layer, value);})
            entry_instance.querySelector('#filter-values').appendChild(value_instance);
        });
        filter_container.appendChild(entry_instance);
    });
}

function addValueField(layer) {
    filter[layer].values.push("");
    console.log(filter);
    ResetAllInputs();
    PopuplateFilterInputs(filter);
}

function removeValueField (layer, value) {
    filter[layer].values.splice(filter[layer].values.indexOf(value, 1));
    console.log(filter);
    ResetAllInputs();
    PopuplateFilterInputs(filter);
}

function ResetAllInputs () {
    var filter_entries = document.querySelectorAll('#filter-entry');
    for (entry of filter_entries) {
        filter_container.removeChild(entry);
    }
}

function SaveFilters () {
    var _filter = {layers: []}
    var filter_entries = document.querySelectorAll('#filter-entry');
    for (entry of filter_entries) {
        const layer = entry.querySelector('#filter-layer').value;
        const geometry_type = entry.querySelector('#geometry-type').value;
        const key = entry.querySelector('#filter-key').value;
        var filter_values = entry.querySelectorAll('#filter-value');
        
        var values = [];
        for (value of filter_values) {values.push(value.value);}

        _filter.layers.push(layer);
        _filter[layer] = {};
        _filter[layer].key = key;
        _filter[layer].values = values;
        _filter[layer].geometrytype = geometry_type;
    }
    // send filter to main process to save
    filter = _filter;
    ipcRenderer.send('filter', filter);
    console.log(_filter);
}
