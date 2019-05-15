var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Hotmail',
    auth: {
        user: 'elfarolitouaa@hotmail.com',
        pass: 'UAAisc2314'
    }
});

var mailOptions = {
    from: 'El Farolito',
    to: 'manudam69@gma',
    subject: 'Gracias por registrarte en el farolito.com',
    text: 'Click para verificar tu cuenta'
};

transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});