/**
 * @author Zhou Bowei
 */

var optimizeMesh = function(mesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.geometry = new THREE.Geometry().fromBufferGeometry(mesh.geometry);
    mesh.geometry.normalize();
    mesh.geometry.computeBoundingSphere();
    var s = mesh.geometry.boundingSphere;
    var c = s.center;
    var r = s.radius;

    mesh.geometry.computeBoundingBox();

    var b = mesh.geometry.boundingBox;
    var b1 = b.min;
    var b2 = b.max;
    var scale = 0.5;
    var u = [scale / r, scale / r, scale / r];
    var v = [-c.x * scale / r, -c.y * scale / r - 0.5 + (c.y - b1.y) * scale / r + 0.0001, -c.z * scale / r];
    mesh.scale.set(u[0], u[1], u[2]);
    mesh.position.set(v[0], v[1], v[2]);
    spheres.scale.set(u[0], u[1], u[2]);
    spheres.position.set(v[0], v[1], v[2]);
    triangles.scale.set(u[0], u[1], u[2]);
    triangles.position.set(v[0], v[1], v[2]);
    noiseMeshContainer.scale.set(u[0], u[1], u[2]);
    noiseMeshContainer.position.set(v[0], v[1], v[2]);
    mesh.geometry.mergeVertices();
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeFaceNormals();

    mesh = addDataStructure(mesh);
    return mesh;
}

var addDataStructure = function(mesh) {
    var ft = [];
    var g = mesh.geometry;

    for (var i = 0; i < g.vertices.length; i++) {
        g.vertices[i].index = i;
        g.vertices[i].facesIdx = [];
        g.vertices[i].neighborsIdx = [];
        g.vertices[i].edgesIdx = [];
    }

    for (var i = 0; i < g.faces.length; i++) {
        ft.push([g.faces[i].a, g.faces[i].b, g.faces[i].c]);
    }
    for (var i = 0; i < g.faces.length; i++) {
        g.faces[i].verticesIdx = ft[i];
        g.faces[i].edgesIdx = [];
        g.faces[i].facesIdx = [];
        g.faces[i].index = i;
        for (var j = 0; j < 3; j++) {
            var v = g.vertices[ft[i][j]];
            v.facesIdx.push(i);
            for (var k = 0; k < 3; k++) {
                if (j == k) {
                    continue;
                }
                if (v.neighborsIdx.indexOf(ft[i][k]) == -1) {
                    v.neighborsIdx.push(ft[i][k]);
                }
            }
        }
    }

    g.edges = [];
    // edges
    for (var i = 0; i < g.vertices.length; i++) {
        var v = g.vertices[i];
        for (var j = 0; j < v.neighborsIdx.length; j++) {
            var i_ = v.neighborsIdx[j];
            if (i < i_) {
                var facesIdx = [];
                for (k1 = 0; k1 < g.vertices[i].facesIdx.length; k1++) {
                    for (k2 = 0; k2 < g.vertices[i_].facesIdx.length; k2++) {
                        if (g.vertices[i].facesIdx[k1] == g.vertices[i_].facesIdx[k2]) {
                            facesIdx.push(g.vertices[i].facesIdx[k1]);
                        }
                    }
                }
                var e = new Edge([i, i_], facesIdx);
                e.index = g.edges.length;
                g.vertices[i].edgesIdx.push(e.index);
                g.vertices[i_].edgesIdx.push(e.index);
                for (var k = 0; k < facesIdx.length; k++) {
                    g.faces[facesIdx[k]].edgesIdx.push(e.index);
                }
                g.edges.push(e);
            }
        }
    }
    // face-face
    for (var i = 0; i < g.edges.length; i++) {
        var f0 = g.edges[i].facesIdx[0];
        var f1 = g.edges[i].facesIdx[1];
        if (f0 == undefined || f1 == undefined) {
            continue;
        }
        g.faces[f0].facesIdx.push(f1);
        g.faces[f1].facesIdx.push(f0);
    }

    // vertex normals
    g.computeVertexNormals();
    for (var i = 0; i < g.faces.length; i++) {
        for (var j = 0; j < 3; j++) {
            var vidx = g.faces[i]['abc' [j]];
            var vnormal = g.faces[i].vertexNormals[j];
            g.vertices[vidx].normal = vnormal;
        }
    }
    return mesh;
}

