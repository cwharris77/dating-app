const submit_edit = document.getElementById("submit-profile");

function handle_submit() {

    console.log("Sent!");

    const name_edit = document.getElementById("name-edit").value;
    const age_edit = document.getElementById("age-edit").value;
    const location_edit = document.getElementById("loc-edit").value;
    const height_edit = document.getElementById("height-edit").value;
    const about_me_edit = document.getElementById("about-me-edit").value;
    const pfp = document.getElementById("pfp").value;
    try {
        fetch(`/edit/profile`, {
            method: 'POST',
            body: JSON.stringify({
                name: name_edit,
                age: age_edit,
                location: location_edit,
                height: height_edit,
                bio: about_me_edit,
                photo: pfp
            }),
            headers: { 'Content-Type': 'application/json' }

        }).then((result) => {
            result.json().then((data) => {
                console.log(typeof(data));
                if (data == true) {

                    window.location.href = '/account/profile.html'; 
                } else {
                    alert("Error with updating profile!");
                }
            });
            
        });


        
    } catch (err) {
        console.log(err);
        console.log("Failed to Edit Profile")
    };
}

submit_edit.addEventListener("click", handle_submit);
