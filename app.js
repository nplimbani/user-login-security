require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// 1. import useful packages(order is important)
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { use } = require("passport");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

// 2. set up/initialize a session
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));

// 3. initialize passport
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

// 4. make sure the schemas are mongoose.Schema() not the simple javascript objects
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// 5. enabling passport local mongoose schema
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

// 6. serialize and deserialize User model for session
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.route("/")
    .get(function(req, res){
        res.render("home");
    });

app.route("/login")
    .get(function(req, res){
        res.render("login");
    })
    .post(function(req, res){
        // 9. cookies handling for login page
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        // login() method from passport
        req.login(user, function(err){
            if(!err){
                passport.authenticate("local")(req, res, function(){
                    // use redirect
                    res.redirect("/secrets");
                });
            } else{
                console.log(err);
            }
        });
    });

// 8. loading secrets page while redirecting from register page after authentication
app.route("/secrets")
    .get(function(req, res){
        if(req.isAuthenticated()){
            res.render("secrets");
        } else{
            // when user closes the browser, server is restarted or cookies are deleted user will be redirected to login page
            res.redirect("/login");
        }
    });

app.route("/register")
    .get(function(req, res){
        res.render("register");
    })
    .post(function(req, res){
        // 7. handling cookies on register page
        User.register({username: req.body.username}, req.body.password, function(err, user){
            if(!err){
                passport.authenticate("local")(req, res, function(){
                    // use redirect
                    res.redirect("/secrets");
                });
            } else{
                console.log(err);
                res.redirect("/register");
            }
        });
    });

// 10. logout the session when user clicks on logout button
app.get("/logout", function(req, res){
    req.logout(function(err){
        if(!err){
            res.redirect("/");
        } else{
            console.log(err);
        }
    });
});

app.listen(3000, function(){
    console.log("Server is running on port 3000...");
});