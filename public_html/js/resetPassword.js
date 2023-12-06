const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('email');
const retry = urlParams.get('retry')
const errorMessage = document.querySelector("h3");
const h1 = document.getElementById("enter-header")
const emailInput = document.getElementById("emailInput");

if (h1) {
    h1.innerHTML = `Please enter the OTP sent to ${email}`
}

if (emailInput) {
    emailInput.value = email;
}

if (retry == true && errorMessage) {
    errorMessage.classList.add("hidden")
} else if (retry == false && errorMessage) {
    errorMessage.classList.remove("hidden")
}

function moveToNextInput(currentInput, nextInputId) {
    const maxLength = parseInt(currentInput.getAttribute('maxlength'));
    const inputValue = currentInput.value;

    if (inputValue.length === maxLength) {
        // Move focus to the next input
        const nextInput = document.getElementById(nextInputId);
        if (nextInput) {
            nextInput.focus();
        }
    }
}

function moveToPreviousInput(event, previousInputId) {
    const currentInput = event.target;
    const currentValue = currentInput.value;

    // Check for backspace key (keyCode 8) and empty input
    if (event.keyCode === 8 && currentValue.length === 0) {
        // Move focus to the previous input
        const previousInput = document.getElementById(previousInputId);
        if (previousInput) {
            previousInput.focus();
        }
    }
}

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