var findVertexAdjacentVertex = function(vertexIdx) {
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    var g = mesh.geometry;
    var dstIdxs = g.vertices[vertexIdx].neighborsIdx;
    showVertexAdjacentVertex(vertexIdx, dstIdxs);
    console.log(dstIdxs);
    return dstIdxs;
}

var findVertexAdjacentFace = function(vertexIdx) {
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    var g = mesh.geometry;
    var dstIdxs = g.vertices[vertexIdx].facesIdx;
    showVertexAdjacentFace(vertexIdx, dstIdxs);
    console.log(dstIdxs);
    return dstIdxs;
}

var findFaceAdjacentFace = function(faceIdx) {
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    var g = mesh.geometry;
    var dstIdxs = g.faces[faceIdx].facesIdx;
    showFaceAdjacentFace(faceIdx, dstIdxs);
    console.log(dstIdxs);
    return dstIdxs;
}

var findVerticesAdjacentFaces = function(verticesIdx, twoVmode) {
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    var g = mesh.geometry;
    var vdict = {};
    var fdict = {};
    for (var i = 0; i < verticesIdx.length; i++) {
        vdict['' + verticesIdx[i]] = true;
    }
    for (var i = 0; i < verticesIdx.length; i++) {
        var v = verticesIdx[i];
        var fs = g.vertices[v].facesIdx;
        for (var j = 0; j < fs.length; j++) {
            fdict['' + fs[j]] = true;
        }
    }
    var dstIdxs = [];
    var mode = twoVmode ? 2 : 3;
    for (var i = 0; i < g.faces.length; i++) {
        if (fdict['' + i]) {
            var sum = 0;
            for (var j = 0; j < 3; j++) {
                var v = g.faces[i]['abc' [j]];
                if (vdict[v]) {
                    sum++;
                }
            }
            if (sum >= mode) {
                dstIdxs.push(i);
            }
        }
    }
    console.log(vdict, fdict, dstIdxs);
    return dstIdxs;
}

var distance = function(p1, p2) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y) + (p1.z - p2.z) * (p1.z - p2.z));
}

function gaussianRandom(mean, stdev) {
    var y2;
    var use_last = false;
    return function() {
        var y1;
        if (use_last) {
            y1 = y2;
            use_last = false;
        } else {
            var x1, x2, w;
            do {
                x1 = 2.0 * Math.random() - 1.0;
                x2 = 2.0 * Math.random() - 1.0;
                w = x1 * x1 + x2 * x2;
            } while (w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w)) / w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
        }

        var retval = mean + stdev * y1;

        return retval;
    }
}

function randomSpherePoint() {
    var p = new THREE.Vector3();
    var x, y, z, r;
    do {
        x = 2.0 * Math.random() - 1.0;
        y = 2.0 * Math.random() - 1.0;
        z = 2.0 * Math.random() - 1.0;
        r = x * x + y * y + z * z;
    } while (r > 1 || r == 0);
    // console.log(x,y,z,r);
    r = Math.sqrt(r);
    x /= r;
    y /= r;
    z /= r;
    p.set(x, y, z);
    return p;
}

var generateNoise = function(vn, sigma) {
    // var n = randomSpherePoint();
    // var n = v.normal;
    var r = gaussianRandom(0, sigma)();
    vn.multiplyScalar(r);
    return vn;
}

var generateModelNoise = function(mesh, sigma) {
    var g = mesh.geometry.clone();
    // console.log(g);
    for (var i = 0; i < g.vertices.length; i++) {
        var vn = mesh.geometry.vertices[i].normal.clone();
        var v = g.vertices[i];
        var n = generateNoise(vn, sigma);
        v.add(n);
    }
    g.verticesNeedUpdate = true;
    var c = cm.color.solid;
    var material = new THREE.MeshPhongMaterial({
        color: 0x0000ff,
        specular: 0x666666,
        shininess: 10,
        shading: THREE.FlatShading,
        // vertexColors: THREE.FaceColors,
        side: THREE.DoubleSide
    });
    var noiseMesh = new THREE.Mesh(g, material);
    return noiseMesh;
}

