module.exports = {
    svgDoc : svgDoc,
    svgGroup : svgGroup,
    svgPath : svgPath,
    svgShape : svgShape,
    toShape : toShape,
}

var nl = '\n';

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
    return group_content; 
}

function svgPath (id, content, indent, stroke=0.5) {
    return indent + `<path id="${id}" stroke="black" stroke-width="${stroke}" fill="none" d="${content}"/>` + nl;
}

function svgShape (id, content, indent, fill="#000") {
    return indent + `<polygon id="${id}" points="${content}" style="fill:${fill}; stroke:none"/>` + nl;
}

function toShape (geo) {
    shape = "";
    geo.forEach(point => {
        shape += point.x + ',' + point.y + ' ';
    });
    return shape;
}