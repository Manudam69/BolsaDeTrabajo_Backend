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

app.post("/signup-company", (req, res) => {
    const newCompany = new Company({
        name: req.body.name,
        companyName: req.body.companyName,
        cuit: req.body.cuit,
        email: req.body.email,
        telephone: req.body.telephone,
        sat: req.body.sat,
        password: randomstring.generate(15)
    });
    newCompany.save((err, companydb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        const transporter = nodemailer.createTransport({
            service: 'Hotmail',
            auth: {
                user: 'elfarolitouaa@hotmail.com',
                pass: 'UAAisc2314'
            }
        });

        const mailOptions = {
            from: 'El Farolito',
            to: companydb.email,
            subject: 'Gracias por registrarte en el farolito.com',
            text: 'Tu contraseña es ' + companydb.password
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(201).json({
            ok: true,
            companydb
        });
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
        Company.findOne({
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
                jobdb
            });
        });
        });
    }
});

app.get("/delete-company",(req,res) => {
  if(req.session.email && req.session.password){
    Company.findOneAndRemove(req.session.email)
    .exec(function(err, companydb) {
      if (err) {
        return res.status(500).json({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        request.session = null;
        return res.status(200).json({
          message: "Compañia eliminada",
          companydb
        });
      }
    });
  }else{
    return res.status(404).json({
      message: "No existe sesion"
    });
  }
});

app.get("/delete-job",(req,res) =>{
  if(req.session.email && req.session.password){
    Company.findOne({
    },(err,companydb) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
    Job.findByIdAndRemove(req.body.id, (err, todo) => {
    if (err) return res.status(500).send(err);
    const response = {
        message: "Todo successfully deleted",
        id: req.body.id
    };
    return res.status(200).send(response);
});
    });
  }
});

module.exports = app;
