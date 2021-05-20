var filter_entry_template = document.getElementById('filter-entry-template');
var panel_template = document.getElementById('panel-template');
var dropdown_entry_template = document.getElementById('dropdown-entry-template');

var filter_container = document.getElementById('filters');

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

var panels = [
    'layer',
    'geometry',
    'key',
    'value'
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
        if (panelname == 'value') panel.setAttribute('multiselect', true);

        filter_entry.appendChild(panel);
    });

    filter_container.appendChild(filter_entry);
    refreshFilter(filter_entry);
}



function onEntrySelected (entry) {
    var panel = filter_container.querySelector(`#${entry.parentNode.ref}`);
    let filterdata = getFilterData(panel.parentNode);

    let multiselect = panel.getAttribute('multiselect') == 'true';
    let selected = entry.getAttribute('selected') == 'true';
    let entryValue = entry.getAttribute('value');

    let valueList = panel.getAttribute('value');
    
    if (multiselect) {
        valueList = valueList.split(',');
        if (valueList[0] == '') valueList = [];
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

    console.log(filterdata);
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
    var valueEmpty = valueList[0] == ''; 
    let locked = panel.getAttribute('locked') == 'true';
    
    panel.querySelector('#value').innerHTML = ''; // clear content
    
    if (locked) {
        panel.classList.add('panel-locked');
        collapseDropdown(panel.querySelector('#dropdown'));
        setIcon(panel.querySelector('#btn-edit'), 'icon-locked gray');
        setIcon(panel.querySelector('#status'), 'none');
    }
    else {
        panel.classList.remove('panel-locked');
        valueList.forEach((entry) => {
            var node = document.createElement('div');
            node.textContent = entry;
            panel.querySelector('#value').appendChild(node);
        });

        if (valueEmpty) {
            setIcon(panel.querySelector('#status'), 'icon-warning red');
        }
        else {
            setIcon(panel.querySelector('#status'), 'icon-done green');
        }

        setIcon(panel.querySelector('#btn-edit'), 'icon-edit white');
    }

    fillDropdown(panel.querySelector('#dropdown'), valueList);
}


function onEdit (data) {
    var dropdown = filter_container.querySelector(`#${data.ref} #dropdown`); 
    var state = !(dropdown.getAttribute('expand') == 'true');
    state ? expandDropdown(dropdown) : collapseDropdown(dropdown);
}

function setIcon (icon, classlist) {
    icon.classList = '';
    classlist.split(' ').forEach((classEntry) => {
        icon.classList.add(classEntry);
    })
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

function resetDropdown (dropdown) {
    let entries = dropdown.children;
    for (i=0; i<entries.length; i++) {
        entries[i].classList.remove('selected');
        entries[i].setAttribute('selected', false);
    }
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

createEntry(0);