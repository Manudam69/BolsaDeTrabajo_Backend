const express = require("express");
const app = express();
const Company = require("../models/company.js");
const Job = require("../models/job.js");
const cookieSession = require('cookie-session');
const randomstring = require("randomstring");
const nodemailer = require('nodemailer');

app.use(cookieSession({
    name: 'session',
    keys: ['key_1', 'key_2'],
    maxAge: 24 * 60 * 60 * 1000
}));

const transporter = nodemailer.createTransport({
    service: "Hotmail",
    auth: {
        user: "elfarolitouaa@hotmail.com",
        pass: "UAAisc2314"
    }
});

var rand, host, link, mailOptions;

app.post("/signup-company", (req, res) => {
    const newCompany = new Company({
        name: req.body.name,
        companyName: req.body.companyName,
        rfc: req.body.rfc,
        email: req.body.email,
        telephone: req.body.telephone,
        sat: req.body.sat,
        password: randomstring.generate(15),
        validated: false
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
                "<a href=" + link + ">Click aqui para verificar</a>"+
                "<br> " +
                "<p>La contraseña es: </p>" + companydb.password
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

app.post("/login-company", (req, res) => {
    Company.findOne({
        email: req.body.email,
        password: req.body.password
    }, (err, companydb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!companydb) {
            return res.status(404).json({
                ok: false,
                msg: "Error en correo o contraseña"
            });
        }
        req.session.email = companydb.email;
        req.session.password = companydb.password;

        res.json({
            ok: true,
            companydb,

        });
    });
});

app.get("/logout-company",(req,res)=>{
    if(req.session.email && req.session.password){
        req.session = null;
        return res.json({
           ok:true
        });
    }
    res.status(404).json({
       ok:false
    });
});

app.post("/job", (req, res) => {
    if (req.session.email && req.session.password) {
        Company.findOne({ email: req.session.email,password:req.session.password
        },(err,companydb) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
        const newJob = new Job({
            companyName: companydb.companyName,
            projectName: req.body.projectName,
            category: req.body.category,
            charge: req.body.charge,
            location: req.body.location,
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

app.get("/delete-company",(req,res) => {
  if(req.session.email && req.session.password){
      Company.findOneAndDelete({
          email: req.session.email,
          password: req.session.password
        }, (err, companydb) => {
          if (err) {
              return res.status(500).json({
                  ok: false,
                  err
              });
          }
          Job.deleteMany({
              companyName: companydb.companyName
          },(err,jobdb) =>{
              if (err) {
                  return res.status(500).json({
                      ok: false,
                      err
                  });
              }
              if(!jobdb){
                  req.session = null;
                  return res.json({
                      ok:true,
                      msg: "La cuenta no tenia vacantes de trabajo"
                  });
              }

              req.session = null;
              return res.json({
                  ok:true,
                  message: "Cuenta eliminada",
                  companydb
              });
          });
      });
  }else{
      res.status(404).json({
          message: "No existe sesion como compañia"
      });
  }
});

app.get("/whoami",(req,res) => {
    if(req.session.email && req.session.password){
      Company.findOne({
        email: req.session.email,
        password:req.session.password
      },(err,companydb) =>{
        res.json({
          companydb
        });
      });
    }else{
    res.status(404).json({
        msg:"No tienes sesión como empresa"
    });
    }
});

app.post("/delete-job",(req,res) =>{
  if(req.session.email && req.session.password){
    Company.findOne({
      email:req.session.email,
      password:req.session.password
    },(err,companydb) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        Job.findOneAndRemove({
          projectName:req.body.projectName,
          companyName:companydb.companyName
        }).exec(function(err, jobdb) {
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
  }else{
      res.status(200).json({
          message: "No existe sesión como empresa",
      });
  }
});

app.post("/modify-job",(req,res) => {
    if(req.session.email && req.session.password){
        Company.findOne({
            email: req.session.email
        },(err,companydb) => {
            if (err) {
                return res.status(500).json({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            Job.findOne({
                projectName: req.body.projectName,
                companyName: companydb.companyName
            },(err,jobdb) => {
                if(!jobdb){
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
                    msg:"Vacante de trabajo actualizada"
                });
            });
        });
    }else{
        res.json({
            msg:"No existe sesion"
        });
    }
});

module.exports = app;
