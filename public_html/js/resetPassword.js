const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('email');

let h1 = document.getElementById("enter-header")
h1.innerHTML = `Please enter the OTP sent to ${email}`

let emailInput = document.getElementById("emailInput");
emailInput.value = email;

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