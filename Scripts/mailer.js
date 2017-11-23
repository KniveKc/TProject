var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'daveb0990@gmail.com',
        pass: 'Warsteiner1753'
    }
});

exports.mail = function sendMail(mailOptions) {

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}


///socket.emit('password_request', { username: 'admin', email: 'david.bransch@gmail.com' });