/**
 * @author Zhou Bowei
 */

var init = function() {
    container = document.createElement('div');
    $('#viewer').append(container);
    camera = new THREE.PerspectiveCamera(35, 1, 1, 15);
    camera.position.set(4.2426 * Math.cos(Math.PI * 0.4), 0.15, 4.2426 * Math.sin(Math.PI * 0.4));
    cameraTarget = new THREE.Vector3(0, 0, 0);
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x72645b, 2, 15);

    // renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize($('#viewer').width(), $('#viewer').width());
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.renderReverseSided = false;
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
    // Ground
    var planeGeometry = new THREE.PlaneBufferGeometry(100, 100);
    var planeMaterial = new THREE.MeshPhongMaterial({
        color: 0xbbbbbb,
        specular: 0x101010
    });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    scene.add(plane);
    plane.receiveShadow = true;
    var helper = new THREE.GridHelper(100, 0.4);
    helper.position.y = -0.4999;
    helper.material.opacity = 0.9;
    helper.material.transparent = true;
    scene.add(helper);

    scene.add(new THREE.HemisphereLight(0x443333, 0x111122));
    addShadowedLight(1, 1, 1, 0xffffff, 1);
    addShadowedLight(0.5, 1, -1, 0xffcc88, 0.8);
    // addSpotLight(1, 1, 1, 0xffffff, 1.5);

    // control
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // add this only if there is no animation loop (requestAnimationFrame)
    controls.enableDamping = true;
    controls.dampingFactor = 1;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.2;
    controls.minDistance = 1.5;
    controls.maxDistance = 7;
    controls.maxPolarAngle = Math.PI * 0.5;
    //axis
    var axis = new THREE.AxisHelper();
    axis.scale.set(0.3, 0.3, 0.3);
    axis.position.set(0, 0.5, 0);
    scene.add(axis);

    meshContainer = new THREE.Object3D();
    scene.add(meshContainer);

    spheres = new THREE.Object3D();
    scene.add(spheres);

    triangles = new THREE.Object3D();
    scene.add(triangles);
}

function addSpotLight(x, y, z, color, intensity) {
    var light = new THREE.SpotLight(color, intensity);
    light.position.set(x, y, z);
    light.castShadow = true;
    light.shadowCameraNear = 200;
    light.shadowCameraFar = camera.far;
    light.shadowCameraFov = 70;
    light.shadowBias = -0.000222;
    light.shadowDarkness = 0.25;
    light.shadowMapWidth = 1024;
    light.shadowMapHeight = 1024;
    scene.add(light);
}

function addShadowedLight(x, y, z, color, intensity) {
    var directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    scene.add(directionalLight);
    directionalLight.castShadow = true;
    var d = 1;
    directionalLight.shadowCameraLeft = -d;
    directionalLight.shadowCameraRight = d;
    directionalLight.shadowCameraTop = d;
    directionalLight.shadowCameraBottom = -d;
    directionalLight.shadowCameraNear = 1;
    directionalLight.shadowCameraFar = 4;
    directionalLight.shadowMapWidth = 1024;
    directionalLight.shadowMapHeight = 1024;
    // directionalLight.shadowBias = -0.005;
    directionalLight.shadowDarkness = 0.35;
}

function onWindowResize() {
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    renderer.setSize($('#viewer').width(), $('#viewer').width());
}

function animate() {
    // requestAnimationFrame(animate);
    controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
}

var showMesh = function(mesh) {
    meshContainer.children = [];
    meshContainer.add(mesh);
    spheres.children = [];
    triangles.children = [];
    var wire = new THREE.EdgesHelper(mesh, 0xffffff); // or THREE.WireframeHelper
    wire.material.linewidth = 1;
    wire.castShadow = true;
    wire.receiveShadow = true;
    meshContainer.add(wire);

    updateInfo(mesh);
    if ($('#form_flat')[0].checked) {
        showFlatMesh();
    } else {
        showSmoothMesh();
    }
    if (mesh.geometry.faces.length < 200) {
        showFlatMesh();
    }

    if ($('#form_wireframe')[0].checked) {
        showWireframe();
    } else {
        hideWireframe();
    }

    if ($('#form_mesh')[0].checked) {
        showModelMesh();
    } else {
        hideModelMesh();
    }

    var colors = [];
    for (var i = 0; i < mesh.geometry.faces.length; i++) {
        colors.push(i);
    }
    assignColor(colors);

    animate();
}

