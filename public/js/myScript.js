var socket = io.connect();

var path = new paper.Path();
path.strokeColor = 'black';

socket.on("fileinputs", function(text) {
    path.remove();

    console.log(text);
    path.add(new paper.Point(x, y));

});





socket.on("newCommand", function(commands) {

    x = (commands.WXPos);
    y = (commands.WYPos);
    console.log(x + " " + y);

    var myCircle = new Path.Circle(new Point(x, y), 2);
    myCircle.fillColor = 'black';

    setTimeout(function() {
        myCircle.remove();
    }, 200);
    //if (x < 0.5 && y < 0.5) {
    //path.removeSegments(0, i);
    //}


});