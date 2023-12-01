const match_container = document.getElementById("profile-container");

function getMatches(currentUser) {
    match_container.innerHTML = "";
    fetch(`/get/matches/${currentUser}`).then((result) => {
        if (result) {
            result.json().then((data) => {
                console.log(data);
                for (matches in data) {
                    let profile = "";
                    profile += "<div class=\"user-header\">";
                    profile += `<h2 id="name">${data[matches].name}</h2>`;
                    profile += `<h4 id="age">Age: ${data[matches].age}</h4>`;
                    profile += `<h4 id="location">Location: ${data[matches].location}</h4>`;
                    profile += `<h4 id="height">Height: ${data[matches].height} </h4> </div>`
                    profile += `<div class="user-image">`;
                    profile += `<img src="https://brsc.sa.edu.au/wp-content/uploads/2018/09/placeholder-profile-sq.jpg" alt="profile pic">`;
                    profile += `</div>`;
                    profile += `<h3>About me: </h3>`;
                    profile += `<div id="bio">`;
                    profile += `${data[matches].bio}`;
                    profile += `</div> <br> <a href="../account/video.html"> 
                <button id="edit-profile" type="button"> Select </button></a>`;

                    match_container.innerHTML += profile;
                }
            });


        } else {
            alert("Failed to load profile");
        }
    });
}

// setTimeout(getmatches, 10000);