var updateColormap = function(cm) {
    var $canv = $('#colormap');
    var len = $canv.height();
    var ctx = $canv[0].getContext('2d');
    for (i = 0; i < len; i++) {
        var color = cm.lookupColor(1 - i / len, true); //colorInterpolation(1 - i / len, [51, 45, 138], [250, 250, 57]);
        ctx.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
        ctx.fillRect(0, i, 1, 1)
    }
}

var updateInfo = function(mesh) {
    var txt = ''; //'<h5>INFO</h5>';
    txt += '<p>There are total <b><green>' + mesh.geometry.vertices.length + '</green></b> vertices and <b><green>';
    txt += mesh.geometry.edges.length + '</green></b> edges and <b><green>';
    txt += mesh.geometry.faces.length + '</green></b> faces.</p>';
    // txt += '<div class="divider"></div>';

    $('#mesh_info').html(txt);
}

var showFlatMesh = function() {
    var m = meshContainer.children[0].material;
    m.shading = THREE.FlatShading;
    m.needsUpdate = true;
    $('#form_flat')[0].checked = true;
    animate();
}

var showSmoothMesh = function() {
    var m = meshContainer.children[0].material;
    m.shading = THREE.SmoothShading;
    m.needsUpdate = true;
    $('#form_smooth')[0].checked = true;
    animate();
}

var hideWireframe = function() {
    // var m = meshContainer.children[0].material;
    // m.wireframe = false;
    // m.needsUpdate = true;
    $('#form_wireframe')[0].checked = false;
    var wire = meshContainer.children[1];
    if (wire == undefined) {
        return;
    }
    wire.visible = false;
    animate();
}

var showWireframe = function() {
    // var m = meshContainer.children[0].material;
    // m.wireframe = true;
    // m.needsUpdate = true;
    $('#form_wireframe')[0].checked = true;
    var wire = meshContainer.children[1];
    if (wire == undefined) {
        return;
    }
    wire.visible = true;
    animate();
}

var hideModelMesh = function() {
    $('#form_mesh')[0].checked = false;
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    mesh.visible = false;
    animate();
}

var showModelMesh = function() {
    $('#form_mesh')[0].checked = true;
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    mesh.visible = true;
    animate();
}

var showSolidColor = function() {
    $('#form_default')[0].checked = true;
    cm.type = 'solid';
    updateColormap(cm);
    updateColor();
}

var showContinuousColor = function() {
    $('#form_continuous')[0].checked = true;
    cm.type = 'continuous';
    updateColormap(cm);
    updateColor();
}

var showDiscreteColor = function() {
    $('#form_discrete')[0].checked = true;
    cm.type = 'discrete';
    updateColormap(cm);
    updateColor();
}

var generateSphere = function(x, y, z, radius, colorHex) {
    var sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
    var sphereMaterial = new THREE.MeshBasicMaterial({
        color: colorHex,
        shading: THREE.FlatShading
    });
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    sphere.position.set(x, y, z);
    return sphere;
}

var generateTriangle = function(a, b, c, colorHex) {
    var triangleGeometry = new THREE.Geometry();
    triangleGeometry.vertices.push(a, b, c);
    triangleGeometry.faces.push(new THREE.Face3(0, 1, 2));
    var triangleMaterial = new THREE.MeshPhongMaterial({
        color: colorHex,
        specular: 0x666666,
        shininess: 10,
        shading: THREE.FlatShading,
        side: THREE.DoubleSide
    });
    var triangle = new THREE.Mesh(triangleGeometry, triangleMaterial);
    triangle.castShadow = true;
    triangle.receiveShadow = true;
    // triangle.position.set(x, y, z);
    return triangle;
}

