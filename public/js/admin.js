var socket = io.connect();

$(document).ready(function() {


    var $table_user = $('#table');
    var $table_pending = $('#table2');

    socket.on("tdata", function(tdata) {;
        $(function() {

            $table_user.bootstrapTable('append', tdata);
            $table_user.bootstrapTable('scrollTo', 'bottom');

        });
    });

    socket.on("tdata2", function(tdata2) {;
        $(function() {

            $table_pending.bootstrapTable('append', tdata2);
            $table_pending.bootstrapTable('scrollTo', 'bottom');

        });
    });

    socket.on('PWD_ok', (data) => {

    })

    //#########################################################################

    $(function() {

        $table_user.on('click-row.bs.table', function(e, row, $element) {
            $('.bg-warning').removeClass('bg-warning');
            $($element).addClass('bg-warning');

            console.log('Selected ID: ' + getSelectedRow().id + ' Selected name: ' + getSelectedRow().name);
            var dat = {
                id: getSelectedRow().id,
                name: getSelectedRow().name,
                lastname: getSelectedRow().lastname,
                username: getSelectedRow().username,
                pwd: getSelectedRow().pwd,
                ts: getSelectedRow().ts
            }
            socket.emit('select_db', dat);
        });

    });

    function getSelectedRow() {
        var index = $table_user.find('tr.bg-warning').data('index');
        return $table_user.bootstrapTable('getData')[index];
    }

    //##

    $(function() {
        $table_pending.on('click-row.bs.table', function(e, row, $element) {
            $('.bg-warning').removeClass('bg-warning');
            $($element).addClass('bg-warning');

            console.log('Selected ID: ' + getSelectedRow2().id + ' Selected name: ' + getSelectedRow2().name);
            var dat2 = {
                id: getSelectedRow2().id,
                name: getSelectedRow2().name,
                lastname: getSelectedRow2().lastname,
                username: getSelectedRow2().username,
                pwd: getSelectedRow2().pwd,
                ts: getSelectedRow2().ts
            }
            socket.emit('select_db2', dat2);

        });
    });

    function getSelectedRow2() {
        var index = $table_pending.find('tr.bg-warning').data('index');
        return $table_pending.bootstrapTable('getData')[index];
    }

    $('#del_user_button').click(function() {

        socket.emit('deleteuser');
        location.reload();

    });

    $('#del_pending_button').click(function() {

        socket.emit('deletepending');
        location.reload();

    });

    $('#acc_pending_button').click(function() {

        socket.emit('acceptpending');
        location.reload();

    });

    $('#click').on('click', (d) => {

        var $inputs = $('#pwdform :input');

        // not sure if you wanted this, but I thought I'd add it.
        // get an associative array of just the values.
        var values = {};
        $inputs.each(function() {
            values[this.name] = $(this).val();

        });

        console.log(values);
        socket.emit('change_pwd', values);

    });

    //#########################################################################

});




function nameFormatter(value) {
    var str = '';
    for (i = 0; i < value.length; i++) {
        str = str + '*';
    }
    return str;
}