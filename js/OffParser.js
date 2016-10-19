/**
 * @author Zhou Bowei
 */

var OffParser = function() {

}

OffParser.prototype = {
    constructor: OffParser,
    parse: function(str) {
        // console.log(str);
        var lines = str.split('\n');
        var tmp = lines[1].split(' ');
        var vlen = parseInt(tmp[0]);
        var flen = parseInt(tmp[1]);
        var elen = parseInt(tmp[2]);

        var vs = [];
        var fs = [];
        // var faceTable = [];


        for (var i = 2; i < lines.length; i++) {
            var s = lines[i].split(' ');
            if (!s.length) {
                continue;
            }
            switch (s.length) {
                case 3:
                    vs.push(s);
                    break;
                case 4:
                    fs.push(s);
                    break;
                default:
                    console.log(lines[i]);
            }
        }

        var geometry = {
            vertices: [],
            normals: [],
            uvs: []
        };

        var vertices = [];
        // vs
        for (var i = 0; i < vs.length; i++) {
            vertices.push(
                parseFloat(vs[i][0]),
                parseFloat(vs[i][1]),
                parseFloat(vs[i][2])
            );
        }
        // fs
        for (var i = 0; i < fs.length; i++) {
            idx = [parseInt(fs[i][1]), parseInt(fs[i][2]), parseInt(fs[i][3])];
            for (var j = 0; j < 3; j++) {
                idx[j] *= 3;
            }
            // faceTable.push([idx[0] / 3, idx[1] / 3, idx[2] / 3]);
            geometry.vertices.push(
                vertices[idx[0]], vertices[idx[0] + 1], vertices[idx[0] + 2],
                vertices[idx[1]], vertices[idx[1] + 1], vertices[idx[1] + 2],
                vertices[idx[2]], vertices[idx[2] + 1], vertices[idx[2] + 2]
            );

        }

        var material = {
            name: ''
        };
        var object = {
            name: '',
            geometry: geometry,
            material: material
        };
        var buffergeometry = new THREE.BufferGeometry();
        console.log(geometry);
        buffergeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometry.vertices), 3));
        if (geometry.normals.length > 0) {
            buffergeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(geometry.normals), 3));
        }
        if (geometry.uvs.length > 0) {
            buffergeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometry.uvs), 2));
        }
        material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0x666666,
            // emissive: 0xff0000,
            shininess: 10,
            shading: THREE.SmoothShading,
            // opacity: 0.9,
            // transparent: true,
            vertexColors: THREE.FaceColors,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1,
            side: THREE.DoubleSide
        });
        material.name = object.material.name;
        var mesh = new THREE.Mesh(buffergeometry, material);
        mesh.name = object.name;
        // mesh.faceTable = faceTable;
        return mesh;
    }
}