var showVertexAdjcentVertex = function(vertexIdx, dstIdxs) {
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    showWireframe();
    showSolidColor();
    spheres.children = [];
    triangles.children = [];
    var g = mesh.geometry;
    var v = g.vertices[vertexIdx];
    var r = 0;
    for (var i = 0; i < dstIdxs.length; i++) {
        var v_ = g.vertices[dstIdxs[i]];
        r += distance(v, v_) / dstIdxs.length / 3;
    }
    if (!r) {
        r = 0.03;
    }
    spheres.add(generateSphere(v.x, v.y, v.z, r, 0xff0000));
    for (var i = 0; i < dstIdxs.length; i++) {
        var v_ = g.vertices[dstIdxs[i]];
        spheres.add(generateSphere(v_.x, v_.y, v_.z, r / 2, 0xffff00));
    }
    Materialize.toast(dstIdxs.length+' vertices found(´Д｀；)',3000);

    animate();
}

var showVertexAdjcentFace = function(vertexIdx, dstIdxs) {
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    showWireframe();
    showSolidColor();

    spheres.children = [];
    triangles.children = [];

    var g = mesh.geometry;
    var v = g.vertices[vertexIdx];
    var r = 0;
    var neighborsIdx = g.vertices[vertexIdx].neighborsIdx;
    for (var i = 0; i < neighborsIdx.length; i++) {
        var v_ = g.vertices[neighborsIdx[i]];
        r += distance(v, v_) / neighborsIdx.length / 3;
    }
    if (!r) {
        r = 0.03;
    }
    spheres.add(generateSphere(v.x, v.y, v.z, r, 0xff0000));
    for (var i = 0; i < dstIdxs.length; i++) {
        var f = g.faces[dstIdxs[i]];
        var triangle = generateTriangle(g.vertices[f.a], g.vertices[f.b], g.vertices[f.c], 0xffff00);
        triangles.add(triangle);
    }
    Materialize.toast(dstIdxs.length+' faces found(´Д｀；)',3000);

    animate();
}

var showFaceAdjcentFace = function(faceIdx, dstIdxs) {
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    showWireframe();
    showSolidColor();

    spheres.children = [];
    triangles.children = [];

    var g = mesh.geometry;
    var f0 = g.faces[faceIdx];
    triangles.add(generateTriangle(g.vertices[f0.a], g.vertices[f0.b], g.vertices[f0.c], 0xffff00));
    for (var i = 0; i < dstIdxs.length; i++) {
        var f = g.faces[dstIdxs[i]];
        var triangle = generateTriangle(g.vertices[f.a], g.vertices[f.b], g.vertices[f.c], 0x3fb79d);
        triangles.add(triangle);
    }
    Materialize.toast(dstIdxs.length+' faces found(´Д｀；)',3000);

    animate();
}

var clearMarks = function() {
    spheres.children = [];
    triangles.children = [];
    animate();
}

var uploadFile = function(e, type) {
    var file = e.target.files[0];
    if (file == undefined) {
        return;
    }
    var filename = file.name;
    var tmp = filename.split('.');
    file_type = tmp[tmp.length - 1];
    var reader = new FileReader();

    reader.onload = function(e) {
        onReaderLoaded(e, type);
    }
    reader.readAsText(file);
}
var onReaderLoaded = function(e, type) {
    var data = e.target.result;
    if (type == 'model') {
        switch (file_type) {
            case 'obj':
                var objp = new ObjParser();
                var mesh = optimizeMesh(objp.parse(data));
                break;
            case 'off':
                var offp = new OffParser();
                var mesh = optimizeMesh(offp.parse(data));
                break;
            default:
                Materialize.toast('Unknown file type!', 3000);
        }

        showMesh(mesh);
        Materialize.toast('Load Finish(。´_｀)ノ', 2000);
    } else if (type == 'color') {
        var colorp = new ColorParser();
        colors = colorp.parse(data);
        assignColor(colors);
        Materialize.toast('Color File Load Finish(。´_｀)ノ', 2000);
    }
}