var generateBins = function(mesh, n) {
    // bins number---n*n*n
    var g = mesh.geometry;
    g.computeBoundingBox();

    var b = mesh.geometry.boundingBox;
    var b1 = b.min;
    var b2 = b.max;
    // console.log(b1);
    var len = b2.clone();
    len.sub(b1);
    var size = len.clone();
    size.divideScalar(n);

    var bins = [];
    for (var i = 0; i < n; i++) {
        var tmp1 = [];
        for (var j = 0; j < n; j++) {
            var tmp2 = [];
            for (var k = 0; k < n; k++) {
                var min = b1.clone();
                var tmp = size.clone();
                tmp.multiply(new THREE.Vector3(i, j, k));
                min.add(tmp);
                var max = min.clone();
                max.add(size);
                tmp2.push({
                    points: [],
                    min: min,
                    max: max
                });
            }
            tmp1.push(tmp2);
        }
        bins.push(tmp1);
    }
    for (var i = 0; i < g.vertices.length; i++) {
        var v = g.vertices[i].clone();
        v.sub(b1);
        v.divide(size);
        idx = [Math.floor(v.x), Math.floor(v.y), Math.floor(v.z)];
        for (j = 0; j < 3; j++) {
            if (idx[j] >= n) {
                idx[j] = n - 1;
            }
        }
        bins[idx[0]][idx[1]][idx[2]].points.push(i);
    }
    Bins = {
        bins: bins,
        n: n,
        b1: b1,
        b2: b2,
        size: size,
        len: len
    }
    console.log(Bins);
    return Bins;
}

var neighborhood = function(mesh, Bins, point, radius) {
    // point : Vector3
    var bins = Bins.bins;
    var n = Bins.n;
    var r = new THREE.Vector3(radius, radius, radius);
    var min = point.clone().sub(r).sub(Bins.b1).divide(Bins.size);
    var max = point.clone().add(r).sub(Bins.b1).divide(Bins.size);
    var p = [Math.floor(min.x), Math.floor(min.y), Math.floor(min.z)];
    var q = [Math.ceil(max.x), Math.ceil(max.y), Math.ceil(max.z)];
    for (var i = 0; i < 3; i++) {
        if (p[i] >= n) p[i] = n - 1;
        if (q[i] > n) q[i] = n;
        if (p[i] < 0) p[i] = 0;
        if (q[i] < 0) q[i] = 0;
    }

    var vids = [];
    var r2 = radius * radius;

    for (var i = p[0]; i < q[0]; i++) {
        for (var j = p[1]; j < q[1]; j++) {
            for (var k = p[2]; k < q[2]; k++) {
                var bin = bins[i][j][k];
                for (var l = 0; l < bin.points.length; l++) {
                    if (point.distanceToSquared(mesh.geometry.vertices[bin.points[l]]) < r2) {
                        vids.push(bin.points[l]);
                    }
                }
            }
        }
    }

    return vids;
}

var vertexTangentPlane = function(v, vnormal) {
    var vp = new THREE.Plane();
    vp.setFromNormalAndCoplanarPoint(vnormal, v);
    return vp;
}

var gaussian = function(x, mu, sigma) {
    return Math.exp(-(x - mu) * (x - mu) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));
}

