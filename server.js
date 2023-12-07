/**
 * Server-Side JavaScript File
 * Handles server functionalities for a dating application.
 * Uses MongoDB for data storage, Express for server setup, and Socket.IO for real-time communication.
 *
 * Libraries:
 * - mongoose: MongoDB object modeling for Node.js
 * - express: Fast, unopinionated, minimalist web framework for Node.js
 * - cookie-parser: Parse Cookie header and populate req.cookies
 * - crypto: Cryptographic functionalities for secure operations
 * - body-parser: Parse incoming request bodies in a middleware before your handlers
 * - @sendgrid/mail: Twilio SendGrid's v3 Node.js Library for email functionalities
 * - socket.io: Real-time bidirectional event-based communication
 */

const mongoose = require('mongoose');
const express = require('express')
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const https = require('https');
const fs = require(`fs`);

const bodyParser = require('body-parser');

// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const https = require('https');
const fs = require(`fs`);

const app = express()
const hostname = "134.209.15.30";
const minute = 10;

const certDir = `/etc/letsencrypt/live`;
const domain = `joinlovemingle.xyz`;
const options = {
  key: fs.readFileSync(`${certDir}/${domain}/privkey.pem`),
  cert: fs.readFileSync(`${certDir}/${domain}/fullchain.pem`)
};


// Old ports were 3000 and 3001, current port is 80 and 443.
const port = 80;
const newHttpsServer = https.createServer(options, app).listen(443);
const io = require("socket.io")(newHttpsServer);

io.on('connection',function(socket){
    socket.on('join-room', (roomId, user) => {
        console.log(user + " has joined Room " + roomId );
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', user);
    });
});

app.use(cookieParser());
app.use(express.json());

app.use(express.static(__dirname + '/static', { dotfiles: 'allow' }))

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

const db = mongoose.connection;
const mongoDBURL = 'mongodb+srv://jasondoe2:corsairian12@school.e7wiasx.mongodb.net/dating-app?retryWrites=true&w=majority';
mongoose.connect(mongoDBURL, { useNewUrlParser: true });

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var userSchema = new mongoose.Schema({
    email: String,
    hash: String,
    salt: Number,
    settings: Array,
    otp: {type: Number,
          default: null
    }

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

/**
 * This creates a cookie session that stores info on the server. 
 * 
 * @param email - Takes in an email to be used for each session.
 */
function createSession(email) {
    let sid = Math.floor(Math.random() * 1000000000);
    let now = Date.now();
    sessions[email] = { id: sid, time: now };
    console.log("Grabbing new ID: " + sid);
    return sid;
}

/**
 * This removes a cookie session after a designated amount of minutes, currently at 10.
 * 
 */
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

/**
 * This creates a random salt for a password.
 * 
 */
function generateSalt() {
    let salt = Math.floor(Math.random() * 1000000000);
    return salt;
}

/**
 * This checks to see if you are currently signed in. If you are not, then
 * it is supposed to redirect you to the login page.
 * 
 * @param req - The request from the client.
 * @param res - The response from the server.
 * @param next - This takes you to the next route.
 */
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

/**
 * Creates an account and stores the information in MongoDB.
 * It checks if the accoutn already exist with the same email.
 * 
 * @param req - The request from the client.
 * @param res - The response from the server.
 */
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
                // Creates a session because you are logging in.
                newBio.save().then((doc) => {
                    newMatches.save().then((doc) => {
                        let sid = createSession(newEmail);
                        res.cookie("login",
                            { email: newEmail, sessionID: sid },
                            { maxAge: 60000 * minute }); // 60000 is 1 minute
                        res.end("true");
                    });

                });

            }).catch((err) => {
                console.log(err);
                res.end("false");
            });
        } else {
            res.end("already exist");
        }
    });

});



/**
 * Provides an user's information from MongoDB.
 * 
 * @param req - The request from the client.
 * @param res - The response from the server.
 */

app.get("/get/user/:EMAIL", (req, res) => {
    let c = req.cookies;
    let usedEmail = c.login.email;

    if (req.params.EMAIL != "CurrentUser") {
        console.log("Current client");
        usedEmail = req.params.EMAIL;
    }

    db.collection("biographies").findOne({ email: usedEmail }, function (err, doc) {
        if (doc) {
            let data = {
                name: doc.name,
                age: doc.age,
                height: convertInchesToFeet(doc.height),
                bio: doc.description,
                location: doc.location,
            }

            res.end(JSON.stringify(data));
        } else {
            res.end(false);
        }
    });

});

