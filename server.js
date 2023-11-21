
const mongoose = require('mongoose');
const express = require('express')
const cookieParser = require('cookie-parser');
const app = express()

const hostname = "127.0.0.1";
//134.209.15.30
const port = 5000;

app.use(cookieParser());
app.use(express.json());

const db = mongoose.connection;
const mongoDBURL = 'mongodb+srv://jasondoe2:corsairian12@school.e7wiasx.mongodb.net/dating-app?retryWrites=true&w=majority';
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var userSchema = new mongoose.Schema({
    email: String,
    hash: String,
    salt: Number,
    settings: Array
});

var bioSchema = new mongoose.Schema({
    email: String,
    name: String,
    description: String,
    location: String,
    age: Number,
    height: Number,
    photo: String,
    photos: Array
});

var matchSchema = new mongoose.Schema({
    email: String,
    matches: Array,
});

var userModel = mongoose.model('users', userSchema);
var bioModel = mongoose.model('biography', bioSchema);
var matchModel = mongoose.model('matches', matchSchema);

app.use(express.static("public_html"));
app.use(express.static("./public_html/account", { index: 'login.html' }));

var sessions = {};
var mateSessions = {};

function createSession(email) {
    let sid = Math.floor(Math.random() * 1000000000);
    let now = Date.now();
    sessions[email] = { id: sid, time: now };
    console.log("Grabbing new ID: " + sid);
    return sid;
}

function removeSessions() {
    // This will remove a Cookie session after a certain amount of minutes.
    let now = Date.now();
    let emails = Object.keys(sessions);
    let minutes = 5;
    for (let i = 0; i < emails.length; i++) {
        let last = sessions[emails[i]].time;
        // Once it reaches 5 minutes, it will delete the session in the server array.
        if (last + 60000 * minutes < now) {
            delete sessions[emails[i]];
        }
    }
}

function generateSalt(password) {
    let salt = Math.floor(Math.random() * 1000000000);
    return password + salt;
}

setInterval(removeSessions, 2000);

function checkSession(req, res, next) {
    // This will authenticate and make sure you are login based on your cookie.
    // If you are not login, you will be redirected to the sign up or login page.
    let c = req.cookies;
    if (c != undefined) {
        console.log("Cookie exist");
        if (c.login != undefined) {
            if (sessions[c.login.email] != undefined &&
                sessions[c.login.email].id == c.login.sessionID) {
                next();
            } else {
                res.redirect('/app/homepage.html');
            }
        } else {
            res.redirect('/app/homepage.html');
        }
    } else {
        res.redirect('/app/homepage.html');
    }
}

app.post("/create/account", (req, res) => {
    // This creates an account and generates a salt and hash.

    console.log("Creating new account");

    let newEmail = req.body.email;
    let newPassword = req.body.password;

    let newSalt = generateSalt(newPassword);

    var hash = crypto.createHash('sha3-256');
    let data = hash.update(newSalt, 'utf-8');
    let newHash = data.digest('hex');

    var newUser = new userModel({
        email: newEmail,
        salt: newSalt,
        hash: newHash,
        settings: {}
    });

    var newBio = new bioModel({
        email: newEmail,
        name: null,
        description: null,
        location: null,
        age: null,
        height: null,
        photo: null,
        photos: {},
    });

    var newMatches = new matchModel({
        email: newEmail,
        matches: {},
    });

    newUser.save().then((doc) => {
        newBio.save();
        newMatches.save();
        res.end(true);
    }).catch((err) => {
        res.end(false);
    });
});

app.get("/login/:EMAIL/:PASSWORD", (req, res) => {
    // Login

    let attemptEmail = req.params.EMAIL;
    let attemptPassword = req.params.PASSWORD;

    db.collection("users").findOne({ email: attemptEmail }, function (err, doc) {
        if (doc) {
            let actualSalt = doc.salt;
            let combinedPassword = attemptPassword + actualSalt;

            var hash = crypto.createHash('sha3-256');
            let data = hash.update(combinedPassword, 'utf-8');
            let generatedHash = data.digest('hex');

            if (generatedHash == doc.hash) {
                createSession(attemptEmail);

                res.end(true);
            } else {
                // Password is incorrect
                res.end(false)
            }
        } else {
            // Email doesn't exist
            res.end(false);
        }
    });
});

app.get("/match/:CLIENT/:DATE/:STATUS", (req, res) => {
    var client = req.params.CLIENT;
    var date = req.params.DATE;
    var status = req.params.STATUS;

    mateSessions[client] = { date };

});

app.post("/edit/settings", (req, res) => {
    var searchedUser = req.body.email;
    var darkMode = req.body.dark;
    var hideLocation = req.body.location;

    db.collection("users").findOne({ email: searchedUser }, function (err, doc) {
        if (doc) {
            for (prop in doc.settings) {

            }
        }
    });
});

app.post("/edit/profile", (req, res) => {
    // Update profile
    // Redirect user to profile page
});

app.listen(port, () => {
    console.log(`http://${hostname}:${port}/`);
});
