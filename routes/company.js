const express = require("express");
const app = express();
const Company = require("../models/company.js"); //Importa el Schema de la compañia
var User = require("../models/user.js");
const Job = require("../models/job.js"); //Importa el Schema de los trabajos
const cookieSession = require('cookie-session'); //Define una sesion que utiliza cookies
const nodemailer = require('nodemailer'); //Define el uso de nodemailer para el uso de envio de correos
//Define la sesion de cookie
app.use(cookieSession({
    name: 'session', //Define el nombre de la sesion
    keys: ['key_1', 'key_2'],
    maxAge: 24 * 60 * 60 * 1000 //Define el tiempo maximo que tendra activa la cookie dentro del navegador
}));
//Para enviar los correos a los usuarios
const transporter = nodemailer.createTransport({
    service: "Hotmail",
    auth: {
        user: "elfarolitouaa@hotmail.com", //Correo del remitente
        pass: "UAAisc2314"
    }
});


var rand, host, link, mailOptions;
//Creacion de cuenta de la compañia
app.post("/signup-company", (req, res) => {
    User.findOne({ //busca en la base de datos...
        email: req.body.email //la existencia del correo
    }, (err, userdb) => {
        if (err) { //En caso de no encontrar
            return res.status(500).json({
                ok: false, //Se envia un error
                err
            });
        }
        if (!userdb) { //Si no existe el usuario
            const newCompany = new Company({ //Se crea uno nuevo
              //Datos recuperados del front
                name: req.body.name,
                companyName: req.body.companyName,
                rfc: req.body.rfc,
                email: req.body.email,
                telephone: req.body.telephone,
                sat: req.body.sat,
                password: req.body.password,
                validated: false,
                type: "company"
            });
            newCompany.save((err, companydb) => { //Guarda la cuenta de empresa
                if (err) {
                    return res.status(500).json({ //Envio de error
                        ok: false,
                        err
                    });
                }
                //Creacion del link para la validacion de cuenta
                rand = Math.floor((Math.random() * 100) + 54);
                host = req.get('host');
                link = "http://" + req.get('host') + "/verify-company?id=" + rand; //Genera un link para la verificacion
                //Y se crea el correo
                mailOptions = {
                    from: 'El Farolito',
                    to: companydb.email,
                    subject: "Por favor confirma tu correo electrónico",
                    html: "Gracias por registrar tu empresa en el farolito," +
                        "<br> " +
                        "Por favor verifica tu cuenta." +
                        "<br>" +
                        "<a href=" + link + ">Click aqui para verificar</a>"
                };
                //Para enviarlo con el siguiente codigo
                transporter.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        console.log(error);
                        res.end("error");
                    } else {
                        res.end("sent");
                    }
                });

                res.status(201).json({ //Envia un estado de creacion exitosa
                    ok: true,
                    companydb
                });
            });
        } else {
            return res.status(400).json({ //En caso de existir el correo envia un error
                ok: false,
                msg: "El correo electrónico ya existe en nuestro sistema."
            });
        }
    });
});
//Verificacion de la empresa
app.get('/verify-company', function (req, res) {
    console.log(req.protocol + ":/" + req.get('host'));
    Company.findOneAndUpdate({ //Funcion para buscar y actualizar en la base de datos
        email: mailOptions.to
    }, {
        validated: true //Actualiza el estado de validacion en la base de datos
    }, (err, userdb) => {
        if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) { //Si el dominio el correcto
            console.log("Domain is matched. Information is from Authentic email");
            if (req.query.id == rand) {
                console.log("email is verified"); //valida la cuenta y muestra el html
                res.end("<h5>El correo " + mailOptions.to + " fue verificado exitosamente</h5>");
            } else {
                console.log("email is not verified"); //En caso de existir error, muestra un htlm distinto
                res.end("<h5>Hubo un problema al verificar o el correo ya esta verificado</h5>");
            }
        } else { //en caso de que el correo provenga de otra fuente
            res.end("<h5>Request is from unknown source</h5>");
        }
    });
});
//Funcion para comprobar que la empresa se haya validado
app.post("/company-validated", (req, res) => {
    Company.findOne({ //Busca en la base de datos
        email: req.body.email
    }, (err, companydb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!companydb) {
            return res.status(400).json({ //En caso de no encontrar el correo registrado
                ok: false,
                msg: "Empresa no encontrada" //Muestra error
            });
        }
        res.json({
            validated: companydb.validated //Si encuentra guarda el valor del estatus de la validacion
        });
    });
});
//Funcion para subir un trabajo nuevo
app.post("/job-upload", (req, res) => {
    if (req.session.email) { //Busca en la base de datos el correo de la sesion de la empresa
        Company.findOne({
            email: req.session.email,
        }, (err, companydb) => {
            if (err) {
                return res.status(500).json({ //Muestra error en caso de no encontrar ninguna sesion activa
                    ok: false,
                    err
                });
            }
            //Creacion de un nuevo trabajo
            const newJob = new Job({
              //Elementos recuperados del front
                companyName: companydb.companyName,
                email: companydb.email,
                projectName: req.body.projectName,
                category: req.body.category,
                charge: req.body.charge,
                country: req.body.country,
                state: req.body.state,
                salary: req.body.salary,
                requirements: req.body.requirements,
                description: req.body.description
            });
            newJob.save((err, jobdb) => { //Guarda los datos en la base
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                res.status(201).json({
                    ok: true,
                    jobdb,
                    companydb //Asociando una compañia
                });
            });
        });
    }
});
//Funcion para mostrar un trabajo segun la compañia
app.get("/job", (req, res) => {
    if (req.session.email) { //Verifica el inicio de sesion
        Company.findOne({ //Busca en la base de datos
            email: req.session.email
        }, (err, companydb) => {
            Job.find({ //Busca en la base de datos los trabajos asociados con...
                companyName: companydb.companyName //...el nombre de la empresa
            }, (err, jobdb) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                if (jobdb.length <= 0) { //Validacion de que exista un trabajo con dicha empresa
                    return res.status(400).json({
                        ok: false
                    });
                }
                res.status(200).json({ //Envia los datos asociados con la empresa
                    ok: true,
                    job: jobdb
                });
            });
        });
    }
});
//Funcion para mostrar varios trabajos
app.get("/jobs", (req, res) => {
    Job.find({}, (err, jobdb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (jobdb.length <= 0) {
            return res.status(400).json({
                ok: false
            });
        }
        res.status(200).json({
            ok: true,
            job: jobdb
        });
    });
});

