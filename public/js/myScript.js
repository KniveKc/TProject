var path = new Path();
// Give the stroke a color
path.strokeColor = 'black';
var point1 = new Point(0, 0);
var point2 = new Point(100, 100);
var point3 = new Point(100, 0);

var vector = point2 - point1;
console.log(vector);

// Move to start and draw a line from there
path.moveTo(point1);
path.add(point2);
path.strokeColor = 'red';
path.add(point3);
// Note the plus operator on Point objects.
// PaperScript does that for us, and much more!