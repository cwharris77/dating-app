/*
  Author: Jason Doe, Cooper Harris, Akli Amrous, Christopher Le
  File Name: cam.js
  Class: CSC 337

  This file handles the webcam feature of the website. It immediately boots up and
  creates a connection with a peer connection. Then, it waits for another client
  to join the socket room. 
*/

const localElement = document.getElementById('local');
const remoteElement = document.getElementById('remote');
const webcamButton = document.getElementById("turnOn");
const endWebcamButton = document.getElementById("turnOff");

const hostname = "joinlovemingle.xyz";
const port = 443;

const socket = io.connect(`https://${hostname}:${port}/`, {secure: true});
const peerConnection = new Peer();

var roomId = null;

/**
 * getRoomId will go to the server and ask which room the current user is. 
 * If the user is in a room, then they will join it and start the webcam code.
 */

function getRoomId() {
   var url = `https://${hostname}:${port}/getRoomId`;
   fetch(url)
   .then((result) => result.json())
   .then((data) => {
      console.log("Response data");
      console.log(data);
      if (data.roomId != null && data.roomId != 0) {
         roomId = data.roomId;

         peerConnection.on('open', id => {
            socket.emit('join-room', roomId, id);
         });
         
         socket.on('user-disconnected', userId => {
            console.log(userId + " has left the channel!");
         });
         
         var currentStream = null;
         
         localElement.muted = true
         
         /**
          * This will add a stream to a video HTML element.
          */
         function addVideoStream(video, stream) {
            // This plays a video onto the laptop
            video.srcObject = stream;
            video.addEventListener('loadedmetadata', () => {
               video.play();
            })
            currentStream = stream;
            console.log("Done with making stream");
         }
         
         /**
          * Start call will begin the process of starting the webcam for the client.
          */
         function startCall() { 
            navigator.mediaDevices.getUserMedia({
               video: true,
               audio: true
            }).then(stream => {
               addVideoStream(localElement, stream);
         
               console.log("Checking new status");
         
               peerConnection.on('call', call => {
                  console.log("Making call!");
                  // Once a call has been made, it answers by sending the stream.
                  call.answer(stream);
         
                  call.on('stream', otherUserVideoStream => {
                     console.log("Recieved call!");
                     addVideoStream(remoteElement, otherUserVideoStream);
                  });
               });
         
               socket.on('user-connected', userId => {
                  console.log('User has joined your channel: ' + userId);
                  connectToNewUser(userId, stream);
               });
               
            });
         }
         
         /**
          * This connects a different client's stream to the current client remote video HTML element.
          */
         function connectToNewUser(userId, stream) {
            // Sending this audio and stream to this specific user
            console.log("Making new call");
            const call = peerConnection.call(userId, stream);
            console.log(call);
            
            call.on('stream', otherUserVideoStream => {
               // This adds the recieved stream into the "remote "
               console.log("Adding new stream");
               addVideoStream(remoteElement, otherUserVideoStream);
            });
            call.on('close', () => {
               // This removes the video
               console.log("Removed from server");
            });
         }
         
         startCall();
      }
   });
}

getRoomId();
