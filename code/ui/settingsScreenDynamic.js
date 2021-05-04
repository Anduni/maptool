var filter_entry_template = document.getElementById('filter-entry-template');
var panel_template = document.getElementById('panel-template');
var dropdown_entry_template = document.getElementById('dropdown-entry-template');

var filter_container = document.getElementById('filters');


var filter = {
    
    layers: [
        "road",
        "building",
        "water",
        "rail"
    ],
    
    road: {
        layer: "road",
        geometrytype: "path",
        key: "type",
        values: [
            "footway",
            "path",
            "value",
        ]
    },

    building: {
        layer: "building",
        geometrytype: "shape",
        key: "type",
        values: [
            "industrial",
            "building"
        ],
    },

    water: {
        layer: "water",
        geometrytype: "shape",
        key: "type",
        values: [
            "river"
        ],
    }

}

function createEntry (index) {
    var current_layer = filter.layers[index];

    var current_filter = {
        layer : current_layer,
        geometry : filter[current_layer].geometrytype,
        key : filter[current_layer].key,
        value : filter[current_layer].values,
    }

    var filter_entry_instance = document.importNode(filter_entry_template.content, true);
    
    panels.forEach((panelname) => {
        var id = `filter_${index}_${panelname}`;
        
        var panel_instance = document.importNode(panel_template.content, true);
        panel_instance.querySelector('#panel').id = id + '_panel';
        panel_instance.querySelector('#btn-edit').ref = id;
        panel_instance.querySelector('#key').textContent = panelname;
        panel_instance.querySelector('#value').textContent = current_filter[panelname];

        var dropdown = panel_instance.querySelector('#dropdown');
        dropdown.id = id + '_dropdown';

        source_content.forEach((entry) => {    
            var dropdown_entry_instance = document.importNode(dropdown_entry_template.content, true);
            dropdown_entry_instance.querySelector('span').ref = id;
            dropdown_entry_instance.querySelector('span').textContent = entry;

            dropdown.appendChild(dropdown_entry_instance);
        }); 
        filter_entry_instance.querySelector('#filter-entry').appendChild(panel_instance);
    });

    filter_container.appendChild(filter_entry_instance);
}

function newLayerDropdown (dropdown, id) {
    var dropdown_content = filter_schema.layer;
    dropdown_content.forEach((entry) => {    
        var dropdown_entry_instance = document.importNode(dropdown_entry_template.content, true);
        dropdown_entry_instance.querySelector('span').ref = id;
        dropdown_entry_instance.querySelector('span').textContent = entry;

        dropdown.appendChild(dropdown_entry_instance);
    }); 
}

function newGeometrytypeDropdown (dropdown) {}
function newKeyDropdown (dropdown) {}
function newValueDropdown (dropdown) {}



function onEntrySelected (entry) {
    var id = entry.ref;
    var value = filter_container.querySelector(`#${id}_panel`).querySelector('#value');
    // value.innerText = entry.textContent;

    let isMultiselect = entry.getAttribute('multiselect') == 'true';
    let isSelected = entry.getAttribute('selected') == 'true';


    if (isMultiselect) {
        entry.setAttribute('selected', !isSelected);
        isSelected ? entry.classList.remove('selected') : entry.classList.add('selected');

        // ## add entry to value list
        // ## update valuelist
        let valuelist = value.getAttribute('value').split(',');
        console.log(valuelist);
        
        isSelected ? valuelist.splice(valuelist.indexOf(entry.textContent), 1) : valuelist.push(entry.textContent);

        value.setAttribute('value', valuelist);
        value.innerText = value.getAttribute('value');
    }
    else {
        // close list
        filter_container.querySelector(`#${id}_dropdown`).classList.remove('expand');
        filter_container.querySelector(`#${id}_dropdown`).setAttribute('value', false);
    
        // purge list
        resetDropdown(id);
        entry.setAttribute('selected', true);
        entry.classList.add('selected');
        
        // ## replace value with entry value
        value.setAttribute('value', entry.textContent);
        value.innerText = entry.textContent;
    }
}


function resetDropdown (id) {
    let entries = filter_container.querySelector(`#${id}_dropdown`).children;
    for (i=0; i<entries.length; i++) {
        entries[i].classList.remove('selected');
        entries[i].setAttribute('selected', false);
    }
}


function onEdit (data) {
    var dropdown = filter_container.querySelector(`#${data.ref}_dropdown`);
    var state = dropdown.getAttribute('value') == 'true';
    state = !state;
    state ? dropdown.classList.add('expand') : dropdown.classList.remove('expand');
    dropdown.setAttribute('value', state);
}


var panels = [
    'layer',
    'geometry',
    'key',
    'value'
]

var source_content = [
    'entry0',
    'entry1',
    'entry2',
]

const filter_schema = {
    layer : [
        "road",
        "building",
        "water",
    ],

    geometrytype : [
        "path", 
        "shape"
    ],

    road : {
        keys: [
            "class", 
            "type"
        ],
        values : {
            class : [
                "path",
                "footway",
                "walkway"
            ],
            type : [
                "residential",
                "public",
            ]
        },
    },

    building : {
        keys: [
            "type"
        ],
        values : {
            type : [
                "residential",
                "industrial",
            ]
        },
    },

    water : {
        keys: [
            "class", 
            "type"
        ],
        values : {
            class : [
                "river",
                "lake",
                "canal"
            ],
            type : [
                "natural",
                "artificial",
            ]
        },
    }
}


createEntry(0);
// createEntry(1);
// createEntry(2);
