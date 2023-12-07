/*
  Author: Jason Doe, Cooper Harris, Akli Amrous, Christopher Le
  File Name: getmatches.js
  Class: CSC 337

  This file handles the match page. It grabs a list of all of the current users on the website
  then it provide their information. The refresh button will update any
  new users that join the website. The client also pings the server to see
  if any other user have also liked their profile. If this happens, and the client
  had also selected the profile, then they are both redirected to the video.html page.
*/

const match_container = document.getElementById("profile-container");

const hostname = "joinlovemingle.xyz";
const port = 443;
const httpPort = 443;
const socket = io.connect(`https://${hostname}:${httpPort}/`, {secure: true});


/**
 * getRoomId will go to the server and ask which room the current user is. 
 * If the user is in a room, then they will join it and start the webcam code.
 * 
 * @param currentUser - currentUser is the client. 
 */
function getMatches(currentUser) {
    match_container.innerHTML = "";
    fetch(`/get/matches/${currentUser}`).then((result) => {
        if (result) {
            console.log("Waiting for result");
            result.json().then((data) => {
                console.log(data);
                let profile = "";

                if (Object.keys(data) == 0) {
                    profile += "<div class=\"user-header\">";
                    profile += "<h1>No users online!</h1>";
                    profile += "</div>";
                    match_container.innerHTML += profile;
                }
                for (matches in data) {
                    // Creates a profile blurb for each user on the website. 

                    let fullName = data[matches].name;
                    fullName = fullName.toString();
                    console.log(fullName);
                    console.log(fullName.split(" ").join(""));
                    profile += "<div class=\"user-header\">";
                    profile += `<h2 id="name">${data[matches].name.replace(/([A-Z][a-z])/g, ' $1').trim()}</h2>`;
                    profile += `<h4 id="age">Age: ${data[matches].age}</h4>`;
                    profile += `<h4 id="location">Location: ${data[matches].location}</h4>`;
                    profile += `<h4 id="height">Height: ${data[matches].height} </h4> </div>`
                    profile += `<div class="user-image">`;
                    profile += `<img src="https://brsc.sa.edu.au/wp-content/uploads/2018/09/placeholder-profile-sq.jpg" alt="profile pic">`;
                    profile += `</div>`;
                    profile += `<h3>About me: </h3>`;
                    profile += `<div id="bio">`;
                    profile += `${data[matches].bio}`;
                    profile += `<button id="like-profile" onclick = clickProfile('${fullName.split(" ").join("")}') type="button"> Select </button></a>`;

                    match_container.innerHTML += profile;
                }
            });


        } else {
            alert("Failed to load profile");
        }
    });
}

/**
 * clickProfile will fire when you click select on the profile blurb shown after 
 * pressing select.
 */
function clickProfile(person) {
 
    // You click on a profile

    console.log("You clicked a profile " + person);

    var getRoomUrl = `https://${hostname}:${port}/get/room/${person}`;
    var createRoomUrl = `https://${hostname}:${port}/create/room`;
    var joinRoomUrl = `https://${hostname}:${port}/join/room/`;
    
    // It checks to see if room exists
    fetch(getRoomUrl)
    .then((result) => result.text())
    .then((data) => {
        if (data == "true") {
            // Room does exist
            fetch(joinRoomUrl, {
                method: "POST",
                body: JSON.stringify(
                    {user: "CurrentUser", other: person}
                ),
                headers: {
                    "Content-Type": "application/json",    
                },
            })
            .then((result) => result.json())
            .then((data) => {
                console.log(data);
                if (data.response == true) {
                    console.log("Success!");
                    socket.emit('join-room', data.roomId, data.firstUser);
                    socket.emit('join-room', data.roomId, data.secondUser);

                } else {
                    console.log("Failed to connect");
                    
                }
            });
        } else {

            // Room does not exist
            fetch(createRoomUrl, 
                {
                    method: "POST",
                    body: JSON.stringify(
                        {user: "CurrentUser", other: person}
                    ),
                    headers: {
                        "Content-Type": "application/json",    
                    },
                }
            )
            .then((result) => result.text())
            .then((data) => {
                console.log("Waiting for other user");
                // You are the first so you have to wait until the other accepts
            });

        }
    });

}

/**
 * checkRoomStatus will see if you are in a room on the server.
 * If you are in a room, you are redirected to the video.html page.
 */
function checkRoomStatus() {
    var getRoomStatus = `https://${hostname}:${port}/get/roomStatus/${"CurrentUser"}`;

    console.log("Checking if you need to be redirected");

    fetch(getRoomStatus)
    .then((result) => result.text())
    .then((data) => {
        console.log(data);
        if (data == "true") {
            window.location.href = '../app/video.html';
        }
    }).catch((err) => {
        console.log(err);
    });
}

setInterval(checkRoomStatus, 3000);
