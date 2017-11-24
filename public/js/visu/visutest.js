const socket = io.connect();



var scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

var camera = new THREE.PerspectiveCamera(100, 500 / 500, 1, 1000);
camera.position.set(0, 0, 100);
camera.lookAt(new THREE.Vector3(-50, -50, 0));

container = document.getElementById('canvas');
document.body.appendChild(container);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(500, 500);
container.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.addEventListener('change', render);
controls.minDistance = 20;
controls.maxDistance = 500;
controls.enablePan = false;

var grid = new THREE.GridHelper(500, 50, 0x550000, 0xD0D0D0);
grid.position.y = 0;
grid.position.x = 0;
grid.position.z = 0;
grid.geometry.rotateX(Math.PI / 2);
scene.add(grid);









var defaultColor = new THREE.Color('black');
var material = new THREE.LineBasicMaterial({ color: defaultColor });



var motionColor = {
    'G0': new THREE.Color('skyblue'),
    'G1': new THREE.Color("rgb(255, 0, 127)"),
    'G2': new THREE.Color("rgb(255, 0, 255)"),
    'G3': new THREE.Color("rgb(255, 255, 0)")
};



var addLine = function addLine(modal, v1, v2) {
    var motion = modal.motion;

    var color = motionColor[motion] || defaultColor;
    var vertices = [new THREE.Vector3(v1.x, v1.y, v1.z), new THREE.Vector3(v2.x, v2.y, v2.z)];
    var colors = [color, color];

    return { vertices: vertices, colors: colors };
};

var addArcCurve = function addArcCurve(modal, v1, v2, v0) {
    var motion = modal.motion,
        plane = modal.plane;

    var isClockwise = motion === 'G2';
    var radius = Math.sqrt((v1.x - v0.x) * 2 + (v1.y - v0.y) * 2);
    var startAngle = Math.atan2(v1.y - v0.y, v1.x - v0.x);
    var endAngle = Math.atan2(v2.y - v0.y, v2.x - v0.x);

    // Draw full circle if startAngle and endAngle are both zero
    if (startAngle === endAngle) {
        endAngle += 2 * Math.PI;
    }

    var arcCurve = new THREE.ArcCurve(v0.x, // aX
        v0.y, // aY
        radius, // aRadius
        startAngle, // aStartAngle
        endAngle, // aEndAngle
        isClockwise // isClockwise
    );
    var divisions = 100;
    var points = arcCurve.getPoints(divisions);
    var color = motionColor[motion] || defaultColor;
    var vertices = [];
    var colors = [];

    for (var i = 0; i < points.length; ++i) {
        var point = points[i];
        var z = (v2.z - v1.z) / points.length * i + v1.z;

        if (plane === 'G17') {
            // XY-plane
            vertices.push(new THREE.Vector3(point.x, point.y, z));
        } else if (plane === 'G18') {
            // ZX-plane
            vertices.push(new THREE.Vector3(point.y, z, point.x));
        } else if (plane === 'G19') {
            // YZ-plane
            vertices.push(new THREE.Vector3(z, point.x, point.y));
        }
        colors.push(color);
    }

    return { vertices: vertices, colors: colors };
};

socket.on('toolpath', function(path) {

    var laser_path = new THREE.Geometry();


    //console.log(path[0].v1);

    //console.log(motionColor);


    //console.log(path);
    pathlenght = path.length;

    for (var i = 0; i < pathlenght; i++) {
        //console.log(path[i].motion);

        if (path[i].motion == 'G1' || 'G1') {

            var newLine = addLine(path[i].motion, path[i].v1, path[i].v2);
            //console.log(newLine.colors[1]);
            laser_path.vertices.push(newLine.vertices[0], newLine.vertices[1]);
            laser_path.colors.push(new THREE.Color('skyblue'));
        } else if (path[i].motion == 'G2' || 'G3') {
            var newCurve = addArcCurve(path[i].motion, path[i].v1, path[i].v2, path[i].v0);
            newCurve.vertices.forEach(vector => {
                laser_path.vertices.push(vector);
            });

        }

    }

    //laser_path.computeBoundingBox();
    //laser_path.center();
    var line = new THREE.Line(laser_path, material);
    //laser_path.verticesNeedUpdate = true;
    scene.add(line);
    line.position.set(-50, -50, 0);
    //console.log(line.laser_path);
});





var pointer = new THREE.SphereGeometry(1, 32, 32);
var s_material = new THREE.MeshBasicMaterial({ color: "red" });
var sphere = new THREE.Mesh(pointer, s_material);
sphere.position.set(-50, -50, 0);
scene.add(sphere);




socket.on("newCommand", function(_grbl_daten) {
    //console.log(_grbl_daten);

    try {
        var grbl_daten = JSON.parse(_grbl_daten);
        //console.log(grbl_daten);
    } catch (e) {
        //console.log(e);
    }

    if (grbl_daten !== undefined) {

        var mxpos = Math.round((grbl_daten.MPos.Y) * 100) / 100;
        var mypos = Math.round((grbl_daten.MPos.Y) * 100) / 100;

        var wxpos = Math.round((grbl_daten.MPos.X - grbl_daten.WCO.X) * 100) / 100
        var wypos = Math.round((grbl_daten.MPos.Y - grbl_daten.WCO.Y) * 100) / 100
        var wcox = Math.round((grbl_daten.WCO.X) * 100) / 100;
        var wcoy = Math.round((grbl_daten.WCO.Y) * 100) / 100;

        sphere.position.set(wxpos - 50, wypos - 50, 0);

    }
});

function render() {
    renderer.render(scene, camera);
}

setInterval(() => {
    render();
}, 0)