app.post("/req-job", (req, res) => {
    Job.findOne({
        _id: req.body.id
    }, (err, jobdb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(200).json({
            ok: true,
            job: jobdb
        });
    });
});

//Funcion para eliminar a la empresa
app.get("/delete-company", (req, res) => {
    if (req.session.email) {
        Company.findOneAndDelete({ //Busca en la base de datos y elimina...
            email: req.session.email //...la cuenta con sesion inicada
        }, (err, companydb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Job.deleteMany({ //Elimina los trabajos asociados con la empresa
                companyName: companydb.companyName
            }, (err, jobdb) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                if (!jobdb) { //En caso de no encontrar ningun trabajo asociado muestra un mensaje
                    req.session = null;
                    return res.json({
                        ok: true,
                        msg: "La cuenta no tenia vacantes de trabajo"
                    });
                }

                req.session = null;
                return res.json({
                    ok: true,
                    message: "Cuenta eliminada",
                    companydb
                });
            });
        });
    } else {
        res.status(404).json({ //En caso de no tener sesion iniciada envia un error
            message: "No existe sesion como compañia"
        });
    }
});
//Funcion para borrar un trabajo
app.post("/delete-job", (req, res) => {
    if (req.session.email) {
        Company.findOne({ //Busca en la base de datos
            email: req.session.email || null,
        }, (err, companydb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Job.findOneAndRemove({ //Elimina el trabajo con el nombre recuperado del front asociado con la cuenta de la empresa
                projectName: req.body.project.projectName,
                companyName: companydb.companyName
            }).exec(function (err, jobdb) {
                if (err) {
                    return res.status(500).json({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                res.status(200).json({ //Exito en eliminar trabajo
                    message: "Vacante de trabajo eliminada",
                    jobdb
                });
            });
        });
    } else {
        res.status(200).json({ //Sin sesion iniciada
            message: "No existe sesión como empresa",
        });
    }
});
//Cambios en un trabajo
app.post("/modify-job", (req, res) => {
    if (req.session.email) {
        Company.findOne({ //Busca en la base de datos
            email: req.session.email
        }, (err, companydb) => {
            if (err) {
                return res.status(500).json({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            Job.findOne({ //Busca el nombre del trabajo asociado con la empresa
                projectName: req.body.projectName.projectName,
                companyName: companydb.companyName
            }, (err, jobdb) => {
                if (!jobdb) {
                    return res.status(400).json({ //Mensaje de error
                        ok: false,
                        msg:"no existe",
                        pro: req.body.projectName
                    });
                }
                //Nuevos datos a guardar rescatados del front
                jobdb.projectName = req.body.newprojectName || jobdb.projectName;
                jobdb.category = req.body.category || jobdb.category;
                jobdb.charge = req.body.charge || jobdb.charge;
                jobdb.location = req.body.location || jobdb.location;
                jobdb.salary = req.body.salary || jobdb.salary;
                jobdb.requirements = req.body.requirements || jobdb.requirements;
                jobdb.description = req.body.description || jobdb.description;
                jobdb.save();
                res.status(200).json({
                    ok: true,
                    msg: "Vacante de trabajo actualizada"
                });
            });
        });
    } else {
        res.json({
            msg: "No existe sesion"
        });
    }
});
//Envio de correo al usuario
app.post("/quest",(req,res) => {
    if(req.session.email){
      //Cuerpo del correo
        mailOptions = {
            from: 'El Farolito',
            to: req.body.email,
            subject: "Una empresa esta interesada en ti",
            html:
                "<a href=" + req.body.joblink + ">Click aqui para ver la vacante de trabajo</a>" +
                "<br> " +
                "La empresa le gustaria que respondieras lo siguiente: <br>" + req.body.questions + "<br>" +
                "Puedes contactar a la empresa en este email: " + req.body.companyEmail

        };

        transporter.sendMail(mailOptions, function (error, info) { //Se envia el correo
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        return res.status(200).json({ //Exito
            ok: true,
            msg: "correo enviado"
        });
    }

    res.status(403).json({ //Fallo
        ok: false,
        msg: "Usuario sin sesion"
    });
});

module.exports = app;
