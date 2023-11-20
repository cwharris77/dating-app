const submit_edit = document.getElementById("submit_profile");

function handle_submit() {
    const name_edit = document.getElementById("name-edit").value;
    const age_edit = document.getElementById("age-edit").value;
    const location_edit = document.getElementById("loc-edit").value;
    const height_edit = document.getElementById("height-edit").value;
    try {
        fetch(`/edit/profile`, {
            method: 'POST',
            body: JSON.stringify({
                name: name_edit,
                age: age_edit,
                location: location_edit,
                height: height_edit
            }),
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (err) {
        console.log("Failed to Edit Profile")
    };
}

submit_edit.addEventListener("click", handle_submit);
