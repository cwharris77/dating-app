function saveSettings() {
    // Get form data and save it to the server
    var userSettingsForm = document.getElementById('userSettings');
    var formData = new FormData(userSettingsForm);

    console.log("Form data:", formData);
    
    // Use fetch to send the formData to the server
    fetch('/edit/settings', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Settings saved:', data);
        
        alert("Settings saved");
    })
    .catch(error => {
        console.error('Error:', error);
    });
}