const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
var receivedMediaStream = null;

<<<<<<< Updated upstream
function startCam() {
    let video = webcamElement;
    let mediaDevices = navigator.mediaDevices;
    video.muted = false;

    mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
=======
//const hostname = "134.209.15.30";
const hostname = "joinlovemingle.xyz";
//const port = 3001;
const port = 443;

const socket = io.connect(`https://${hostname}:${port}/`, {secure: true});
const peerConnection = new Peer();
>>>>>>> Stashed changes

        // Changing the source of video to current stream.
        video.srcObject = stream;
        const mediaSource = new MediaSource();
        receivedMediaStream = stream;

<<<<<<< Updated upstream
        video.addEventListener("loadedmetadata", () => {
                video.play();
        });
    });
}

function endCam() {
    receivedMediaStream.getTracks().forEach(mediaTrack => { 
        mediaTrack.stop(); 
    }); 
}

startCam();
=======
function getRoomId() {
   var url = `https://${hostname}:${port}/getRoomId`;

   fetch(url)
   .then((result) => result.json())
   .then((data) => {
      console.log("Response data");
      console.log(data);
      if (data.roomId != null && data.roomId != 0) {
         roomId = parseFloat(data);

         peerConnection.on('open', id => {
            socket.emit('join-room', roomId, id);
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
      }
   });
}

getRoomId();
>>>>>>> Stashed changes
