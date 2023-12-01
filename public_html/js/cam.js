const localElement = document.getElementById('local');
const remoteElement = document.getElementById('remote');
const webcamButton = document.getElementById("turnOn");
const endWebcamButton = document.getElementById("turnOff");

const hostname = "127.0.0.1";
const port = 3000;

const socket = io.connect('http://127.0.0.1:3001/');
const peerConnection = new Peer();

peerConnection.on('open', id => {
   socket.emit('join-room', 1, id);
});

socket.on('user-disconnected', userId => {
   console.log(userId + " has left the channel!");
});

var receivedMediaStream = null;
var currentStream = null;

localElement.muted = true

function addVideoStream(video, stream) {
   // This plays a video onto the laptop
   video.srcObject = stream;
   video.addEventListener('loadedmetadata', () => {
      video.play();
   })
   currentStream = stream;

   console.log("Done with making stream");
}



function startCall() {

   console.log("Pressed!");
  
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

function hangUp() {
   console.log("To be disconnected");
}


webcamButton.onclick = startCall;

startCall();