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
        user: "elfarolitouaa@hotmail.com",
        pass: "UAAisc2314"
    }
});

var rand, host, link, mailOptions;

app.post("/signup-company", (req, res) => {
    User.findOne({
        email: req.body.email
    }, (err, userdb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!userdb) {
            const newCompany = new Company({
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
            newCompany.save((err, companydb) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                rand = Math.floor((Math.random() * 100) + 54);
                host = req.get('host');
                link = "http://" + req.get('host') + "/verify-company?id=" + rand;

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
                    companydb
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

app.get('/verify-company', function (req, res) {
    console.log(req.protocol + ":/" + req.get('host'));
    Company.findOneAndUpdate({
        email: mailOptions.to
    }, {
        validated: true
    }, (err, userdb) => {
        if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
            console.log("Domain is matched. Information is from Authentic email");
            if (req.query.id == rand) {
                console.log("email is verified");
                res.end("<h5>El correo " + mailOptions.to + " fue verificado exitosamente</h5>");
            } else {
                console.log("email is not verified");
                res.end("<h5>Hubo un problema al verificar o el correo ya esta verificado</h5>");
            }
        } else {
            res.end("<h5>Request is from unknown source</h5>");
        }
    });
});

app.post("/company-validated", (req, res) => {
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
            return res.status(400).json({
                ok: false,
                msg: "Empresa no encontrado"
            });
        }
        res.json({
            validated: companydb.validated
        });
    });
});

app.post("/job-upload", (req, res) => {
    if (req.session.email) {
        Company.findOne({
            email: req.session.email,
        }, (err, companydb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            const newJob = new Job({
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
            newJob.save((err, jobdb) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                res.status(201).json({
                    ok: true,
                    jobdb,
                    companydb
                });
            });
        });
    }
});

app.get("/job", (req, res) => {
    if (req.session.email) {
        Company.findOne({
            email: req.session.email
        }, (err, companydb) => {
            Job.find({
                companyName: companydb.companyName
            },(err,jobdb) => {
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
    }
});

app.get("/jobs",(req,res) =>{
  Job.find({
  },(err,jobdb) => {
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

app.post("/req-job",(req,res) =>{
    Job.findOne({
        _id: req.body.id
    },(err,jobdb) => {
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


app.get("/delete-company", (req, res) => {
    if (req.session.email) {
        Company.findOneAndDelete({
            email: req.session.email
        }, (err, companydb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Job.deleteMany({
                companyName: companydb.companyName
            }, (err, jobdb) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                if (!jobdb) {
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
        res.status(404).json({
            message: "No existe sesion como compañia"
        });
    }
});

app.post("/delete-job", (req, res) => {
    if (req.session.email) {
        Company.findOne({
            email: req.session.email,
        }, (err, companydb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Job.findOneAndRemove({
                projectName: req.body.projectName,
                companyName: companydb.companyName
            }).exec(function (err, jobdb) {
                if (err) {
                    return res.status(500).json({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                res.status(200).json({
                    message: "Vacante de trabajo eliminada",
                    jobdb
                });
            });
        });
    } else {
        res.status(200).json({
            message: "No existe sesión como empresa",
        });
    }
});

app.post("/modify-job", (req, res) => {
    if (req.session.email) {
        Company.findOne({
            email: req.session.email
        }, (err, companydb) => {
            if (err) {
                return res.status(500).json({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            Job.findOne({
                projectName: req.body.projectName,
                companyName: companydb.companyName
            }, (err, jobdb) => {
                if (!jobdb) {
                    return res.status(400).json({
                        ok: false
                    });
                }

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

module.exports = app;
