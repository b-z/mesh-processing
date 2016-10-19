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
    mesh.scale.set(scale / r, scale / r, scale / r);
    mesh.position.set(-c.x * scale / r, -c.y * scale / r - 0.5 + (c.y - b1.y) * scale / r + 0.0001, -c.z * scale / r);
    spheres.scale.set(scale / r, scale / r, scale / r);
    spheres.position.set(-c.x * scale / r, -c.y * scale / r - 0.5 + (c.y - b1.y) * scale / r + 0.0001, -c.z * scale / r);
    triangles.scale.set(scale / r, scale / r, scale / r);
    triangles.position.set(-c.x * scale / r, -c.y * scale / r - 0.5 + (c.y - b1.y) * scale / r + 0.0001, -c.z * scale / r);
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
    return mesh;
}

var findVertexAdjcentVertex = function(vertexIdx) {
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    var g = mesh.geometry;
    var dstIdxs = g.vertices[vertexIdx].neighborsIdx;
    showVertexAdjcentVertex(vertexIdx, dstIdxs);
	console.log(dstIdxs);
    return dstIdxs;
}

var findVertexAdjcentFace = function(vertexIdx) {
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    var g = mesh.geometry;
    var dstIdxs = g.vertices[vertexIdx].facesIdx;
    showVertexAdjcentFace(vertexIdx, dstIdxs);
	console.log(dstIdxs);
    return dstIdxs;
}

var findFaceAdjcentFace = function(faceIdx) {
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    var g = mesh.geometry;
    var dstIdxs = g.faces[faceIdx].facesIdx;
    showFaceAdjcentFace(faceIdx, dstIdxs);
	console.log(dstIdxs);
    return dstIdxs;
}

var distance = function(p1, p2) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y) + (p1.z - p2.z) * (p1.z - p2.z));
}
