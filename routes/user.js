var express = require("express");
const app = express();
var nodemailer = require('nodemailer');
var User = require("../models/user.js");
var Curriculum = require("../models/curriculum.js");
var State = require("../models/state.js");
const Company = require("../models/company.js");
const cookieSession = require('cookie-session');
//Creacion de la sesion por medio de cookies
app.use(cookieSession({
    name: 'session',
    keys: ['key_1', 'key_2'],
    maxAge: 24 * 60 * 60 * 1000
}));
//Para enviar los correos a los usuarios
const transporter = nodemailer.createTransport({
    service: 'Hotmail',
    auth: {
        user: 'elfarolitouaa@hotmail.com', //correo del remitente
        pass: 'UAAisc2314'
    }
});

var rand, host, link, mailOptions;
//Registrando al usuario en la base de datos.
app.post("/signup", (req, res) => {
    Company.findOne({ //Busca en la base de datos
        email: req.body.email
    }, (err, companydb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!companydb) {//Creacion de nuevo usuarios
            const newUser = new User({
                //Datos recuperados del front
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                validated: false,
                type: "user"
            });

            newUser.save((err, userdb) => { //Guarda en la base de datos
                if (err) {
                    return res.status(500).json({ //fallo
                        ok: false,
                        err
                    });
                }
                //Creacion del link para verificar cuenta
                rand = Math.floor((Math.random() * 100) + 54);
                host = req.get('host');
                link = "http://" + req.get('host') + "/verify?id=" + rand;
                //Envio de correo de verificacion
                mailOptions = { //Cuerpo del correo
                    from: 'El Farolito',
                    to: userdb.email,
                    subject: "Por favor confirma tu correo electrónico",
                    html: "Gracias por registrarte en el farolito," +
                        "<br> " +
                        "Por favor verifica tu cuenta de usuario." +
                        "<br>" +
                        "<a href=" + link + ">Click aqui para verificar</a>"
                };
                //Envio del correo
                transporter.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        console.log(error);
                        res.end("error");
                    } else {
                        res.end("sent");
                    }
                });

                res.status(201).json({ //Exito
                    ok: true,
                    userdb
                });
            });
        } else {
            return res.status(400).json({ //Ya existe el usuario
                ok: false,
                msg: "El correo electrónico ya existe en nuestro sistema."
            });
        }
    });
});
//Verificacion de la cuenta
app.get('/verify', function (req, res) {
    console.log(req.protocol + ":/" + req.get('host'));
    User.findOneAndUpdate({ //Busca y actualiza la base de datos
        email: mailOptions.to
    }, {
        validated: true //Actualiza el estado de la validacion
    }, (err, userdb) => {
        if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
            console.log("Domain is matched. Information is from Authentic email");
            if (req.query.id == rand) {
                console.log("email is verified");
                res.end("<h5>El correo " + mailOptions.to + " fue verificado exitosamente");//Exito
            } else {
                console.log("email is not verified");
                res.end("<h5>Hubo un problema al verificar o el correo ya esta verificado</h5>"); //Error
            }
        } else {
            res.end("<h5>Request is from unknown source</h5>"); //Khe esta pasanda?!
        }
    });
});
//Inicio de sesion
app.post("/login", async (req, res) => {
    const userdb = await User.findOne({ //Busca en la base de datos de usuarios
        email: req.body.email, //correo y ...
        password: req.body.password, //...contraseña
    });
    if (!userdb) {
        const companydb = await Company.findOne({ //Busca en la base de datos de empresa
            email: req.body.email, //correo y
            password: req.body.password, //...contraseña
        });

        if (!companydb) { //error
            return res.status(400).json({
                msg: "Correo electrónico o contraseña incorrectos",
                ok: false
            });
        }

        if (!companydb.validated) { //Correo no verificado aun para la empresa
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

    if (!userdb.validated) { //Correo no verificado aun para el usuario
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
//Cerrar sesion
app.get("/logout", (req, res) => {
    if (req.session.email) {
        req.session = null; //invalida la sesion actual
        return res.json({
            ok: true
        });
    }
    res.status(404).json({
        ok: false
    });
});

//Funcion para verificar el tipo de usuario que inicia sesion
app.get("/is-log", async (req, res) => {
    if (req.session.email) {
        const userdb = await User.findOne({ //Busca en los usuarios
            email: req.session.email
        });
        if (!userdb) {
            const companydb = await Company.findOne({ //Busca en las empresas
                email: req.session.email,
            });
            if (!companydb) {
                return res.status(400).json({ //Fallo
                    ok: false
                });
            }

            return res.json({ //Exito en empresa
                ok: true,
                user: companydb
            });
        }
        return res.json({ //Exito en compañia
            ok: true,
            user: userdb
        });
    }
    return res.status(403).json({ //No se encontro ninguno
        ok: false,
        msg: "No existe sesion"
    });

});
//Subir un curriculum nuevo
app.post("/curriculum-upload", (req, res) => {
    if (req.session.email) {
        User.findOne({ //Verifica que exista sesion
            email: req.session.email
        }, (err, userdb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            const newState = new State({
                state: req.body.state
            });

            newState.save((err, statedb) => {
                if (err) throw err;
                const newCurriculum = new Curriculum({
                    //Datos recuperados del front
                    name: userdb.name,
                    address: req.body.address,
                    telephone: req.body.telephone,
                    email: userdb.email,
                    birthDate: req.body.birthDate,
                    profession: req.body.profession,
                    experience: req.body.experience,
                    visible: false,
                    idstate: statedb._id
                });

                newCurriculum.save((err, curriculumdb) => { //Creacion de curriculum en la base
                    if (err) {
                        return res.status(500).json({ //Fallo
                            ok: false,
                            err
                        });
                    }
                    res.status(201).json({ //Exito
                        ok: true,
                        curriculumdb
                    });
                });
            });
        });
    }
});

//Buscar un curriculum
app.get("/curriculum", (req, res) => {
    if (req.session.email) { //Verifica la sesion inicada
        Curriculum.findOne({ //Busca en la base de datos
            email: req.session.email
        }, (err, curriculumdb) => {
            if (err) throw err;
            if (!curriculumdb) { //No existe el curriculum
                return res.json({
                    ok: false
                });
            }
            State.findOne({
                _id: curriculumdb.idstate
            }, (err, statedb) => {
                res.json({ //Curriculum encontrado
                    ok: true,
                    curriculum: curriculumdb,
                    state: statedb
                });
            });
        });
    }
});

app.get("/curriculums", (req, res) => {
    Curriculum.find({
        visible: true
    }, (err, curriculumdb) => {
        if (err) throw err;
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
        if (err) throw err;
        State.findOne({
            _id: curriculumdb.idstate
        }, (err, statedb) => {
            res.status(200).json({
                ok: true,
                curriculum: curriculumdb,
                state: statedb
            });
        });
    });
});
//Eliminar usuario de la base de datos
app.get("/delete-user", (req, res) => {
    if (req.session.email) { //Verifica que exista sesion
        User.findOneAndDelete({ //Busca y elimina
            email: req.session.email
        }, (err, userdb) => {
            if (err) throw err;
            Curriculum.findOneAndDelete({ //Elimina el curriculum asociado al usuario
                email: req.session.email
            }, (err, curriculumdb) => {
                if (err) throw err;
                if (!curriculumdb) { //No existia ningun curriculum
                    req.session = null;
                    return res.json({
                        ok: true,
                        msg: "La cuenta no tenia curriculum"
                    });
                }
                State.findOneAndDelete({
                    _id: curriculumdb.idstate
                }, (err, statedb) => {
                    if (err) throw err;
                    req.session = null;
                    return res.json({ //Exito
                        ok: true,
                        message: "Cuenta eliminada",
                        userdb,
                        statedb
                    });
                });
            });
        });
    } else {
        res.status(404).json({ //No hay sesion activa
            message: "No existe sesion como usuario"
        });
    }
});
//Mostrar u ocultar los curriculums
app.get("/curriculum-visible", (req, res) => {
    if (req.session.email) { //Verifica la sesion
        Curriculum.findOne({ //Busca en la base de datos
            email: req.session.email
        }, (err, curriculumdb) => {
            if (err) {
                return res.status(500).json({ //Fallo
                    ok: false,
                    err
                });
            }

            if (!curriculumdb) {
                return res.status(400).json({ //No existe
                    ok: false
                });
            }

            if (curriculumdb.visible) { //Cambio de visible a invisible
                curriculumdb.visible = false;
            } else {
                curriculumdb.visible = true; //Cambio de invisible a visible
            }
            curriculumdb.save(); //Actualiza la base
            res.status(200).json({
                ok: true,
                msg: "Curriculum actualizado"
            });
        });
    }
});
//Modificacion de curriculum
app.post("/modify-curriculum", (req, res) => {
    if (req.session.email) { //Verifica sesion
        User.findOne({ //Busca en la base de datos
            email: req.session.email
        }, (err, userdb) => {
           if (err) throw err;
            Curriculum.findOne({
                email: userdb.email
            }, (err, curriculumdb) => {
                if (err) throw err;
                if (!curriculumdb) {
                    return res.status(400).json({
                        ok: false
                    });
                }

                State.findOne({
                    _id: curriculumdb.idstate
                },(err,statedb) => {
                    if (err) throw err;
                    //Datos a modificar recuperados del front
                    curriculumdb.address = req.body.address || curriculumdb.address;
                    curriculumdb.telephone = req.body.telephone || curriculumdb.telephone;
                    curriculumdb.birthDate = req.body.birthDate || curriculumdb.birthDate;
                    statedb.state = req.body.state || statedb.state;
                    curriculumdb.profession = req.body.profession || curriculumdb.profession;
                    curriculumdb.experience = req.body.experience || curriculumdb.experience;
                    curriculumdb.save(); //Actualiza los nuevos datos

                    res.status(200).json({
                        ok: true,
                        msg: "Curriculum actualizado"
                    });
                });
            });
        });
    } else {
        res.json({
            msg: "No existe sesion"
        });
    }
});
//Modificar la contraseña
app.post("/modify-password", async (req, res) => {
    if (req.session.email) { //Verificacion de cuenta de usuario
        const userdb = await User.findOne({
            email: req.session.email,
            password: req.body.password
        });

        if (!userdb) { //Verificacion de cuenta de empresa
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
            //Nueva contraseña empresa
            companydb.password = req.body.password2 || companydb.password;
            companydb.save(); //actualiza
            return res.json({
                ok: true
            });
        }
        //Nueva contraseña usuario
        userdb.password = req.body.password2 || userdb.password;
        userdb.save(); //actualiza
        return res.json({
            ok: true
        });

    }
});
//envio de correo a la empresa
app.post("/apply", (req, res) => {
    if (req.session.email) {
        //Cuerpo del correo
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
        //Envio del correo
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
