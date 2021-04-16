const VectorTile = require("@mapbox/vector-tile/lib/vectortile");
const { readFileSync, writeFileSync } = require("fs");
const Pbf = require("pbf");
const { toPath } = require("svg-points");
const { gunzip } = require("zlib");
const { Config } = require("../util/service");
const { svgDoc, svgGroup, svgPath } = require("./writer");


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
        extract(data, tile);
    });
}


var schema = [
    "road"
]

var types = [
    "path",
    "footway",
    "blabla"
]

function extract (data, id) {

    const OFFSET = {
        x: SCALE * (id.x - CENTER.x), 
        y: SCALE * (id.y - CENTER.y)
    };

    const transform = {
        scale: 0.01, // --! replace with config value
        offset: { 
            x: 0,
            y: 0
        } // --! replace with dynamic value
    }

    var content = '';
    
    schema.forEach((layertype) => {
        var layer_content = '';

        var Data = {};
        Data['other'] = ''; // init 'other' to be fallback category

        // -- sample all features in layertype --
        for (i = 0; i < data.layers[layertype].length; i++) 
        {
            const feature = data.layers[layertype].feature(i);

            const Class = feature.properties.type;
            const Geometry = feature.loadGeometry();

            // extract feature geometry to svg paths
            var featureContent = buildGeometry(Geometry, transform);
            // create svg group of current feature with all its paths
            var svgFeatureContent = svgGroup(`feature${feature.id}`, featureContent, '\t\t\t');

            // if features class exists in filter push to category
            // else push to 'other'
            if (types.indexOf(Class) > -1) {
                if (!Data[Class]) {Data[Class] = '';}
                Data[Class] += svgFeatureContent;
            } 
            else {
                Data['other'] += svgFeatureContent;
            }
        }
        
        // -- add all categories to their own group --
        types.forEach((type) => {
            if (Data[type]) layer_content += svgGroup(type, Data[type], '\t\t');
        });

        // visual guide
        layer_content += `<!--break--> \n`;

        // -- add all uncategorized features to group 'other' --
        layer_content += svgGroup('other', Data['other'], '\t\t');

        // -- add layer content to layergroup --
        content += svgGroup(layertype, layer_content, '\t');
    });

    writeFileSync(`src/data/output/feature.svg`, svgDoc('document', content, 4096, 4096));
    console.log('--finished extract');
}


function buildGeometry (geometry, transform) {
    var content = '';
    geometry.forEach((segment) => {

        segment.map((point) => {
            point.x = point.x;
            point.y = point.y;
        });

        var path = toPath(segment);
        content += svgPath(`path${geometry.indexOf(segment)}`, path, '\t\t\t\t');
    });

    return content;
}