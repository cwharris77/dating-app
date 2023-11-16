function login() {
	
  let us = document.getElementById('loginEmail').value;
  let pw = document.getElementById('loginPassword').value;

  let data = {username: us, password: pw};
  console.log(data)
  // let p = fetch('/account/login/', {
  //   method: 'POST', 
  //   body: JSON.stringify(data),
  //   headers: {"Content-Type": "application/json"}
  // });
  // p.then((response) => {
  //   return response.text();
  // }).then((text) => {
  //   console.log(text);
  //   if (text.startsWith('SUCCESS')) {
  //   	window.location.href = '/app/home.html?user=' + encodeURIComponent(us);
  //   } else {
  //   	let p = document.querySelector('p')
  //   	p.style.display = 'block'
  //   }
  // });
}

function createAccount() {
  let us = document.getElementById('usernameCreate').value;
  let pw = document.getElementById('passwordCreate').value;
  let p = fetch('/add/user/', {
  	method: 'POST',
  	body: JSON.stringify({username: us, password: pw}),
  	headers: {"Content-Type": "application/json"}
  });
  p.then((response) => {
    return response.json();
  }).then((text) => { 
    alert(text.message);
  });
}