var gaussianBlur = function(mesh, sigma) {
    var radius = 3 * sigma;

    var g = mesh.geometry;
    g.computeVertexNormals();
    for (var i = 0; i < g.faces.length; i++) {
        for (var j = 0; j < 3; j++) {
            var vidx = g.faces[i]['abc' [j]];
            var vnormal = g.faces[i].vertexNormals[j];
            g.vertices[vidx].normal = vnormal;
        }
    }
    var vlen = g.vertices.length;
    var blen = Math.floor(Math.pow(vlen, 1 / 3));
    blen = Math.max(4, Math.min(blen, 20));
    var Bins = generateBins(mesh, blen);
    for (var i = 0; i < vlen; i++) {
        var v = g.vertices[i];
        var nbh = neighborhood(mesh, Bins, v, radius);

        var vn = v.normal;
        var vp = vertexTangentPlane(v, vn);
        v.gaussianAdd = 0;
        var sum_gau = 0;
        for (var j = 0; j < nbh.length; j++) {
            var p = g.vertices[nbh[j]];
            var h = vp.distanceToPoint(p); // 正负
            var gau = gaussian(h, 0, sigma);
            sum_gau += gau;
            v.gaussianAdd += h * gau;
        }
        v.gaussianAdd /= sum_gau;
    }

    // generate new mesh
    var g_ = g.clone();
    for (var i = 0; i < vlen; i++) {
        var v = g.vertices[i];
        var v_ = g_.vertices[i];
        var vn = v.normal.clone();
        v_.add(vn.multiplyScalar(v.gaussianAdd));
    }

    var material = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        specular: 0x666666,
        shininess: 10,
        shading: THREE.FlatShading,
        // vertexColors: THREE.FaceColors,
        side: THREE.DoubleSide
    });
    var filtered = new THREE.Mesh(g_, material);

    return filtered;
}

var compareMesh = function(mesh1, mesh2) {
    // mesh1: basic
    var g1 = mesh1.geometry;
    var g2 = mesh2.geometry;
    var g = mesh1.geometry.clone();
    var maxd = 0;

    for (var i = 0; i < g1.faces.length; i++) {
        for (var j = 0; j < 3; j++) {
            var vidx = g1.faces[i]['abc' [j]];
            var vnormal = g1.faces[i].vertexNormals[j];
            g1.vertices[vidx].normal = vnormal;
        }
    }
    for (var i = 0; i < g.vertices.length; i++) {
        // var d = g1.vertices[i].distanceTo(g2.vertices[i]);
        var vp = vertexTangentPlane(g1.vertices[i], g1.vertices[i].normal);
        var d = vp.distanceToPoint(g2.vertices[i]);
        g.vertices[i].d = d;
        if (Math.abs(d) > maxd) {
            maxd = Math.abs(d);
        }
    }
    if (!maxd) {
        maxd = 0.000001;
    }
    var cm_ = new Colormap();
    cm_.type = 'continuous';
    // cm_.color.continuous = [
    //     [0, [0, 0, 128]],
    //     [0.2, [0, 0, 255]],
    //     [0.45, [50, 255, 255]],
    //     [0.5, [128, 255, 128]],
    //     [0.55, [255, 255, 50]],
    //     [0.8, [255, 0, 0]],
    //     [1, [128, 0, 0]]
    // ];
    cm_.color.continuous = [
        [0, [0, 0, 128]],
        [0.15, [0, 0, 255]],
        [0.382, [50, 255, 255]],
        [0.5, [128, 255, 128]],
        [0.618, [255, 255, 50]],
        [0.85, [255, 0, 0]],
        [1, [128, 0, 0]]
    ];
    updateColormap(cm_, $('#colormap2'));
    cm_.min = -maxd;
    cm_.max = maxd;
    for (var i = 0; i < g.faces.length; i++) {
        var f = g.faces[i];
        f.vertexColors = [];
        for (var j = 0; j < 3; j++) {
            var idx = f['abc' [j]];
            var d = g.vertices[idx].d;
            d = Math.pow(Math.abs(d / maxd), 1 / 2) * maxd * (d > 0 ? 1 : -1);
            var color = new THREE.Color();
            var c = cm_.lookupColor(d);
            // console.log(cm_.min,cm_.max,d,c);
            color.setRGB(c[0] / 255, c[1] / 255, c[2] / 255);
            f.vertexColors.push(color);
        }
    }
    var material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        // specular: 0x666666,
        // shininess: 0,
        shading: THREE.SmoothShading,
        vertexColors: THREE.VertexColors,
        side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(g, material);
    return mesh;
}

var mse = function(mesh1, mesh2) {
    var g1 = mesh1.geometry;
    var g2 = mesh2.geometry;
    var vlen = g1.vertices.length;
    if (vlen != g2.vertices.length) {
        return "Error: vertices numbers are not equal!";
    }
    var sum = 0;
    for (var i = 0; i < vlen; i++) {
        sum += g1.vertices[i].distanceToSquared(g2.vertices[i]);
    }
    // console.log(sum);
    sum /= vlen;
    return sum;
}
