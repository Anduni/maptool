const VectorTile = require("@mapbox/vector-tile/lib/vectortile");
const { BrowserWindow } = require("electron");
const { json } = require("express");
const { readFileSync, writeFileSync } = require("fs");
const Pbf = require("pbf");
const { toPath } = require("svg-points");
const { gunzip } = require("zlib");
const { Config } = require("../util/service");


module.exports = {
    neoSampleTile : neoSampleTile
}

const CENTER = {x: 0, y: 0};
const SCALE = Config().SCALE * Config().TILESCALE;

var geometry = {
    // major_rail : [],
    // minor_rail : [],

    // motorway : [],

    // primary : [],
    // secondary : [],
    // tertiary : [],
    // street : [],
    // bike : [],

    // additional : [],

    // buildings : [],
    // water : [],

    // bridge : [],
    // contour : [],
};

function sampleTile (id, data) {
    
    const OFFSET = {
        x: SCALE * (id.x - CENTER.x), 
        y: SCALE * (id.y - CENTER.y)
    };

    return new Promise ((resolve) => {

        console.log(data);

        if (data.layers.road) {
            _layer = data.layers.road;

            for(i = 0; i < _layer.length; i++) {
                let _feature = _layer.feature(i);
                let _class = _feature.properties.class;
                let _geo = _feature.loadGeometry();


                _geo.map((_segment) => {
                    _segment.map((_point) => {
                        _point.x = _point.x * Config().SCALE + OFFSET.x;
                        _point.y = _point.y * Config().SCALE + OFFSET.y;
                    });
                });
                
                // if (['major_rail', 'minor_rail', 'primary', 'secondary', 'tertiary', 'street', 'motorway'].indexOf(_class) > -1) {
                //     geometry[_class].push(_geo);
                // }


                if(!geometry[_class]) {
                    console.log('class doesnt exist yet');
                    
                    var key = toString(_class.val);
                    console.log(key);


                    geometry[key] = [];

                    console.log(geometry);
                }

                geometry[_class].push(_geo);

                

                // geometry.forEach(_geoClass => {
                //     if(toString(_class) == toString(_geoClass)) {
                //         geometry[_class].push(_geo);
                //     }
                //     else {
                //         geometry[_class] = [];
                //         geometry[_class].push(_geo);
                //     }
                // })

                
                
                
                // (_class) < 0) {
                //     geometry[_class] = {};
                // }  

                // geometry[_class].push(_geo);

            }
        } 

        // console.log(geometry);
        resolve();
    });

}

function sample (id, zoom, path) {
    zoom = 17;
    id = {x: 69642, y: 44731};

    var buffer = readFileSync(`${path}/${id.x}_${id.y}_${zoom}.pbf`);
    // var buffer = readFileSync(`${path}/${69642}_${44731}_${17}.pbf`);
    // ParseVectile(buffer);

    parseTile(buffer).then((val) => {
        sampleTile(id, val).then(() => {
            console.log(geometry)
        });
    });
}

function parseTile (buffer) {
    return new Promise ((resolve) => {
        gunzip(buffer, (err, obuffer) => {
            pbuffer = new Pbf(obuffer);
            data = new VectorTile(pbuffer);

            // console.log(data);
            resolve(data);
        })
    });
}

function neoSampleTile (tile) 
{
    var buffer = readFileSync(`src/data/buffer/${tile.x}_${tile.y}_${tile.z}.pbf`);
    parseTile(buffer).then((data) => {
        //writeFileSync(`src/data/output/${tile.x}_${tile.y}_${tile.z}.json`, JSON.stringify(data, null, 2));
    
        /*
        Structure:
        - for each layer create group in document
        - for each feature in layer create group in layer group in document
        - for each segment and point create path in document
        */

        console.log('--starting extract');
        extract(data);
    });
}

var schema = [
    "road",
    "building"
]

var schema_full = {
    layer : {
        feature : "test"
    }
}


function extract (tiledata) {
    var content = '';
    
    schema.forEach((layertype) => {
        // content[layertype] = {};

        var layer_content = '';
        for (i=0; i<tiledata.layers[layertype].length; i++) {

            // content[layertype][`feature ${i}`] = tiledata.layers[layertype].feature(i).properties.type;

            var feature_geometry = tiledata.layers[layertype].feature(i).loadGeometry();
            
            var feature_content = '';
            
            feature_geometry.forEach((segment) => {
                var path = toPath(segment);
                feature_content += svgPath(`${layertype} feature ${i} {path id}`, path);
            });

            layer_content += svgGroup(`feature ${i}`, feature_content, '\t \t');
            
            // var geo = tiledata.layers[layertype][i].feature(0).loadGeometry();
            // var svg_element = genereateElement(geo);
            
            // content[layertype][`feature ${i}`] = feature_content;
        }

        content += svgGroup(layertype, layer_content, '\t');
    });

    // writeFileSync(`src/data/output/content.json`, JSON.stringify(content, null, 2));
    writeFileSync(`src/data/output/feature.svg`, svgDoc('document', content, 4096, 4096));

    console.log('--finished extract');
}


var nl = '\n';
// var tab = '\t';


// var svg;
// var group;

function svgDoc (id, content, width, height) { 
    var svg_content = '';
    svg_content += `<svg id='${id}' width='${width}' height='${height}'>` + nl;
    svg_content += content;
    svg_content += `</svg>`
    return svg_content; 
}

function svgGroup (id, content, indent) {
    var group_content = '';
    group_content += indent + `<g id='${id}'>` + nl;
    group_content += content;
    group_content += indent + `</g>` + nl;
    return group_content ; 
}

function svgPath (id, content, stroke=1) { 
    return '\t \t \t' + '<path id="' + id + '"' + ' stroke="black" stroke-width="' + stroke + '" fill="none"' + ' d="' + content + '" />' + nl;
}

function toShape (geo) {

}
