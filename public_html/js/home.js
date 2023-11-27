const match = document.getElementById("match-select");
const profile = document.getElementById("profile-select");

function changeToProfile() {
    window.location.href = "/account/profile.html";
}

function changeToMatch() {
    window.location.href = "/app/matching.html";
}

match.onclick = changeToMatch;
profile.onclick = changeToProfile;