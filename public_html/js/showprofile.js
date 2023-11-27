function getUserInfo() {
    var nameElement = document.getElementById("name");
    var age = document.getElementById("age");
    var location = document.getElementById("location");
    var height = document.getElementById("height");
    var bio = document.getElementById("bio");


    fetch(`/get/user/${"CurrentUser"}`).then((result) =>{
        if (result) {
           
            result.json().then((data) => {

                nameElement.innerText = data.name;
                age.innerText = data.age;
                height.innerText = data.height;
                bio.innerText = data.bio;
                location.innerText = data.location;
            });
            
            
        } else {
            alert("Failed to load profile");
        }
    });
}

setTimeout(getUserInfo, 10);



