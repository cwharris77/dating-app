
const mongoose = require('mongoose');
const express = require('express')
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express()

const hostname = "127.0.0.1";
const minute = 10;

//134.209.15.30
const port = 3000;
const httpPort = 3001;

const httpServer = require("http").Server(app);
const io = require("socket.io")(httpServer);

io.on('connection',function(socket){
    socket.on('join-room', (roomId, user) => {
        console.log(user + " has joined Room " + roomId );
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', user);
    });
});

httpServer.listen(httpPort, function(){
    console.log("Booting up socket server");
});


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

var matchHistorySchema = new mongoose.Schema({
    email: String,
    matches: Array,
});

var userModel = mongoose.model('users', userSchema);
var bioModel = mongoose.model('biography', bioSchema);
var matchModel = mongoose.model('matches', matchHistorySchema);

app.use(express.static("public_html"));
app.use(express.static("./public_html/account", { index: 'login.html' }));

var sessions = {};
var mateSessions = {};

var wantToMatch = {};
var rooms = {};
var users = {};
var roomNumbers = 1;

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


app.use("/app/homepage.html", checkSession);
app.use("/account/profile.html", checkSession);
app.use("/account/settings.html", checkSession);
app.use("/account/editprofile.html", checkSession);
app.use("/app/matching.html", checkSession);
app.use("/app/video.html", checkSession);

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
                            { email: newEmail, sessionID: sid },
                            { maxAge: 60000 * minute }); // 60000 is 1 minute
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





app.get("/get/user/:EMAIL", (req, res) => {
    let c = req.cookies;
    let usedEmail = c.login.email;

    if (req.params.EMAIL != "CurrentUser") {
        console.log("Current client");
        usedEmail = req.params.EMAIL;
    }

    console.log("Looking for user");

    db.collection("biographies").findOne({ email: usedEmail }, function (err, doc) {
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
                    { email: attemptEmail, sessionID: sid },
                    { maxAge: 60000 * minute }); // 60000 is 1 minute
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
    // Update settings
    let c = req.cookies;
    var newInterest = req.body.preference;
    var newNotificationSettings = req.body.notif;

    db.collection("users").findOne({ email: c.login.email }, function (err, doc) {
        if (doc) {
            let newSettings = {
                interest: newInterest,
                notification: newNotificationSettings
            };

            let updateDoc = db.collection("users").updateOne({ email: c.login.email }, {
                $set:
                {
                    settings: newSettings,
                }
            });
            updateDoc.then((doc) => {
                // Success when updating
                if (doc) {
                    console.log("Updated settings!");
                    res.end("true");
                }
            });

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

    let updateDoc = db.collection("biographies").updateOne({ email: c.login.email }, {
        $set:
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

// New routes to create rooms

function convertInchesToFeet(number, trueHeight) {
    if (parseFloat(number) / 12 >= 1) {
        return convertInchesToFeet(parseFloat(number) - 12, trueHeight+1);
    } else {
        return "" + trueHeight + "." + number + " ft";
    }
}
app.get("/get/matches/:USER", (req, res) => {

    let c = req.cookies;
    let usedEmail = c.login.email;

    if (req.params.USER != "CurrentUser") {
        usedEmail = req.params.USER;
    }

    db.collection("biographies").findOne({email: usedEmail}, function(err, doc) {
        if (doc) {
            users[usedEmail] = {
                name: doc.name.split(" ").join(""),
                email: usedEmail,
                location: doc.location,
                height: convertInchesToFeet(doc.height, 0),
                bio: doc.description,
                age: doc.age,
                roomId: 0,
            };

            let copyWithoutProfile = structuredClone(users);
            delete copyWithoutProfile[usedEmail];

            console.log(users);

            res.end(JSON.stringify(copyWithoutProfile));
        } else {
            console.log("No user?");
            res.end();
        }
    });

    /*(db.collection("matches").findOne({email: user}, function(err, doc) {
        if (doc) {
            res.json(doc.matches)
        }
        else {
            res.json([])
        }
    });*/
});

function convertNameToEmail(name) {
    console.log("Getting users with: " + name);

    for (bio in users) {
        if (users[bio].name == name) {
            console.log("true");
            return bio;
        }
    }
}

app.post('/create/room/', (req, res) => {
    console.log("Creating new room: ");
    let c = req.cookies;
    let user = c.login.email;
    let other = convertNameToEmail(req.body.other);
    
    if (rooms[roomNumbers] == null) {
        // Room doesn't exist with specific number
        users[user].roomId = roomNumbers;

        console.log("Setting user to room number");
        
        // Sets user to that room number
        
        roomNumbers++;

        console.log(wantToMatch);

        res.end("true");
    } else {
        res.end("false")
    }
    
});

app.get('/getRoomId', (req, res) => {
    let c = req.cookies;
    let person = c.login.email;

    res.end(JSON.stringify({ roomId: users[person].roomId }));
});

app.get('/get/room/:user', (req, res) => {
    console.log("Checking if user is in room");
    let c = req.cookies;
    let user = c.login.email;
    let other = convertNameToEmail(req.params.user);

    if (wantToMatch[user] != null) {
        wantToMatch[user].push(other);
    } else {
        wantToMatch[user] = [];
        wantToMatch[user].push(other);
    }

    if (users[other].roomId != 0) {
        res.end("true");
    } else {
        res.end("false");
    }
});

app.post('/join/room', (req, res) => {
    console.log("Finding out if you can join room");
    let other = convertNameToEmail(req.body.other);
    let c = req.cookies;
    let user = c.login.email;

    function grabCurrent(value) {
        return value == user && user != other;
    }

    if (wantToMatch[other].find(grabCurrent) ) {
        // Found other likes the user
        console.log("Other likes user, having both join the users");
        let currentRoomId = users[other].roomId;

        users[user].roomId = parseFloat(users[other].roomId);

        let endResponse = JSON.stringify({
            response: true, 
            roomId: currentRoomId, 
            firstUser: user, 
            secondUser: other
        });
        
        console.log(endResponse);
        res.end(endResponse);
    } else {
        
        res.end("false");
    }
});

app.get('/get/roomStatus/:user', (req, res) => {
    let c = req.cookies;
    let person = c.login.email;
    let currentRoomNumber = 0;

    for (entry in users) {
        if (entry == person) {
            currentRoomNumber = users[entry].roomId; 
                 
            for (entry in users) {
                if (users[entry].roomId == currentRoomNumber && parseFloat(currentRoomNumber) == currentRoomNumber && users[entry].email != person && currentRoomNumber != 0) {
                    users[entry].roomId = 0;
                    console.log(wantToMatch);
                    res.end("true");
                    return;
                }
            }
        }
    }
    
    res.end("false");
    
});

app.post('/upload', (req, res) => {

});

app.listen(port, () => {
    console.log(`http://${hostname}:${httpPort}/`);
});
