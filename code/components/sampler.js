const VectorTile = require("@mapbox/vector-tile/lib/vectortile");
const { dialog } = require("electron");
const { readFileSync, writeFile } = require("fs");
const Pbf = require("pbf");
const { toPath } = require("svg-points");
const { gunzip } = require("zlib");
const { Config, Sample, SetStatus } = require("../utilities/service");
const { svgDoc, svgGroup, svgPath, toShape, svgShape } = require("./writer");

module.exports = {
    sampleStack : sampleStack,
}

var schema = [
    "road",
    "building",
    "water",
    "-"
]

var layerfilters = {
    road: {
        key: "class",
        values: [
            "path",
            "footway",
        ],
        type: "path" 
    },
    building: {
        key: "type",
        values: [
            "industrial",
            "residential",
            "building"
        ],
        type: "shape"
    },
    water: {
        key: "type",
        values: [],
        type: "shape"
    } 
}

function sampleStack (stack) {
    var content = {}
    var counter = 0;
    
    stack.forEach((tile) => {
        var buffer = readFileSync(`data/buffer/${tile.x}_${tile.y}_${tile.z}.pbf`);
        parseTile(buffer).then((data) => {
            console.log('--starting extract');
            content = extract(data, tile, content);
            
            counter++;
            if (counter >= stack.length) {
                var file = writeDoc(content);
                console.log('--finished extract');

                SaveFile(file);
                SetStatus(0);
            }
        });
    });
}


async function SaveFile (file) {
    var callback = await dialog.showSaveDialog({
        buttonLabel: 'Save',
        filters: [
            { name: 'SVG', extensions: ['svg'] },
          ]
    });
    
    console.log(callback.filePath);
    
    if(!callback.canceled) {
        writeFile(callback.filePath, file, () => {
            console.log(`--file saved at ${callback.filePath}`);
        });
    }
}


function extract (data, tile, content) {
    schema.forEach((layertype) => {

        // if layer doesnt exist skip
        if(!data.layers[layertype]) return;

        var key;
        if (layerfilters[layertype]) key = layerfilters[layertype].key;

        if (!content[layertype]) {content[layertype] = {};}
        if (!content[layertype]['other']) {content[layertype]['other'] = '';}

        
        // sample all features in layertype
        for (i = 0; i < data.layers[layertype].length; i++) 
        {
            const feature = data.layers[layertype].feature(i);
            const Class = feature.properties[key];
            const Geometry = feature.loadGeometry();

            // extract feature geometry to svg paths
            var featureContent = buildGeometry(Geometry, getSvgOffset(tile), layerfilters[layertype] && layerfilters[layertype].type == 'shape');
            // if (layerfilters[layertype] && layerfilters[layertype].type == 'shape') {
            //     featureContent = buildGeometry(Geometry, getSvgOffset(tile), true);
            // }

            var svgFeatureContent = svgGroup(`tile${tile.x}_${tile.y} feature${feature.id}`, featureContent, '\t\t\t');

            // if features class exists in filter push to category
            // else push to 'other'
            if (layerfilters[layertype] && layerfilters[layertype].values.indexOf(Class) > -1) {
                if (!content[layertype][Class]) {content[layertype][Class] = '';}
                content[layertype][Class] += svgFeatureContent;
            }

            else {content[layertype]['other'] += svgFeatureContent;}
        }
    });
    return content;
}


// -- HELPERS --

function parseTile (buffer) {
    return new Promise ((resolve) => {
        gunzip(buffer, (err, obuffer) => {
            pbuffer = new Pbf(obuffer);
            data = new VectorTile(pbuffer);
            resolve(data);
        })
    });
}

function buildGeometry (geometry, offset, shape=false) {
    var content = '';
    geometry.forEach((segment) => {
        segment.map((point) => {
            point.x = point.x * Config().scale + offset.x;
            point.y = point.y * Config().scale + offset.y;
        });
        
        if (shape) {
            var polygon = toShape(segment);
            content += svgShape(`shape${geometry.indexOf(segment)}`, polygon, '\t\t\t\t');
        } else {   
            var path = toPath(segment);
            content += svgPath(`path${geometry.indexOf(segment)}`, path, '\t\t\t\t', 0.25);
        }
    });

    return content;
}

function writeDoc (content) {
    var doc_content = '';
    schema.forEach((layertype) => {
        // if layer not sampled skip
        if (!content[layertype]) return;

        var layer_content = '';
        if (layerfilters[layertype]) {
            layerfilters[layertype].values.forEach((type) => {
                if (content[layertype][type]) layer_content += svgGroup(type, content[layertype][type], '\t\t');
            });
        }

        if(content[layertype]['other']) layer_content += svgGroup('other', content[layertype]['other'], '\t\t');
        doc_content += svgGroup(layertype, layer_content, '\t');
    });

    return svgDoc('document', doc_content, getSvgBounds().x, getSvgBounds().y);
}


function getSvgBounds () {
    var bounds = {
        x: (Sample().end.x - Sample().start.x + 1) * Config().tilescale * Config().scale,
        y: (Sample().end.y - Sample().start.y + 1) * Config().tilescale * Config().scale,
    }
    return bounds;
}

function getSvgOffset (tile) {
    return {
        x: (tile.x - Sample().start.x) * Config().tilescale * Config().scale,
        y: (tile.y - Sample().start.y) * Config().tilescale * Config().scale,
    }
}