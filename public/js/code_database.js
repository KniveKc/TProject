socket = io.connect();

$(document).ready(function() {

    $('.upload-btn').on('click', function() {
        $('#upload-input').click();
        $('.progress-bar').text('0%');
        $('.progress-bar').width('0%');
    });


    $('#upload-input').on('change', function() {

        var files = $(this).get(0).files;

        if (files.length > 0) {
            // create a FormData object which will be sent as the data payload in the
            // AJAX request
            var formData = new FormData();

            // loop through all the selected files and add them to the formData object
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                console.log(file);
                // add the files to formData object for the data payload
                formData.append('uploads[]', file, file.name);
            }

            $.ajax({
                url: '/upload',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data) {
                    console.log('upload successful!\n' + data);
                },
                xhr: (err) => {
                    // create an XMLHttpRequest
                    if (err) console.error(err);

                    var xhr = new XMLHttpRequest();

                    // listen to the 'progress' event
                    xhr.upload.addEventListener('progress', function(evt) {

                        if (evt.lengthComputable) {
                            // calculate the percentage of upload completed
                            var percentComplete = evt.loaded / evt.total;
                            percentComplete = parseInt(percentComplete * 100);

                            // update the Bootstrap progress bar with the new percentage
                            $('.progress-bar').text(percentComplete + '%');
                            $('.progress-bar').width(percentComplete + '%');

                            // once the upload reaches 100%, set the progress bar text to done
                            if (percentComplete === 100) {
                                location.reload();
                                $('.progress-bar').html('Done');
                            }

                        }

                    }, false);

                    return xhr;
                }
            });

        }

    });


    var $table = $('#table');


    socket.on("t_codes", function(t_codes) {;
        $(function() {

            $table.bootstrapTable('append', t_codes);
            $table.bootstrapTable('scrollTo', 'bottom');

        });
    });

    $(function() {

        $table.on('click-row.bs.table', function(e, row, $element) {
            $('.bg-warning').removeClass('bg-warning');
            $($element).addClass('bg-warning');
            $('#button').click();
            console.log(`Selected Id: ${getSelectedRow().code_id} Name: ${getSelectedRow().code_name}`);
            var dat = {
                id: getSelectedRow().code_id,
                name: getSelectedRow().code_name,
                location: getSelectedRow().code_location,
            };
            socket.emit('select_code', dat);
        });

    });

    function getSelectedRow() {
        var index = $table.find('tr.bg-warning').data('index');
        return $table.bootstrapTable('getData')[index];
    }

    $('#delete_button').click(function() {
        socket.emit('delete_code');
        location.reload();
    });

    $('#select_button').click(function() {
        socket.emit('plot_code');

    });

});