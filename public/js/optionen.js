var socket = io.connect();

$(document).ready(function() {

    socket.emit('options');
    socket.emit('options');


    $('#refresh').click(() => {

        location.reload();


    });

    socket.once('ports', (data) => {

        $.each(data, function(index, value) {
            $('#myTable3 tbody').append(`<tr class="child"><td><strong>${value}</strong></td></tr>`);

        });

    })


    socket.once('newOptions', (_data) => {


        try {
            var data = JSON.parse(_data);
            console.log(data);
        } catch (err) {
            console.log(err);
        }

        var i = 0;
        $.each(data.options, function(index, value) {
            $('#myTable tbody').append(`<tr class="child"><td><strong>${data.setting_codes[i].Setting}</strong></td><td>${value}</td><td>${data.setting_codes[i].Units}</td><td><input type="text" id="text${i}"></input><button class="btn btn-primary" id="submit${i}` + '">Change Value</button>' + '</td></tr>');
            i < 34 ? i++ : i = 0;
        });

        var i = 0;
        $.each(data.grbl_data_printout, function(index, value) {
            if (typeof value === 'object') {
                $('#myTable2 tbody').append(`<tr class="child"><td><strong>${index}</strong><td><strong>${value.X}</strong></td><td><strong>${value.Y}</strong></td></tr>`);

            } else {
                $('#myTable2 tbody').append(`<tr class="child"><td><strong>${index}</strong><td><strong>${value}</strong></td><td><strong></strong></td></tr>`);
            }
            i < 12 ? i++ : i = 0;
        });

        $('#submit0').click(() => {
            var val = $('#text0').val();
            var command = `$0 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit1').click(() => {
            var val = $('#text1').val();
            var command = `$1 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit2').click(() => {
            var val = $('#text2').val();
            var command = `$3 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit3').click(() => {
            var val = $('#text3').val();
            var command = `$4 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit4').click(() => {
            var val = $('#text4').val();
            var command = `$5 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit5').click(() => {
            var val = $('#text5').val();
            var command = `$6 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit6').click(() => {
            var val = $('#text6').val();
            var command = `$10 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit7').click(() => {
            var val = $('#text7').val();
            var command = `$11 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit8').click(() => {
            var val = $('#text8').val();
            var command = `$12 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit9').click(() => {
            var val = $('#text9').val();
            var command = `$13 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit10').click(() => {
            var val = $('#text10').val();
            var command = `$20 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit11').click(() => {
            var val = $('#text11').val();
            var command = `$21 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit12').click(() => {
            var val = $('#text12').val();
            var command = `$22 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit13').click(() => {
            var val = $('#text13').val();
            var command = `$22 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit14').click(() => {
            var val = $('#text14').val();
            var command = `$23 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit15').click(() => {
            var val = $('#text24').val();
            var command = `$31 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit16').click(() => {
            var val = $('#text16').val();
            var command = `$25 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit17').click(() => {
            var val = $('#text17').val();
            var command = `$26 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit18').click(() => {
            var val = $('#text18').val();
            var command = `$27 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit19').click(() => {
            var val = $('#text19').val();
            var command = `$30 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit20').click(() => {
            var val = $('#text20').val();
            var command = `$31 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit21').click(() => {
            var val = $('#text21').val();
            var command = `$32 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit22').click(() => {
            var val = $('#text22').val();
            var command = `$100 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit23').click(() => {
            var val = $('#text23').val();
            var command = `$101 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit24').click(() => {
            var val = $('#text24').val();
            var command = `$102 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit25').click(() => {
            var val = $('#text25').val();
            var command = `$110 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit26').click(() => {
            var val = $('#text26').val();
            var command = `$111 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit27').click(() => {
            var val = $('#text27').val();
            var command = `$112 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit28').click(() => {
            var val = $('#text28').val();
            var command = `$120 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit29').click(() => {
            var val = $('#text29').val();
            var command = `$121 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit30').click(() => {
            var val = $('#text30').val();
            var command = `$122 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit31').click(() => {
            var val = $('#text31').val();
            var command = `$130 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit32').click(() => {
            var val = $('#text32').val();
            var command = `$131 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
        $('#submit33').click(() => {
            var val = $('#text33').val();
            var command = `$132 = ${val}`;
            socket.emit('command', {
                command: command
            });
            location.reload();
        })
    });
});