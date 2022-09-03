const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = {
    email: String,
    password: String
};

const User = new mongoose.model("User", userSchema);

app.route("/")
    .get(function(req, res){
        res.render("home");
    });

app.route("/login")
    .get(function(req, res){
        res.render("login");
    })
    .post(function(req, res){
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({email: username}, function(err, user){
            if(!err){
                if(user){
                    if(user.password === password){
                        res.render("secrets");
                    }
                }
            } else{
                console.log(err);
            }
        });
    });

app.route("/register")
    .get(function(req, res){
        res.render("register");
    })
    .post(function(req, res){
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });

        newUser.save(function(err){
            if(!err){
                console.log("User registered successfully.");
                res.render("secrets");
            } else{
                console.log(err);
            }
        });
    });

app.listen(3000, function(){
    console.log("Server is running on port 3000...");
});