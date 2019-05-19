var express = require("express");
const app = express();

var User = require("../models/user.js");
const cookieSession = require('cookie-session');
app.use(cookieSession({
    name: 'session',
    keys: ['key_1', 'key_2'],
    maxAge: 24 * 60 * 60 * 1000
}));
app.post("/signup", (req,res) => {
    const newUser = new User({
        name: req.body.name,
        user: req.body.user,
        email: req.body.email,
        password: req.body.password
    });
    newUser.save((err,userdb) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            userdb
        });
    });
});

app.post("/login", (req,res) => {
    User.findOne({
        user: req.body.user,
        password: req.body.password
    },(err,userdb) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!userdb){
            return res.status(404).json({
               ok:false,
                msg: "Error en usurio o contraseña"
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

app.get("/logout",(req,res)=>{
    if(req.session.email && req.session.user){
        req.session = null;
        return res.json({
           ok:true
        });
    }
    res.status(404).json({
       ok:false
    });
});


app.get("/is-log",(req,res)=>{
    console.log("bb");
    console.log(req.session.email);
    if(req.session.email && req.session.user){
        console.log(req.session.email,req.session.user);
        return res.json({

           ok:true
        });
    }
    res.status(401).json({
        ok:false
    });
});



module.exports = app;