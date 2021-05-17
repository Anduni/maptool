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


var test_filter = {
    layer: 'road',
    geometry: 'path',
    key: 'class',
    value: [
        'footway',
    ]
}

var empty_filter = {
    layer: '',
    geometry: '',
    key: '',
    value: []
}


var dependencies = {
    layer: null,
    geometry: null,
    key : 'layer',
    value: 'key'
}

function createEntry (index, filterdata = empty_filter) {
    var filterId = `filter${index}`;
    var filter_entry = document.importNode(filter_entry_template.content, true).querySelector('#filter-entry');
    filter_entry.id = filterId;

    setFilterData(filter_entry, filterdata);
    
    panels.forEach((panelname) => {
        var panelId = `${filterId}_${panelname}`;
        
        var panel = document.importNode(panel_template.content, true).querySelector('#panel');
        panel.id = panelId;

        panel.querySelector('#key').textContent = panelname;

        panel.setAttribute('filter', filterId);
        panel.setAttribute('panelname', panelname);
        panel.setAttribute('value', filterdata[panelname]);
        panel.setAttribute('dependency', dependencies[panelname]);

        panel.querySelector('#btn-edit').ref = panelId;
        panel.querySelector('#dropdown').ref = panelId;

        var sourceList;
        if(dependencies[panelname] == null || filterdata[dependencies[panelname]] != '') 
        sourceList = getSourceList(panelname, filterdata);

        panel.querySelector('#dropdown').setAttribute('sourcelist', sourceList);

        // make value panel a multiselect one
        if (panelname == 'value') {
            panel.setAttribute('multiselect', true);
        }

        filter_entry.appendChild(panel);
    });

    console.log(filter_entry);
    filter_container.appendChild(filter_entry);

   
    refreshFilter(filter_entry);

    // ## PRELIMINARY FILL CALL
    // drawPanel(filter_entry.querySelector(`#${filterId}_layer`));
    // drawPanel(filter_entry.querySelector(`#${filterId}_geometry`));
    // drawPanel(filter_entry.querySelector(`#${filterId}_key`));
    // drawPanel(filter_entry.querySelector(`#${filterId}_value`));
}

