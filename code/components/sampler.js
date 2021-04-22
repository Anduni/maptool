const VectorTile = require("@mapbox/vector-tile/lib/vectortile");
const { dialog } = require("electron");
const { readFileSync, writeFile } = require("fs");
const Pbf = require("pbf");
const { toPath } = require("svg-points");
const { gunzip } = require("zlib");
const { Config, Sample, SetStatus, updateFilter, Filter } = require("../utilities/service");
const { svgDoc, svgGroup, svgPath, toShape, svgShape } = require("./writer");

module.exports = {
    sampleStack : sampleStack,
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
        filter: [
            { name: 'SVG', extensions: ['svg'] },
          ]
    });
    
    if (!callback.canceled) {
        writeFile(callback.filePath, file, () => {
            console.log(`--file saved at ${callback.filePath}`);
        });
    }
    else if (callback.canceled) {
        console.log('--save canceled');
    }
}


function extract (data, tile, content) {
    Filter().layers.forEach((layer) => {
        // if layer doesnt exist skip
        if(!data.layers[layer]) return;

        const filterExists = Filter()[layer];
        const Key = Filter()[layer].key;

        if (!content[layer]) {content[layer] = {};}

        // sample all features in layer
        for (i = 0; i < data.layers[layer].length; i++) 
        {
            const feature = data.layers[layer].feature(i);
            const value = feature.properties[Key];
            const geometry = feature.loadGeometry();

            // extract feature geometry to svg paths
            var featureContent = buildGeometry(geometry, getSvgOffset(tile), Filter()[layer] && Filter()[layer].geometrytype == 'shape');

            var svgFeatureContent = svgGroup(`tile${tile.x}_${tile.y} feature${feature.id}`, featureContent, '\t\t\t');

            // if features key value exists in filter push to category
            // else push to 'other'
            if (filterExists && Filter()[layer].values.indexOf(value) > -1) {
                if (!content[layer][value]) {content[layer][value] = '';}
                content[layer][value] += svgFeatureContent;
            }
            else {
                if (!content[layer]['other']) {content[layer]['other'] = '';}
                content[layer]['other'] += svgFeatureContent;
            }
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
    Filter().layers.forEach((layer) => {

        // if layer not sampled skip
        if (!content[layer]) return;

        var layer_content = '';
        if (Filter()[layer]) {
            Filter()[layer].values.forEach((value) => {
                if (content[layer][value]) layer_content += svgGroup(value, content[layer][value], '\t\t');
            });
        }

        if(content[layer]['other']) layer_content += svgGroup('other', content[layer]['other'], '\t\t');
        doc_content += svgGroup(layer, layer_content, '\t');
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