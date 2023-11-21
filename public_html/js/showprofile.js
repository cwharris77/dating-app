var nameElement = document.getElementById("name");
var age = document.getElementById("age");
var location = document.getElementById("location");
var height = document.getElementById("height");
var bio = document.getElementById("bio");

function getUserInfo() {

    console.log("Test");


    fetch(`/get/user/CurrentUser`).then((result) =>{
        if (result) {

            
            let dataSheet = JSON.parse(result);

            nameElement.innerText = dataSheet.name;
            age.innerText = dataSheet.age;
            height.innerText = dataSheet.height;
            bio.innerText = dataSheet.bio;

            console.log("Success!");
        } else {
            console.log("Failure");
        }
    });
}

console.log("Firing!");

getUserInfo();