/**
 * Allow the client to login. It searches for an email based on the attempt email. 
 * If the email exist, then it uses the salt and attempt password to create
 * a potential password. If this matches with the hash of the account, then 
 * login will be successful.
 * 
 * @param req - The request from the client.
 * @param res - The response from the server.
 */
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

/**
 * A potential route for saving match sessions. Currently not being used in
 * the project.
 * 
 * @param req - The request from the client.
 * @param res - The response from the server.
 */
app.get("/match/:CLIENT/:DATE/:STATUS", (req, res) => {
    var client = req.params.CLIENT;
    var date = req.params.DATE;
    var status = req.params.STATUS;

    mateSessions[client] = { date };

});

/**
 * Grabs the current profile based on cookies, then get the settings of the user.
 * 
 * @param req - The request from the client.
 * @param res - The response from the server.
 */
app.get('/get/settings', (req, res) => {
    let c = req.cookies;
    
    db.collection("users").findOne({ email: c.login.email }, function (err, doc) {
        if (doc && doc.settings) {
            res.json(doc.settings);
        } else {
            res.status(404).json({ error: 'User settings not found' });
        }
    })
})

/**
 * Changes the settings array in the MongoDB user schema. 
 * 
 * @param req - The request from the client.
 * @param res - The response from the server.
 */
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
                $set: { settings: newSettings }
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

/**
 * Changes the profile and saves the changes to MongoDB.
 * 
 * @param req - The request from the client.
 * @param res - The response from the server.
 */
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
            res.end("true");
        }

    }).catch((err) => {
        // Error while updating
        alert(err);
        res.end("false");
    });

});

// New routes to create rooms

/**
 * A recursive function that calculates height based on inches. It adds 1 feet for every 12 inches.
 * 
 * @param number - The original number provided that is subtracted by 12.
 * @param trueHeight - The amount of feet.
 */
function convertInchesToFeet(number, trueHeight) {
    if (parseFloat(number) / 12 >= 1) {
        return convertInchesToFeet(parseFloat(number) - 12, trueHeight+1);
    } else {
        return "" + trueHeight + "." + number + " ft";
    }
}

/**
 * This will provide a list of current users on the website. It currently does
 * not have a selection bias at the moment.
 * 
 * @param req - The request from the client.
 * @param res - The response from the server.
 */
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
});

/**
 * Converts a name to an email, to be used for different routes.
 * 
 * @param name - The name of the user.
 */
function convertNameToEmail(name) {
    console.log("Getting users with: " + name);

    for (bio in users) {
        if (users[bio].name == name) {
            console.log("true");
            return bio;
        }
    }
}

/**
 * Creates a "room" that will be used to match users. It adds a room number
 * to account for more users.
 * 
 * @param req - The request from the client.
 * @param res - The response from the server.
 */