function getSourceList (panelname, filterdata) {
    switch (panelname) {
        case 'layer':
            return filter_schema.layer;
        case 'geometry':
            return filter_schema.geometrytype;
        case 'key':
            return filter_schema[filterdata.layer].key;
        case 'value':
            return filter_schema[filterdata.layer].value[filterdata.key];
    }
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


function onEntrySelected (entry) {
    var panel = filter_container.querySelector(`#${entry.parentNode.ref}`);
    let filterdata = getFilterData(panel.parentNode);

    let multiselect = panel.getAttribute('multiselect') == 'true';
    let selected = entry.getAttribute('selected') == 'true';
    let entryValue = entry.getAttribute('value');

    let valueList = panel.getAttribute('value');
    if (multiselect) valueList = valueList.split(',');

    if (multiselect) {
        selected ? valueList.splice(valueList.indexOf(entryValue), 1) : valueList.push(entryValue);
    }
    else {  
        valueList = entryValue;
        collapseDropdown(panel.querySelector('#dropdown'));
    }

    // if entry hasnt changed, return
    if (!multiselect && selected) return;
    
    // reset panels that have dependencies to this panel
    panels.forEach((panelname) => {
        if (dependencies[panelname] == panel.getAttribute('panelname')) {
            filterdata[panelname] = '';
        }
    })

    // ## update filterdata
    filterdata[panel.getAttribute('panelname')] = valueList;
    setFilterData(panel.parentNode, filterdata);

    refreshFilter(panel.parentNode);
}



function redrawPanel (panel) {
    // var panel = filter_container.querySelector(`#${panelID}`);
    panel.querySelector('#value').innerText = panel.getAttribute('value');
    console.log(panel);

    var filterEntry = panel.parentElement;
    filterEntry.setAttribute(panel.getAttribute('panel'), panel.getAttribute('value'));

    redrawFilter(panel.parentElement);

    // ## redraw all panel components
}
function redrawFilter (filterEntry) {
    var filterdata = getFilterData(filterEntry);
    console.log(filterdata);

    panels.forEach((panelname) => {
        var sourceList = [];

        if(panelname == 'layer' || panelname == 'geometry') return;

        var panel = filterEntry.querySelector(`#${filterEntry.id}_${panelname}`);

        switch (panelname) {
            case 'key':
                if (filterdata.layer == 'none') {
                    sourceList = [];
                    panel.setAttribute('locked', true);
                    panel.classList.add('panel-locked');
                }
                else {
                    sourceList = filter_schema[filterdata.layer].key;
                    console.log(filterdata.layer);
                    panel.setAttribute('locked', false);
                    panel.classList.remove('panel-locked');
                } 
                break;

            case 'value':
                if (filterdata.key == 'none') {
                    sourceList = [];
                    panel.setAttribute('locked', true);
                    panel.classList.add('panel-locked');
                }
                else {
                    sourceList = filter_schema[filterdata.layer].value[filterdata.key];
                    panel.setAttribute('locked', false);
                    panel.classList.remove('panel-locked');
                } 
                break;
        }

        var dropdown = panel.querySelector(`#dropdown`);
        console.log(sourceList);
        fillDropdown(dropdown);
    });
}


function refreshFilter (filterEntry) {
    var filterdata = getFilterData(filterEntry);
    panels.forEach((panelname) => {
        let panel = filterEntry.querySelector(`#${filterEntry.id}_${panelname}`);
        let locked = filterdata[dependencies[panelname]] == '' && dependencies[panelname] != null;
    
        if (!locked) {
            var sourceList = getSourceList(panel.getAttribute('panelname'), filterdata);
            panel.querySelector('#dropdown').setAttribute('sourcelist', sourceList);
        }

        panel.setAttribute('value', filterdata[panelname]);
        panel.setAttribute('locked', locked);
        drawPanel(panel);
    });
}

function drawPanel (panel) {
    var valueList = panel.getAttribute('value').split(',');
    let locked = panel.getAttribute('locked') == 'true';
    
    panel.querySelector('#value').innerHTML = ''; // clear content
    
    if (locked) {
        panel.classList.add('panel-locked');
        collapseDropdown(panel.querySelector('#dropdown'));
    }
    else {
        panel.classList.remove('panel-locked');
        valueList.forEach((entry) => {
            var node = document.createElement('div');
            node.textContent = entry;
            panel.querySelector('#value').appendChild(node);
        });
    }

    fillDropdown(panel.querySelector('#dropdown'), valueList);
}


function onEdit (data) {
    var dropdown = filter_container.querySelector(`#${data.ref} #dropdown`); 
    var state = !(dropdown.getAttribute('expand') == 'true');
    state ? expandDropdown(dropdown) : collapseDropdown(dropdown);
}


// ## DROPDOWN HELPERS

function expandDropdown(dropdown) {
    dropdown.setAttribute('expand', true);
    dropdown.classList.add('expand');
}

function collapseDropdown(dropdown) {
    dropdown.setAttribute('expand', false);
    dropdown.classList.remove('expand');
}

function fillDropdown (dropdown, valueList) {
    var sourceList = dropdown.getAttribute('sourcelist').split(',');    
    dropdown.innerHTML = '';
    // refill dropdown with new content
    sourceList.forEach((entry) => {
        var dropdown_entry = document.importNode(dropdown_entry_template.content, true).querySelector('span');
        dropdown_entry.setAttribute('value', entry);
        dropdown_entry.textContent = entry;
        if (valueList.indexOf(entry) > -1) {
            dropdown_entry.classList.add('selected');
            dropdown_entry.setAttribute('selected', true);
        }

        dropdown.appendChild(dropdown_entry);
    });
}

function resetDropdown (dropdown) {
    let entries = dropdown.children;
    for (i=0; i<entries.length; i++) {
        entries[i].classList.remove('selected');
        entries[i].setAttribute('selected', false);
    }
}


// ## FILTER HELPERS

function setFilterData (filterEntry, filterdata) {
    panels.forEach((panelname) => {
        filterEntry.setAttribute(panelname, filterdata[panelname]);
    });
}

function getFilterData (filterEntry) {
    var filterdata = {};
    panels.forEach((panelname) => {
        filterdata[panelname] = filterEntry.getAttribute(panelname);
    });
    return filterdata;
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
        key: [
            "class", 
            "type"
        ],
        value : {
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
        key: [
            "type"
        ],
        value : {
            type : [
                "residential",
                "industrial",
            ]
        },
    },

    water : {
        key: [
            "class", 
            "type"
        ],
        value : {
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
