const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const webcamButton = document.getElementById("turnOn");
const endWebcamButton = document.getElementById("turnOff");


var receivedMediaStream = null;

function startCam() {
    let video = webcamElement;
    let mediaDevices = navigator.mediaDevices;
    video.muted = true;

    mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {

        // Changing the source of video to current stream.
        video.srcObject = stream;
        const mediaSource = new MediaSource();
        receivedMediaStream = stream;

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

webcamButton.onclick = startCam;
endWebcamButton.onclick = endCam;

