var express = require("express");
const app = express();
var nodemailer = require('nodemailer');
var User = require("../models/user.js");
var Curriculum = require("../models/curriculum.js");
const cookieSession = require('cookie-session');

app.use(cookieSession({
    name: 'session',
    keys: ['key_1', 'key_2'],
    maxAge: 24 * 60 * 60 * 1000
}));


const transporter = nodemailer.createTransport({
    service: 'Hotmail',
    auth: {
        user: 'elfarolitouaa@hotmail.com',
        pass: 'UAAisc2314'
    }
});


var rand, host, link, mailOptions;
//Registrando al usuario en la base de datos.
app.post("/signup", (req, res) => {
    const newUser = new User({
        name: req.body.name,
        user: req.body.user,
        email: req.body.email,
        password: req.body.password,
        validated: false
    });

    newUser.save((err, userdb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        rand = Math.floor((Math.random() * 100) + 54);
        host = req.get('host');
        link = "http://" + req.get('host') + "/verify?id=" + rand;

        mailOptions = {
            from: 'El Farolito',
            to: userdb.email,
            subject: "Por favor confirma tu correo electrónico",
            html: "Gracias por registrarte en el farolito," +
                "<br> " +
                "Por favor verifica tu cuenta de usuario." +
                "<br>" +
                "<a href=" + link + ">Click aqui para verificar</a>"
        };

        transporter.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                res.end("error");
            } else {
                res.end("sent");
            }
        });

        res.status(201).json({
            ok: true,
            userdb
        });
    });
});

app.get('/verify', function (req, res) {
    console.log(req.protocol + ":/" + req.get('host'));
    User.findOneAndUpdate({
        email: mailOptions.to
    }, {
        validated: true
    }, (err, userdb) => {
        if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
            console.log("Domain is matched. Information is from Authentic email");
            if (req.query.id == rand) {
                console.log("email is verified");
                res.end("<h5>El correo " + mailOptions.to + " fue verificado exitosamente");
            } else {
                console.log("email is not verified");
                res.end("<h5>Hubo un problema al verificar o el correo ya esta verificado</h5>");
            }
        } else {
            res.end("<h5>Request is from unknown source</h5>");
        }
    });
});

app.post("/is-validated", (req, res) => {
    User.findOne({
        user: req.body.user
    }, (err, userdb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!userdb) {
            return res.status(400).json({
                ok: false,
                msg: "Usuario no encontrado"
            });
        }
        res.json({
            validated: userdb.validated
        });
    });
});

app.post("/login", (req, res) => {
    User.findOne({
        user: req.body.user,
        password: req.body.password
    }, (err, userdb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!userdb) {
            return res.status(404).json({
                ok: false,
                msg: "Error en usuario o contraseña"
            });
        }
        req.session.email = userdb.email;
        req.session.user = userdb.user;
        res.json({
            ok: true,
            userdb
        });
    });
});

app.get("/logout", (req, res) => {
    if (req.session.email && req.session.user) {
        req.session = null;
        return res.json({
            ok: true
        });
    }
    res.status(404).json({
        ok: false
    });
});


app.get("/is-log", (req, res) => {
    if (req.session.email && req.session.user) {
        User.findOne({
            email: req.session.email,
            user: req.session.user
        }, (err, userdb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            return res.json({
                ok: true,
                user: userdb
            });
        });
    } else {
        res.json({
            ok: false
        });
    }
});

app.post("/curriculum-upload", (req, res) => {
    if (req.session.email && req.session.user) {
        User.findOne({
            user: req.session.user,
            email: req.session.email
        }, (err, userdb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            const newCurriculum = new Curriculum({
                name: userdb.name,
                address: req.body.address,
                telephone: req.body.telephone,
                email: userdb.email,
                birthDate: req.body.birthDate,
                country: req.body.country,
                profession: req.body.profession,
                experience: req.body.experience
            });
            newCurriculum.save((err, curriculumdb) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                res.status(201).json({
                    ok: true,
                    curriculumdb
                });
            });
        });
    }
});

app.get("/curriculum", (req, res) => {
    if (req.session.user && req.session.email) {
        Curriculum.findOne({
            email: req.session.email
        }, (err, curriculumdb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!curriculumdb) {
                return res.json({
                    ok: false
                });
            }
            res.json({
                ok: true,
                curriculum: curriculumdb
            });
        });
    }
});

app.get("/delete-user", (req, res) => {
    if (req.session.user && req.session.email) {
        User.findOneAndRemove({
            email: req.session.email,
            user: req.session.user
        }).exec(function (err, userdb) {
            if (err) {
                return res.status(500).json({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                req.session = null;
                return res.status(200).json({
                    message: "Cuenta eliminada",
                    userdb
                });
            }
        });
    } else {
        return res.status(404).json({
            message: "No existe sesion como usuario"
        });
    }
});

module.exports = app;
