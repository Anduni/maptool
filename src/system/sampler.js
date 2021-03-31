const VectorTile = require("@mapbox/vector-tile/lib/vectortile");
const { readFileSync } = require("fs");
const { Config } = require("../util/service");
require('zlib');
require('pbf');
require('@mapbox/vector-tile');

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

const CENTER = {x: 0, y: 0};
const SCALE = Config().SCALE * Config().TILESCALE;



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


function parseTile (buffer) {
    return new Promise ((resolve) => {
        gunzip(buffer, (err, obuffer) => {
            pbuffer = new Pbf(obuffer);
            data = new VectorTile(pbuffer);

            console.log(data);
            resolve(data);
        })
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


module.exports = {
    SAMPLE : sample,
}