app.post('/create/room/', (req, res) => {
    console.log("Creating new room: ");
    let c = req.cookies;
    let user = c.login.email;

    if (rooms[roomNumbers] == null && users[user].roomId == 0) {
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

/**
 * Grabs the current room ID of the client.
 * 
 * @param req - The request from the client.
 * @param res - The response from the server.
 */
app.get('/getRoomId', (req, res) => {
    let c = req.cookies;
    let person = c.login.email;

    res.json({ roomId: users[person].roomId });
});

/**
 * Checks to see if the person the client likes is in the room. 
 * If they are, then the server responds with false. If they are not, then
 * the server responds with true. It adds matching preference to the client.
 * 
 * @param req - The request from the client.
 * @param res - The response from the server.
 */
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

/**
 * If both users have matching preference for the other, then it checks
 * to see if that has happened. If it did, then both clients will be
 * sent to the same room.
 * 
 * @param req - The request from the client.
 * @param res - The response from the server.
 */
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

/**
 * It checks if client should be redirected to the match page.
 * 
 * @param req - The request from the client.
 * @param res - The response from the server.
 */
app.get('/get/roomStatus/:user', (req, res) => {
    let c = req.cookies;
    let person = c.login.email;
    let currentRoomNumber = 0;
    for (entry in users) {
        if (entry == person) {
	        console.log("Passed the entry and person test: " + person);
            currentRoomNumber = users[entry].roomId; 
            for (entry in users) {
                console.log("Checking user: " + users[entry].name + " for " + person);
                console.log("Room number of user " + users[entry].name + " : " + users[entry].roomId);
                if (users[entry].roomId == currentRoomNumber && parseFloat(currentRoomNumber) == currentRoomNumber && users[entry].email != person && currentRoomNumber != 0) {
                    
                    // It changes to 0 so that if the clients do not like the other person, they can match with new clients.
                    setTimeout(()=> {
                        users[entry].roomId = 0;
                    }, 10000);
                        
                    /* It sends a ping after a couple of seconds to give a buffer
                    ** for both clients to connect.
                    */
                    setTimeout(()=> {
                        if (users[entry].roomId != 0) {
                            res.end("true");    
                        }
                            
                    }, Math.floor(Math.random() * 5000));	  
                
                    return;
                }
            }
        }
    }
    
    res.end("false");
    
});

/**
 * Reset Password Route
 * Sends a verification email with a one-time passcode (OTP) for password reset.
 */
app.post('/account/request-reset-password', (req, res) => {
    const userEmail = req.body["email-address"];

    const otp = generateOTP(8); // Generate a 8-digit OTP

    const msg = {
      to: `${userEmail}`, // recipient
      from: 'loveminglehelp@gmail.com', 
      subject: 'Reset Your Password',
      text: 'Your 8 Digit OTP',
      html: `<h2>${otp}</h2>`,
    }

    sgMail
      .send(msg)
      .then(() => {
        let user = db.collection("users").findOne({email: userEmail}, function(err, doc) {
            if (doc) {
                console.log(doc.otp)
                console.log(typeof(otp))

                let updateDoc = db.collection("users").updateOne({ email: userEmail }, {
                $set:
                {
                    otp: otp,
                }
            });

            updateDoc.then((doc) => {
                // Success when updating
                if (doc) {
                    console.log("Updated otp!");
                }
            });

                // Redirect with the encrypted email in the URL
                res.redirect(`/account/otp.html?email=${encodeURIComponent(userEmail)}&retry=false`);
            } else {
                res.send("No user with that email found")
            }
        });
      })
      .catch((error) => {
        console.error(error)
      })
});

/**
 * Verify OTP Route
 * Verifies the entered OTP during the password reset process.
 */
app.post('/account/verify-otp', (req, res) => {
    let otp_string = ""
    let otp;
    let user = req.body["email"]

    for (let input in req.body) {
        if (input != "email") {
            otp_string += req.body[input]
        }
    }

    otp = parseInt(otp_string)
    verifyOTP(otp, user)
        .then((verified) => {
            console.log(verified)
            if (verified) {
                res.redirect(`/account/resetpassword.html?email=${encodeURIComponent(user)}`)
            } else {
                res.redirect(`/account/otp.html?email=${encodeURIComponent(user)}&retry=true`)
            }
        })
        .catch((err) => {
            console.log(err)
        });
})

app.post('/account/reset-password', (req, res) => {
    let user = "" + req.body.email
    let newPass = "" + req.body.newPass
    let confirmPass = "" + req.body.confirmPass

    if (newPass !== confirmPass) {
        res.json({message: "matching issue"})
    } else {
        let newSalt = generateSalt(newPass);

        var hash = crypto.createHash('sha3-256');
        var combinedPassword = newPass + newSalt.toString();

        var saltAndPass = combinedPassword;
        let data = hash.update(saltAndPass, 'utf-8');
        let newHash = data.digest('hex');

        let updateDoc = db.collection("users").updateOne({ email: user }, {
        $set:
        {   
            salt: newSalt,
            hash: newHash 
        }

        });
        updateDoc.then((doc) => {
            // Success when updating
            if (doc) {
                console.log("Updated!");
                res.json({message: "Password updated successfully!"});
            }
        }).catch((err) => {
            // Error while updating
            res.json({message: "Error updating"});
        });
    }

})

/**
 * Generate Random Integer from Digits
 * Generates a random integer by concatenating random digits from 0 to 9.
 *
 * @param {number} length - The length of the generated integer (number of digits).
 * @returns {number} A random integer constructed from random digits.
 */
function generateOTP(length) {
    let randomIntegers = "";

    for (let i = 0; i < length; i++) {
        const randomInteger = Math.floor(Math.random() * 10); // A random digit from 0-9
        randomIntegers += randomInteger;
    }

    return parseInt(randomIntegers);
}

/**
 * Verify One-Time Passcode (OTP)
 * Verifies the entered OTP against the stored OTP for a user.
 *
 * @param {number} otp - The entered OTP.
 * @param {string} user - The user's email.
 * 
 * @return {bool}  - True if the entered otp equals the users generated otp
 */
async function verifyOTP(OTP, email) {
    let user = db.collection("users").findOne({email: email, otp: OTP}, function(err, doc) {
            if (doc) {
                return true
            } else {
                return false
            }
    });   

    return await user;
}


/**
 * An upload route for the use of getting photos from the client.
 * Unfortunately, we were unable to implement this in time.
 * 
 * @param req - The request from the client.
 * @param res - The response from the server.
 */
app.post('/upload', (req, res) => {

});

app.listen(port, () => {
    console.log(`http://${hostname}:${port}/`);
});
