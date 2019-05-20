const express = require("express");
const app = express();
const Company = require("../models/company.js");
const cookieSession = require('cookie-session');
const randomstring = require("randomstring");
const nodemailer = require('nodemailer');


app.use(cookieSession({
    name: 'session',
    keys: ['key_1', 'key_2'],
    maxAge: 24 * 60 * 60 * 1000
}));

app.post("/signup-company", (req,res) => {
    const newCompany = new Company({
        name: req.body.name,
        companyName: req.body.companyName,
        cuit: req.body.cuit,
        email: req.body.email,
        telephone: req.body.telephone,
        sat: req.body.sat,
        password: randomstring.generate(15)
    });
    newCompany.save((err,companydb) => {
        if(err){
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

        transporter.sendMail(mailOptions, function(error, info){
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

app.post("/login-company", (req,res) => {
  Company.findOne({
      email: req.body.email,
      password: req.body.password
  },(err,companydb) => {
      if(err){
          return res.status(500).json({
              ok: false,
              err
          });
      }
      if(!companydb){
          return res.status(404).json({
             ok:false,
              msg: "Error en correo o contraseña"
          });
      }
      req.session.email = companydb.email;
      req.session.user = companydb.user;

      res.json({
         ok: true,
          companydb,

      });
  });
});

module.exports = app;
