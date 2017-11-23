var socket = io.connect();

function switchDialogs() {
    $("#myModal").toggle();
    $('#newModal').toggle();
}


$(document).ready(function() {

    //socket.emit('password_request', { username: 'admin', email: 'david.bransch@gmail.com' });

    socket.on("percentage", function(percentage) {
        console.log(percentage);
        $('.progress-bar').text(parseInt(percentage) + '%');
        $('.progress-bar').width(percentage + '%');
    });

    $("#signUpAbort").click(function() {
        switchDialogs();
    });
    $("#signUpButton").click(function() {
        switchDialogs();
    });

});