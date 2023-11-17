const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
var receivedMediaStream = null;

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
