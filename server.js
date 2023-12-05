const mongoose = require('mongoose');
const express = require('express')
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const https = require('https');
const fs = require(`fs`);
const app = express()

<<<<<<< Updated upstream
const hostname = "127.0.0.1";
const minute = 5;

//134.209.15.30
const port = 5000;
=======

var testmode = false;

const hostname = "134.209.15.30";
const minute = 10;

const certDir = `/etc/letsencrypt/live`;
const domain = `joinlovemingle.xyz`;
const options = {
  key: fs.readFileSync(`${certDir}/${domain}/privkey.pem`),
  cert: fs.readFileSync(`${certDir}/${domain}/fullchain.pem`)
};

//


const port = 80;
const httpPort = 3001;

const newHttpsServer = https.createServer(options, app).listen(443);
const io = require("socket.io")(newHttpsServer);



///443


io.on('connection',function(socket){
    socket.on('join-room', (roomId, user) => {
        console.log(user + " has joined Room " + roomId );
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', user);
    });
});

/*httpServer.listen(httpPort, function() {
    console.log("Booting up socket server");
});*/



>>>>>>> Stashed changes

app.use(cookieParser());
app.use(express.json());

app.use(express.static(__dirname + '/static', { dotfiles: 'allow' }))

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
    for (let i = 0; i < emails.length; i++) {
        let last = sessions[emails[i]].time;
        // Once it reaches 5 minutes, it will delete the session in the server array.
        if (last + 60000 * minute < now) {
            delete sessions[emails[i]];
        }
    }
}

function generateSalt(password) {
    let salt = Math.floor(Math.random() * 1000000000);
    return salt;
}

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
                res.redirect('/account/login.html');
            }
        } else {
            res.redirect('/account/login.html');
        }
    } else {
        res.redirect('/account/login.html');
    }
}

setInterval(removeSessions, 2000);


/*app.use("/app/homepage.html", checkSession);
app.use("/account/profile.html", checkSession);
app.use("/account/settings.html", checkSession);
app.use("/account/editprofile.html", checkSession);
app.use("/app/matching.html", checkSession);
app.use("/app/video.html", checkSession);*/

app.post("/create/account", (req, res) => {
    // This creates an account and generates a salt and hash.
    let newEmail = req.body.email;
    let newPassword = req.body.password;

    db.collection("users").findOne({ email: newEmail }, function (err, doc) {
        if (!doc) {
            console.log("Creating new account");

            console.log(newEmail);
            console.log(newPassword);

            let newSalt = generateSalt(newPassword);

            var hash = crypto.createHash('sha3-256');
            var combinedPassword = newPassword + newSalt.toString();
            console.log(combinedPassword);
            
            var saltAndPass = combinedPassword;
            let data = hash.update(saltAndPass, 'utf-8');
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
                console.log(doc);
                newBio.save().then((doc) => {
                    console.log(doc);
                    newMatches.save().then((doc) => {
                        console.log(doc);
                        let sid = createSession(newEmail);
                        res.cookie("login", 
                        {email: newEmail, sessionID: sid}, 
                        {maxAge: 60000 * minute}); // 60000 is 1 minute
                        res.end("true");
                    });
                    
                });
                
            }).catch((err) => {
                console.log("Error!");
                console.log(err);
                res.end("false");
            });
        } else {
            res.end("already exist");
        }
    });
    
});

<<<<<<< Updated upstream
app.get("/get/user/:EMAIL", (req, res) => {
    let c = req.cookies;
    let usedEmail = c.login.email;

    if (req.params.EMAIL != "CurrentUser") {
        console.log("Current client");
        usedEmail = req.params.EMAIL;
    }

    console.log("Looking for user");
    
    db.collection("biographies").findOne({email: usedEmail}, function (err, doc) {
        if (doc) {

            console.log("Data was found");

            let data = {
                name: doc.name,
                age: doc.age,
                height: doc.height,
                bio: doc.description,
                location: doc.location,
            }

            console.log("Sending data");

            console.log(JSON.stringify(data));
            res.end(JSON.stringify(data));
        } else {
            res.end(false);
        }
    });
    
});

app.get("/login/:EMAIL/:PASSWORD", (req, res) => {
    // Login

    let attemptEmail = req.params.EMAIL;
    let attemptPassword = req.params.PASSWORD;

    

    db.collection("users").findOne({ email: attemptEmail }, function (err, doc) {
        if (doc) {

            console.log("Found account");

            let actualSalt = doc.salt;
            let combinedPassword = attemptPassword + actualSalt;

            console.log(combinedPassword);

            var hash = crypto.createHash('sha3-256');
            let data = hash.update(combinedPassword, 'utf-8');
            let generatedHash = data.digest('hex');

            console.log(generatedHash);
            console.log(doc.hash);

            if (generatedHash == doc.hash) {
                let sid = createSession(attemptEmail);
                res.cookie("login", 
                {email: attemptEmail, sessionID: sid}, 
                {maxAge: 60000 * minute}); // 60000 is 1 minute
                res.end("true");
            } else {
                // Password is incorrect
                res.end("false")
            }
        } else {
            // Email doesn't exist
            res.end("false");
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
    
    let newName = req.body.name;
    let newAge = req.body.age;
    let newLocation = req.body.location;
    let newHeight = req.body.height;
    let newBio = req.body.bio;
    let newPhoto = req.body.photo;

    let c = req.cookies;

    let currentEmail = c.login;

    let updateDoc = db.collection("biographies").updateOne({email: c.login.email}, { $set: 
        {
            name: newName,
            age: newAge,
            location: newLocation,
            height: newHeight,
            description: newBio,
            photo: newPhoto,
        }
        
    });
    updateDoc.then((doc) => {
        // Success when updating

        if (doc) {
            console.log("Updated!");
            res.end("true");
        }
        
    }).catch((err) => {
        // Error while updating
        alert(err);
        res.end("false");
    });
    
           
            
     
});

app.listen(port, () => {
    console.log(`http://${hostname}:${port}/`);
});
=======
>>>>>>> Stashed changes
