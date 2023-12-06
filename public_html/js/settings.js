/**
 * Function to fetch and update user settings from the server
 */
function fetchAndUpdateSettings() {
    // Use the fetch API to retrieve user settings from the server endpoint '/get/settings'
    fetch('/get/settings')
        .then(response => {
            // Check if the network response is successful; otherwise, throw an error
            if (!response.ok) {
                throw new Error('Network response not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched settings:', data);
            
            // Update the form elements with the new settings
            document.getElementById('preference').value = data.interest;
            document.getElementById('notif').value = data.notification;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

document.addEventListener('DOMContentLoaded', fetchAndUpdateSettings);

/**
 * Function to save user settings to the server
 */
function saveSettings() {
    // Get form data and save it to the server
    var userSettingsForm = document.getElementById('userSettings');
    
    // Create a FormData object to store form data
    var formData = new FormData(userSettingsForm);

    console.log("Form data:", formData);
    
    // Use fetch to send the formData to the server
    fetch('/edit/settings', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        // Check if the network response is successful; otherwise, throw an error
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Settings saved:', data);
        alert("Settings saved");
        
        // Refresh settings after saving
        fetchAndUpdateSettings();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}