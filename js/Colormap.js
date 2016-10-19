var Colormap = function() {
    this.mesh = null;
    this.min = 0;
    this.max = 1;
    this.type = 'solid';
    this.color = {
        solid: [133, 108, 99],
        continuous: [
            [0, [51, 45, 138]],
            [0.5, [57, 180, 167]],
            [1, [250, 250, 57]]
        ],
        discrete: [
            [244, 67, 54],
            [233, 30, 99],
            [156, 39, 176],
            [63, 81, 181],
            [33, 150, 243],
            [0, 188, 212],
            [0, 150, 136],
            [76, 175, 80],
            [205, 220, 57],
            [255, 235, 59],
            [255, 193, 7],
            [255, 152, 0]
        ]
    }
}


Colormap.prototype = {
    constructor: Colormap,
    lookupColor: function(value, isColormapCanvas) {
        switch (this.type) {
            case 'solid':
                return this.color.solid;
                break;
            case 'continuous':
                var start, end;
                var min = isColormapCanvas ? 0 : this.min;
                var max = isColormapCanvas ? 1 : this.max;
                var pos = (value - min) / (max - min);
                var map = this.color.continuous;
                for (var i = 0; i < map.length - 1; i++) {
                    if (pos >= map[i][0] && pos <= map[i + 1][0]) {
                        start = map[i][1];
                        end = map[i + 1][1];
                        break;
                    }
                }
                pos = (pos - map[i][0]) / (map[i + 1][0] - map[i][0]);
                return colorInterpolation(pos, start, end);
                break;
            case 'discrete':
                // return value %
                var len = this.color.discrete.length;
                if (isColormapCanvas) {
                    var pos = Math.floor(value * len);
                    if (pos >= len) pos = len - 1;
                    return this.color.discrete[pos];
                } else {
                    return this.color.discrete[Math.floor(value) % len];
                }
                break;
        }
    }
}

var assignColor = function(colors) {
    var mesh = meshContainer.children[0];
    var geometry = mesh.geometry;
    var minValue = Infinity;
    var maxValue = -Infinity;
    for (var i = 0; i < geometry.faces.length; i++) {
        var color = colors[i] == undefined ? minValue : colors[i];
        minValue = minValue > color ? color : minValue;
        maxValue = maxValue < color ? color : maxValue;
        geometry.faces[i].colorValue = color;
    }
    geometry.minValue = minValue;
    geometry.maxValue = maxValue;
    updateColor();
}

var colorInterpolation = function(position, startColorRGB, endColorRGB) {
    // returns an RGB value
    // RGB color format: [r, g, b]

    var lab1 = Color.rgb2lab(startColorRGB);
    var lab2 = Color.rgb2lab(endColorRGB);
    var dstlab = [0, 0, 0];
    for (var i = 0; i < 3; i++) {
        dstlab[i] = lab1[i] + position * (lab2[i] - lab1[i]);
    }
    var dst = Color.lab2rgb(dstlab);
    return dst;
}

var updateColor = function() {
    // 检查显示颜色的状态，然后根据colormap来更新模型颜色
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    var geometry = mesh.geometry;
    cm.mesh = mesh;
    cm.max = geometry.maxValue;
    cm.min = geometry.minValue;
    for (var i = 0; i < geometry.faces.length; i++) {
        var color = cm.lookupColor(geometry.faces[i].colorValue, false);
        geometry.faces[i].color.setRGB(color[0] / 255, color[1] / 255, color[2] / 255);
    }

    geometry.colorsNeedUpdate = true;
    animate();
}


var cm = new Colormap();
updateColormap(cm);
