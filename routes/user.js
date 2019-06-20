var express = require("express");
const app = express();
var nodemailer = require('nodemailer');
var User = require("../models/user.js");
var Curriculum = require("../models/curriculum.js");
const Company = require("../models/company.js");
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
    Company.findOne({
        email: req.body.email
    }, (err, companydb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!companydb) {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                validated: false,
                type: "user"
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
        } else {
            return res.status(400).json({
                ok: false,
                msg: "El correo electrónico ya existe en nuestro sistema."
            });
        }
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

app.post("/login", async (req, res) => {
    const userdb = await User.findOne({
        email: req.body.email,
        password: req.body.password,
    });
    if (!userdb) {
        const companydb = await Company.findOne({
            email: req.body.email,
            password: req.body.password,
        });

        if (!companydb) {
            return res.status(400).json({
                msg: "Correo electrónico o contraseña incorrectos",
                ok: false
            });
        }

        if (!companydb.validated) {
            return res.status(403).json({
                ok: false,
                msg: "Correo electrónico no verificado, por favor verificalo."
            })
        }
        req.session.email = companydb.email;
        return res.json({
            ok: true
        });
    }

    if (!userdb.validated) {
        return res.status(403).json({
            ok: false,
            msg: "Correo electrónico no verificado, por favor verificalo."
        })
    }

    req.session.email = userdb.email;
    return res.json({
        ok: true
    });
});

app.get("/logout", (req, res) => {
    if (req.session.email) {
        req.session = null;
        return res.json({
            ok: true
        });
    }
    res.status(404).json({
        ok: false
    });
});


app.get("/is-log", async (req, res) => {
    if (req.session.email) {
        const userdb = await User.findOne({
            email: req.session.email
        });
        if (!userdb) {
            const companydb = await Company.findOne({
                email: req.session.email,
            });
            if (!companydb) {
                return res.status(400).json({
                    ok: false
                });
            }

            return res.json({
                ok: true,
                user: companydb
            });
        }
        return res.json({
            ok: true,
            user: userdb
        });
    }
    return res.status(403).json({
        ok: false,
        msg: "No existe sesion"
    });

});

app.post("/curriculum-upload", (req, res) => {
    if (req.session.email) {
        User.findOne({
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
                experience: req.body.experience,
                visible: false
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
    if (req.session.email) {
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

app.get("/curriculums", (req, res) => {
    Curriculum.find({
        visible: true
    }, (err, curriculumdb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!curriculumdb) {
            return res.status(400).json({
                ok: false
            });
        }

        res.status(200).json({
            ok: true,
            curriculums: curriculumdb
        });

    });
});

app.post("/req-curr", (req, res) => {
    Curriculum.findOne({
        _id: req.body.id
    }, (err, curriculumdb) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(200).json({
            ok: true,
            curriculum: curriculumdb
        });
    });
});

app.get("/delete-user", (req, res) => {
    if (req.session.email) {
        User.findOneAndDelete({
            email: req.session.email
        }, (err, userdb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Curriculum.findOneAndDelete({
                email: req.session.email
            }, (err, curriculumdb) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                if (!curriculumdb) {
                    req.session = null;
                    return res.json({
                        ok: true,
                        msg: "La cuenta no tenia curriculum"
                    });
                }
                req.session = null;
                return res.json({
                    ok: true,
                    message: "Cuenta eliminada",
                    userdb
                });
            });
        });
    } else {
        res.status(404).json({
            message: "No existe sesion como usuario"
        });
    }
});

app.get("/curriculum-visible", (req, res) => {
    if (req.session.email) {
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
                return res.status(400).json({
                    ok: false
                });
            }

            if (curriculumdb.visible) {
                curriculumdb.visible = false;
            } else {
                curriculumdb.visible = true;
            }
            curriculumdb.save();
            res.status(200).json({
                ok: true,
                msg: "Curriculum actualizado"
            });
        });
    }
});

app.post("/modify-curriculum", (req, res) => {
    if (req.session.email) {
        User.findOne({
            email: req.session.email
        }, (err, userdb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Curriculum.findOne({
                email: userdb.email
            }, (err, curriculumdb) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                if (!curriculumdb) {
                    return res.status(400).json({
                        ok: false
                    });
                }

                curriculumdb.address = req.body.address || curriculumdb.address;
                curriculumdb.telephone = req.body.telephone || curriculumdb.telephone;
                curriculumdb.birthDate = req.body.birthDate || curriculumdb.birthDate;
                curriculumdb.country = req.body.country || curriculumdb.country;
                curriculumdb.profession = req.body.profession || curriculumdb.profession;
                curriculumdb.experience = req.body.experience || curriculumdb.experience;
                curriculumdb.save();

                res.status(200).json({
                    ok: true,
                    msg: "Curriculum actualizado"
                });
            });
        });
    } else {
        res.json({
            msg: "No existe sesion"
        });
    }
});

app.post("/modify-password", async (req, res) => {
    if (req.session.email) {
        const userdb = await User.findOne({
            email: req.session.email,
            password: req.body.password
        });

        if (!userdb) {
            const companydb = await Company.findOne({
                email: req.session.email,
                password: req.body.password
            });
            if (!companydb) {
                return res.status(400).json({
                    ok: false,
                    msg: "Error en contraseña"
                });
            }
            companydb.password = req.body.password2 || companydb.password;
            companydb.save();
            return res.json({
                ok: true
            });
        }
        userdb.password = req.body.password2 || userdb.password;
        userdb.save();
        return res.json({
            ok: true
        });

    }
});

app.post("/apply", (req, res) => {
    if (req.session.email) {
        mailOptions = {
            from: 'El Farolito',
            to: req.body.email,
            subject: "Tienes un nuevo postulante para tu vacante de trabajo",
            html:
                "Tu vacante de trabajo: " + req.body.projectName +
                "<br> " +
                "Datos del postulante " +
                "<br>" +
                "<a href=" + req.body.link + ">Click aqui para ver perfil del postulante</a>"
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        res.status(200).json({
            ok: true,
            msg: "correo enviado"
        });
    } else {
        res.status(403).json({
            ok: false,
            msg: "Usuario sin sesion"
        });
    }
});

module.exports = app;
