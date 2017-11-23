const socket = io.connect();

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.set(0, 0, 200);
camera.lookAt(new THREE.Vector3(0, 0, 0));

var scene = new THREE.Scene();


//create a blue LineBasicMaterial
var material = new THREE.LineBasicMaterial({ color: defaultColor });

var geometry = new THREE.Geometry();

var defaultColor = new THREE.Color("rgb(255, 0, 0)");
var motionColor = {
    'G0': new THREE.Color("rgb(255, 127, 0)"),
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
    var divisions = 30;
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







var newmotion = addArcCurve({ motion: 'G2' }, { v1: { x: -12.7, y: 12.7, z: 0 } }, { v2: { x: 0, y: 12.7, z: 0 } }, { v0: { x: 0, y: 0, z: 0 } });

console.log(newmotion);






geometry.vertices.push(new THREE.Vector3(0, 0, 0));
geometry.vertices.push(new THREE.Vector3(50, 50, 0));



var line = new THREE.Line(geometry, material);

scene.add(line);
renderer.render(scene, camera);