var onColorEditClick = function() {
    $('#edit_solid').val(JSON.stringify(cm.color.solid));
    var text = JSON.stringify(cm.color.continuous);
    text = text.split('],').join('],\n\t');
    text = text.split('[[').join('[\n\t[');
    text = text.split(']]]').join(']]\n]');
    text = text.split(',').join(', ');
    $('#edit_continuous').val(text);
    $('#edit_continuous').trigger('autoresize');
    var text = JSON.stringify(cm.color.discrete);
    text = text.split('],').join('],\n\t');
    text = text.split('[[').join('[\n\t[');
    text = text.split(']]').join(']\n]');
    text = text.split(',').join(', ');
    $('#edit_discrete').val(text);
    $('#edit_discrete').trigger('autoresize');
}

var confirmColorEdit = function() {
    var text1 = $('#edit_solid').val();
    var text2 = $('#edit_continuous').val();
    var text3 = $('#edit_discrete').val();
    cm.color.solid = JSON.parse(text1);
    cm.color.continuous = JSON.parse(text2);
    cm.color.discrete = JSON.parse(text3);
    updateColormap(cm);
    updateColor();
}

var findVV = function() {
    var id = parseInt($('#find_vv').val());
    findVertexAdjcentVertex(id);
}

var findVF = function() {
    var id = parseInt($('#find_vf').val());
    findVertexAdjcentFace(id);
}

var findFF = function() {
    var id = parseInt($('#find_ff').val());
    findFaceAdjcentFace(id);
}

var drawFaces = function() {
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    var twoVmode = $('#form_two_vertices')[0].checked;
    showWireframe();
    showSolidColor();

    spheres.children = [];
    triangles.children = [];

    var g = mesh.geometry;
    var str = $('#form_draw_faces').val();
    var tmp = str.split(/[ /;,]+/);
    var vids = [];
    for (var i = 0; i < vids.length; i++) {
        if (tmp[i] != '') {
            vids.push(parseInt(tmp[i]));
        }
    }
    var fids = findVerticesAdjcentFaces(vids, twoVmode);

    for (var i = 0; i < fids.length; i++) {
        var f = g.faces[fids[i]];
        // console.log(f);
        var triangle = generateTriangle(g.vertices[f.a], g.vertices[f.b], g.vertices[f.c], 0xffff00);
        triangles.add(triangle);
    }
    Materialize.toast(fids.length+' faces found(´Д｀；)',3000);
    animate();
}

var drawNormals = function() {
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    var g = mesh.geometry;

    var str = $('#form_draw_normals').val();
    var fids = [];
    if (str == '') {
        for (var i = 0; i < g.faces.length; i++) {
            fids.push(i);
        }
    } else {
        tmp = str.split(/[ /;,]+/);
        for (var i = 0; i < fids.length; i++) {
            if (tmp[i] != '') {
                fids.push(parseInt(tmp[i]));
            }
        }
    }
    spheres.children = [];
    triangles.children = [];

    for (var i = 0; i < fids.length; i++) {
        var f = g.faces[fids[i]];
        var triangle = generateTriangle(g.vertices[f.a], g.vertices[f.b], g.vertices[f.c], 0xffff00);
        // triangles.add(triangle);
        triangle.geometry.computeFaceNormals();
        var normal = new THREE.FaceNormalsHelper(triangle, 0.5, 0x00ff00, 1);
        triangles.add(normal);
    }

    animate();
}

var generateNoiseUser = function() {
    var mesh = meshContainer.children[0];
    if (mesh == undefined) {
        return;
    }
    var sigma = $('#form_noise_sigma').val();
    if (sigma==''){
        sigma = 1;
    } else {
        sigma = parseFloat(sigma);
    }
    generateModelNoise(mesh, sigma);
}
