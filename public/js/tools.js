var socket = io.connect();
var lastCommand = "";

$(document).ready(function() {

    /*socket.once('ports', (data) => {

        let i = 0;
        $.each(data, function(index, value) {
            $('#drop_body').append(`<a id="drop${i}" value="${value}" class="dropdown-item">${value}</a>`);
            i++;
        });

        $('#drop0').click(() => {
            port = ($('#drop0')).attr('value')
            console.log(port);
            socket.emit('open_com', port)
        })
        $('#drop1').click(() => {
            port = ($('#drop1')).attr('value')
            console.log(port);
            socket.emit('open_com', port)
        })

    })*/


    socket.on("percentage", function(percentage) {
        //console.log(percentage);
        $('.progress-bar').text(parseFloat(percentage).toPrecision(4) + '%');
        $('.progress-bar').width(percentage + '%');
    });


    socket.on("newCommand", function(_grbl_daten) {
        //console.log(_grbl_daten);

        try {
            var grbl_daten = JSON.parse(_grbl_daten);
            console.log(grbl_daten);
        } catch (e) {
            //console.log(e);
        }

        if (grbl_daten !== undefined) {
            if (grbl_daten.command != lastCommand) {

                $("#liste").append(
                    $("<li></li>").text(grbl_daten.command)
                );
                lastCommand = grbl_daten.command;
            }

            $("#MXPos").text(`${Math.round((grbl_daten.MPos.Y)*100)/100} mm`);
            $("#MYPos").text(`${Math.round((grbl_daten.MPos.X)*100)/100} mm`);
            $("#status").text(grbl_daten.status);
            $("#WXPos").text(`${Math.round((grbl_daten.MPos.X - grbl_daten.WCO.X)*100)/100} mm`);
            $("#WYPos").text(`${Math.round((grbl_daten.MPos.Y - grbl_daten.WCO.Y)*100)/100} mm`);
            $("#WCOX").text(`${Math.round((grbl_daten.WCO.X)*100)/100} mm`);
            $("#WCOY").text(`${Math.round((grbl_daten.WCO.Y)*100)/100} mm`);
            $("#feed").text(`${grbl_daten.FS.F} mm/min`);
            $("#spindle").text(grbl_daten.FS.S);
            $("#ovf").text(`${grbl_daten.Ov.F} %`);
            $("#ovr").text(`${grbl_daten.Ov.R} %`);
            $("#ovs").text(`${grbl_daten.Ov.S} %`);

            if (grbl_daten.status == "Alarm") {
                $("#status").css({
                    color: "darkred"
                });
            } else if (grbl_daten.status == "Run") {
                $("#status").css({
                    color: "red"
                });
            } else if (grbl_daten.status == "Idle") {
                $("#status").css({
                    color: "green"
                });
            } else if (grbl_daten.status == "Hold") {
                $("#status").css({
                    color: "orange"
                });
            }

            $(function() {
                var pre = $("#scrollpre");
                pre.scrollTop(pre.prop("scrollHeight"));
            });
        }
    });

    $("#unlock").click(function() {
        socket.emit("entsperren");
    });

    $("#senden").click(function() {
        var command = $("#command").val();
        socket.emit("command", {
            command: command
        });
    });


    $("#homing").click(function() {
        socket.emit("homing");
    });


    $("#open").click(function() {
        socket.emit("open");
    });

    $("#close").click(function() {
        socket.emit("close");
    });

    $("#goToZero").click(function() {
        socket.emit("goToZero");
    });

    $("#options").click(function() {
        socket.emit("options");
    });

    $("#softReset").click(function() {
        socket.emit("softReset");
    });

    $("#sendeCode").click(function() {
        socket.emit("sendeCode");
    });

    //
    $("#pauseCode").click(function() {
        socket.emit("pauseCode");
    });

    $("#resumeCode").click(function() {
        socket.emit("resumeCode");
    });

    $("#stopCode").click(function() {
        socket.emit("stopCode");
    });
    //

    $("#setZero1").click(function() {
        socket.emit("setZero1");

    });

    $("#setZero2").click(function() {
        socket.emit("setZero2");

    });

    $("#setZero3").click(function() {
        socket.emit("setZero3");

    });

    $("#setZero4").click(function() {
        socket.emit("setZero4");

    });

    $("#setZero5").click(function() {
        socket.emit("setZero5");

    });

    $("#setZero6").click(function() {
        socket.emit("setZero6");

    });



    var xmm = 0.1;
    var xmmy = 0.1;

    $("#xp").click(function() {
        socket.emit("xp", {
            mm: xmm
        });
    });

    $("#xm").click(function() {
        socket.emit("xm", {
            mm: xmm
        });
    });

    $("#yp").click(function() {
        socket.emit("yp", {
            mm: ymm
        });
    });

    $("#ym").click(function() {
        socket.emit("ym", {
            mm: ymm
        });
    });


    //Slider-control

    $('#sliderx').change(function() {
        $('#outx').text(
            $('#sliderx').val()
        );
        xmm = $('#sliderx').val()
        console.log(xmm);
    })

    $('#slidery').change(function() {
        $('#outy').text(
            $('#slidery').val()
        );
        ymm = $('#slidery').val()
        console.log(ymm);
    })

    //SAlider 2 (test)

    $('#sliderx1').change(function() {
        $('#outx1').text(
            $('#sliderx1').val()
        );
        xmm = $('#sliderx1').val()
        console.log(xmm);
        socket.emit("xp1", {
            mm: xmm
        });
    })

    $('#slidery1').change(function() {
            $('#outy1').text(
                $('#slidery1').val()
            );
            ymm = $('#slidery1').val()
            console.log(ymm);
            socket.emit("yp1", {
                mm: ymm
            });
        })
        //
        //Laser Control


    $('#laserOn').click(function() {
        socket.emit("command", {
            command: "M03"
        });
    })

    $('#laserOff').click(function() {
        socket.emit("command", {
            command: "M05"
        });
    })

    $('#G54').click(function() {
        socket.emit("command", {
            command: "G54"
        });
    })

    $('#G55').click(function() {
        socket.emit("command", {
            command: "G55"
        });
    })

    $('#G56').click(function() {
        socket.emit("command", {
            command: "G56"
        });
    })

    $('#G57').click(function() {
        socket.emit("command", {
            command: "G57"
        });
    })
    $('#G58').click(function() {
        socket.emit("command", {
            command: "G58"
        });
    })
    $('#G59').click(function() {
        socket.emit("command", {
            command: "G59"
        });
    })

    $('#sliderlaser').change(function() {
        $('#outlaser').text(
            $('#sliderlaser').val()
        );
        var laserpwm = $('#sliderlaser').val()
        socket.emit("command", {
            command: "S" + laserpwm
        });
        console.log(ymm);
    })


    //File 
    $('#ul').on('change', function() {

        var reader = new FileReader();
        var text;

        reader.onload = function(e) {
            text = reader.result
            console.log(reader.result);
            socket.emit("fileinput", text);

        }

        reader.readAsText(this.files[0]);

        //console.log(this.files[0]);

    }).click();

    // Feed rate override

    $("#feed_ovr_reset").click(function() {
        socket.emit("feed_ovr_reset");
    });
    $("#feed_ovr_plus").click(function() {
        socket.emit("feed_ovr_plus");
    });
    $("#feed_ovr_minus").click(function() {
        socket.emit("feed_ovr_minus");
    });
    $("#feed_ovr_fplus").click(function() {
        socket.emit("feed_ovr_fplus");
    });
    $("#feed_ovr_fminus").click(function() {
        socket.emit("feed_ovr_fminus");
    });

    $("#spindle_ovr_reset").click(function() {
        socket.emit("spindle_ovr_reset");
    });
    $("#spindle_ovr_plus").click(function() {
        socket.emit("spindle_ovr_plus");
    });
    $("#spindle_ovr_minus").click(function() {
        socket.emit("spindle_ovr_minus");
    });
    $("#spindle_ovr_fplus").click(function() {
        socket.emit("spindle_ovr_fplus");
    });
    $("#spindle_ovr_fminus").click(function() {
        socket.emit("spindle_ovr_fminus");
    });


    $("#spindle_ovr_stop").click(function() {
        socket.emit("spindle_ovr_stop");
    });
    $("#rapid_ovr_reset").click(function() {
        socket.emit("rapid_ovr_reset");
    });
    $("#rapid_ovr_medium").click(function() {
        socket.emit("rapid_ovr_medium");
    });
    $("#rapid_ovr_low").click(function() {
        socket.emit("rapid_ovr_low");
    });

});