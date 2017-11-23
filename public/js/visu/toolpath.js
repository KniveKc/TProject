'use strict';
const gcodeToolpath = require('gcode-toolpath');
const fs = require('fs-extra');
const colornames = require('colornames');

const file = fs.readFile(__dirname + '/example.nc')
    .then((data) => {


        var GCODE = data;
        //var GCODE = ['N1 G17 G20 G90 G94 G54', 'N2 G0 Z0.25', 'N3 X-0.5 Y0.', 'N4 Z0.1', 'N5 G01 Z0. F5.', 'N6 G02 X0. Y0.5 I0.5 J0. F2.5', 'N7 X0.5 Y0. I0. J-0.5', 'N8 X0. Y-0.5 I-0.5 J0.', 'N9 X-0.5 Y0. I0. J0.5', 'N10 G01 Z0.1 F5.', 'N11 G00 X0. Y0. Z0.25'].join('\n');

        var toolpaths = [];
        var gcode = new gcodeToolpath({
            addLine: function addLine(modal, v1, v2) {
                var motion = modal.motion;
                toolpaths.push({ motion: motion, v1: v1, v2: v2 });
            },
            addArcCurve: function addArcCurve(modal, v1, v2, v0) {
                var motion = modal.motion;
                toolpaths.push({ motion: motion, v1: v1, v2: v2, v0: v0 });
            }
        });

        gcode.loadFromString(GCODE, function(err, results) {
            console.log(toolpaths);
            module.exports.path = toolpaths;

        }).on('data', function(data) {
            // 'data' event listener
        }).on('end', function(results) {
            // 'end' event listener
        });

    })
    .catch(err => console.error(err));