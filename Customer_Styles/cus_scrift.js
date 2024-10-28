document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById('logoutButton');
    const loginBtn = document.getElementById('loginbtn'); // The login button in the navbar
    const userDropdown = document.querySelector('.user-dropdown'); // The user dropdown in the navbar

    // Check if the user is already logged in
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));

    if (loggedUser) {
        loginBtn.style.display = "none"; // Hide the login button
        userDropdown.style.display = "block"; // Show the user dropdown
    } else {
        loginBtn.style.display = "block"; // Show the login button
        userDropdown.style.display = "none"; // Hide the user dropdown
    }

    // Logout functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', function (event) {
            event.preventDefault();
            localStorage.removeItem('loggedUser'); // Remove loggedUser details
            window.location.href = '../Landing_Page/index.html'; // Redirect to home page
        });
    }
});
