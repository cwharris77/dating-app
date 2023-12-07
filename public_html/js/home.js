/*
  Author: Jason Doe, Cooper Harris, Akli Amrous, Christopher Le
  File Name: home.js
  Class: CSC 337

  This file changes the location of the window to profile or match page based on the button.
*/

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