/*
  Author: Cooper Harris, Jason Doe, Akli Amrous, Christopher Le
  File Name: resetPassword.js
  Class: CSC 337

  This file is designed to handle user input and interactions related to the password reset process.
  It extracts parameters from the URL, sets up the UI based on these parameters, and includes functions to
  move focus between input fields, handle backspace navigation, and submit new password data via the fetch API.
  Additionally, it displays error messages and alerts users about password matching issues during the submission process.
*/

const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('email');
const retry = urlParams.get('retry')
const errorMessage = document.querySelector("h3");
const h1 = document.getElementById("enter-header")
const emailInput = document.getElementById("emailInput");

// Set header message if h1 element is present
if (h1) {
    h1.innerHTML = `Please enter the OTP sent to ${email}`
}

// Set email input value if emailInput element is present
if (emailInput) {
    emailInput.value = email;
}

// Toggle visibility of error message based on retry parameter
if (retry == true && errorMessage) {
    errorMessage.classList.add("hidden")
} else if (retry == false && errorMessage) {
    errorMessage.classList.remove("hidden")
}

// Move focus to the next input field when current input reaches maxlength
function moveToNextInput(currentInput, nextInputId) {
    const maxLength = parseInt(currentInput.getAttribute('maxlength'));
    const inputValue = currentInput.value;

    if (inputValue.length === maxLength) {
        const nextInput = document.getElementById(nextInputId);
        if (nextInput) {
            nextInput.focus();
        }
    }
}

// Move focus to the previous input field on backspace with empty input
function moveToPreviousInput(event, previousInputId) {
    const currentInput = event.target;
    const currentValue = currentInput.value;

    if (event.keyCode === 8 && currentValue.length === 0) {
        const previousInput = document.getElementById(previousInputId);
        if (previousInput) {
            previousInput.focus();
        }
    }
}

// Submit new password data via fetch API
function submitNewPassword(formData) {
    const data = {
        email: formData.get("email"),
        newPass: formData.get("new-password"),
        confirmPass: formData.get("confirm-password")
    }

    fetch('/account/reset-password', {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json', 
        },
    })
    .then(res => res.json())
    .then(data => {
        let message = data.message

        if (message.startsWith('matching issue')) {
            window.alert("Error: Passwords must match!")
        } else if (message.startsWith("Password updated successfully!")) {
            window.alert("Success! Taking you to login")
            window.location.href = "/account/login.html"
        } else {
            window.alert("Error updating password try again later")
        }
    });
}