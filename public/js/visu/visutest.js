const socket = io.connect();


var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);
//camera.lookAt(new THREE.Vector3(0, 0, 0));
group = new THREE.Group();
group.position.y = 50;
group.background = new THREE.Color(0xf0f0f0);
scene.add(group);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/*
                var geometry = new THREE.BoxGeometry(1, 1, 1);
                var material = new THREE.MeshBasicMaterial({
                    color: 0x00fff0
                });
                var cube = new THREE.Mesh(geometry, material);
                group.add(cube);
 */
var defaultColor = new THREE.Color("rgb(255, 0, 0)");
var material = new THREE.LineBasicMaterial({ color: defaultColor });
var geometry = new THREE.Geometry();


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
    var divisions = 40;
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

//var newmotion = addArcCurve({ motion: 'G2', plane: "G17" }, { v1: { x: 0, y: 0, z: 0 } }, { v2: { x: 0, y: 12.7, z: 0 } }, { v0: { x: 0.7, y: 0, z: 0 } });
//var straight = addLine({ motion: 'G1' }, { v1: { x: 0, y: 0, z: 0 } }, { v2: { x: 10, y: 10, z: 0 } });




/*geometry.vertices.push(
    new THREE.Vector3(-100, 100, 0),
    new THREE.Vector3(0, 100, 0),
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 10, 0)

);*/



socket.on('toolpath', function(path) {
    //console.log(path[0].v1);

    console.log(path.length)
    pathlenght = path.length;

    for (var i = 0; i < pathlenght; i++) {
        console.log(path[i]);
        if (path[i].motion == "G0" || "G1");
        var newLine = addLine({ motion: path[i].motion }, { v1: path[i].v1 }, { v2: path[i].v2 });
        //var newLine = addLine({ motion: 'G0' }, { v1: { x: 50, y: 50, z: 0 } }, { v2: { x: 10, y: 10, z: 0 } });
        console.log(newLine.vertices);

        geometry.vertices.push(newLine[0]);
        geometry.vertices.push(newLine[1]);

    }

    group.add(line);
    console.log(line.geometry);



});


var line = new THREE.Line(geometry, material);
console.log(line.geometry);
group.add(line);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(group, camera);
}

animate();