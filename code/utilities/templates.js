module.exports = {
    DefaultConfig : DefaultConfig,
    DefaultSample : DefaultSample,
    DefaultFilter : DefaultFilter,
}

function DefaultConfig () {
    return defaultconfig;
}
var defaultconfig = {
    TOKEN : "pk.eyJ1IjoiYW5kdW5pIiwiYSI6ImNraHRqbGk0dzJmNDUzOG14bW5zNnpmcGMifQ.NVFP12dNvup1JfVgFTyOqw",
    SERVER : "https://api.mapbox.com/v4/mapbox.mapbox-streets-v8",

    tilescale : 4096,
    scale : 0.01,

    DIRECTORY : {
        "BUFFER" : "buffer/",
        "OUTPUT" : "output/"
    }
}

function DefaultSample () {return defaultsample;}
var defaultsample = {
    start: {
        x: 34820,
        y: 22364
    },
    end: {
        x: 34824,
        y: 22367
    },
    zoom: 16,
    center: {
        x: 34818,
        y: 22363
    }
}

function DefaultFilter () {return defaultfilter;}
var defaultfilter = {
    layers: [
        "road",
        "building",
        "water"
    ],
    road: {
        key: "type",
        values: [
            "footway",
            "path",
            "1",
        ],
        geometrytype: "path"
    },
    building: {
        key: "type",
        values: [
            "industrial",
            "building"
        ],
        geometrytype: "shape"
    },
    water: {
        key: "type",
        values: [
            "1",
            "test"
        ],
        geometrytype: "shape"
    }
}
