const VectorTile = require("@mapbox/vector-tile/lib/vectortile");
const { contentTracing } = require("electron");
const { readFileSync, writeFileSync } = require("fs");
const { resolve } = require("path");
const Pbf = require("pbf");
const { toPath } = require("svg-points");
const { gunzip } = require("zlib");
const { Config, Sample } = require("../util/service");
const { svgDoc, svgGroup, svgPath } = require("./writer");

module.exports = {
    neoSampleTile : neoSampleTile,
    sampleStack : sampleStack,
}


var schema = [
    "road"
]

var types = [
    "path", 
    "footway",
    "blabla"
]


function getSvgBounds () {
    var bounds = {
        x: (Sample().end.x - Sample().start.x + 1) * Config().tilescale * Config().scale,
        y: (Sample().end.y - Sample().start.y + 1) * Config().tilescale * Config().scale,
    }
    return bounds;
}


async function sampleStack (stack) {

    // get stack 
    // sample all tiles into Data[] object
    // pack data into svg Doc and save

    var content = {}
    var counter = 0;
    stack.forEach((tile) => {
        // console.log(i);
        neoSampleTile(tile, content).then((result) => {
            counter++;
            content = result;
            
            if (counter >= stack.length) {
                writeDoc(content);
            }

        });
    });
    console.log('--finished extract');
}

function writeDoc (content) {
    var doc_content = '';
    schema.forEach((layertype) => {
        var layer_content = '';
        types.forEach((type) => {
            if (content[layertype][type]) layer_content += svgGroup(type, content[layertype][type], '\t\t');
        });
        if(content[layertype]['other']) layer_content += svgGroup('other', content[layertype]['other'], '\t\t');
        doc_content += svgGroup(layertype, layer_content, '\t');
    });
    var svgBounds = getSvgBounds();
    writeFileSync(`src/data/output/feature.svg`, svgDoc('document', doc_content, svgBounds.x, svgBounds.y));
}

async function neoSampleTile (tile, content) 
{
    return new Promise ((resolve) => {
        var buffer = readFileSync(`src/data/buffer/${tile.x}_${tile.y}_${tile.z}.pbf`);
        parseTile(buffer).then((data) => {
            console.log('--starting extract');
            content = extract(data, tile, content);
            resolve(content);
        });
    });
}


function extract (data, tile, content) {
    
    var transform = {
        scale: Config().scale, // --! replace with config value
        offset: {
            x: (tile.x - Sample().start.x) * Config().tilescale * Config().scale,
            y: (tile.y - Sample().start.y) * Config().tilescale * Config().scale,
        }
    }
    
    schema.forEach((layertype) => {
        if (!content[layertype]) {content[layertype] = {};}
        if (!content[layertype]['other']) {content[layertype]['other'] = '';}

        // -- sample all features in layertype --
        for (i = 0; i < data.layers[layertype].length; i++) 
        {
            const feature = data.layers[layertype].feature(i);

            const Class = feature.properties.type;
            const Geometry = feature.loadGeometry();

            // extract feature geometry to svg paths
            var featureContent = buildGeometry(Geometry, transform);
            // create svg group of current feature with all its paths
            var svgFeatureContent = svgGroup(`tile${tile.x}_${tile.y} feature${feature.id}`, featureContent, '\t\t\t');

            // if features class exists in filter push to category
            // else push to 'other'
            if (types.indexOf(Class) > -1) {
                if (!content[layertype][Class]) {content[layertype][Class] = '';}
                content[layertype][Class] += svgFeatureContent;
            } 
            else {
                content[layertype]['other'] += svgFeatureContent;
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

function buildGeometry (geometry, transform) {
    var content = '';
    geometry.forEach((segment) => {
        segment.map((point) => {
            point.x = point.x * transform.scale + transform.offset.x;
            point.y = point.y * transform.scale + transform.offset.y;
        });
        var path = toPath(segment);
        content += svgPath(`path${geometry.indexOf(segment)}`, path, '\t\t\t\t', 0.5);
    });
    return content;
}