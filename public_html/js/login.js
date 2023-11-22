// Get references to HTML elements
let logIn = document.getElementById("loginForm");
let signUp = document.getElementById("signUpForm");
let loginButton = document.getElementById("loginButton");
let signUpButton = document.getElementById("signUpButton");
let loginSubmit = document.getElementById("loginSubmit");
let signUpSubmit = document.getElementById("signUpSubmit");

/**
 * Handles the login functionality.
 * Retrieves user input, sends a GET request to the server, and redirects upon successful login.
 */
function login() {
  console.log("logging in");
  let us = document.getElementById('loginEmail').value;
  let pw = document.getElementById('loginPassword').value;

  let data = { email: us, password: pw };

  // send data in the request body
  // let p = fetch(`/login/${us}/${pw}`, {
  //   method: 'GET', 
  //   body: JSON.stringify(data),
  //   headers: {"Content-Type": "application/json"}
  // });

  let p = fetch(`/login/${us}/${pw}`, { method: 'GET' });

  p.then((response) => {
    return response.text();
  }).then((text) => {
    console.log(text);
    if (text.startsWith('true')) {
      window.location.href = '/app/homepage.html'; //?user=' + encodeURIComponent(us);
    } else {
      console.log("attempt failed");
    }
  });
}

/**
 * Handles the account creation functionality.
 * Retrieves user input, sends a POST request to the server, and redirects upon successful account creation.
 */
function createAccount() {
  console.log("got here");
  let us = document.getElementById('signUpEmail').value;
  let pw = document.getElementById('signUpPassword').value;

  let p = fetch('/create/account', {
    method: 'POST',
    body: JSON.stringify({ email: us, password: pw }),
    headers: { "Content-Type": "application/json" }
  });

  p.then((response) => {
    return response.text();
  }).then((text) => {
    if (text.startsWith('true')) {
      window.location.href = '/account/editprofile.html';
    } else {
      alert("Account already exists!");
    }
  }).catch((err) => {
    alert(err);
  });
}

/**
 * Switches the view to the sign-up form.
 */
function showSignUp() {
  logIn.classList.add("hidden");
  signUp.classList.remove("hidden");

  loginButton.classList.remove("active-button");
  loginButton.classList.add("inactive-button");

  signUpButton.classList.add("active-button");
  signUpButton.classList.remove("inactive-button");

  loginSubmit.classList.add("hidden");
  signUpSubmit.classList.remove("hidden");
}

/**
 * Switches the view to the login form.
 */
function showLogin() {
  signUp.classList.add("hidden");
  logIn.classList.remove("hidden");

  loginButton.classList.add("active-button");
  loginButton.classList.remove("inactive-button");

  signUpButton.classList.remove("active-button");
  signUpButton.classList.add("inactive-button");

  loginSubmit.classList.remove("hidden");
  signUpSubmit.classList.add("hidden");
}
