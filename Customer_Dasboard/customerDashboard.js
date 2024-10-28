document.addEventListener('DOMContentLoaded', () => {
    const userDetailsContainer = document.getElementById('user-details-container');
    const bookingHistoryContainer = document.getElementById('booking-history');
    const userNameDisplay = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-button');

    // Fetch user data from local storage
    const userRequests = JSON.parse(localStorage.getItem('userProfileData')) || [];
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser')) || {};

    // Display user's name or NIC number
    const loggedUserData = userRequests.find(user => user.customerNicnumber === loggedUser.customerNicnumber);
    if (loggedUserData) {
        userNameDisplay.textContent = `You logged in as ${loggedUserData.customerName}!`;
    } else {
        userNameDisplay.textContent = `You logged in with NIC Number ${loggedUser.customerNicnumber}!`;
    }

    // Make the user name visible with fade-in effect
    userNameDisplay.style.opacity = 1;

    // Populate user details on the dashboard
    function populateUserDetails() {
        userDetailsContainer.innerHTML = ''; // Clear previous content
        if (loggedUserData) {
            const userDiv = document.createElement('div');
            userDiv.classList.add('user-details');
            userDiv.innerHTML = `
                <h2>${loggedUserData.customerName}</h2>
                <p><strong>Email:</strong> ${loggedUserData.customerEmail}</p>
                <p><strong>Phone:</strong> ${loggedUserData.customerPhone}</p>
                <p><strong>Address:</strong> ${loggedUserData.customerAddress || "N/A"}</p>
                <p><strong>License Number:</strong> ${loggedUserData.licenseNumber}</p>
                <p><strong>Proof Type:</strong> ${loggedUserData.proofType}</p>
                <p><strong>Postal Code:</strong> ${loggedUserData.postalCode}</p>
                <p><strong>Profile Status:</strong> ${loggedUserData.profileStatus}</p>

                
            `;
            userDetailsContainer.appendChild(userDiv);
        }
    }

    // Fetch booking data from local storage and render it in the table
    function renderBookings() {
        const bookings = JSON.parse(localStorage.getItem('rentalCarDetail')) || [];
        // Clear existing rows
        bookingHistoryContainer.innerHTML = '';

        // Check if there are any bookings
        if (bookings.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="9" style="text-align:center;">No bookings available.</td>';
            bookingHistoryContainer.appendChild(row);
            return;
        }

        // Loop through bookings and create table rows
        bookings.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.bookingId || "N/A"}</td>
                <td>${booking.customerId || "N/A"}</td>
                <td>${booking.rentalCarId || "N/A"}</td>
                <td>${booking.bookingAmount || "N/A"}</td>
                <td>${booking.availableFrom || "N/A"}</td>
                <td>${booking.availableTo || "N/A"}</td>
                <td>${booking.rentalDateFrom || "N/A"}</td>
                <td>${booking.halfPayment || "N/A"}</td>
                <td>${booking.paymentStatus || "N/A"}</td>
            `;
            bookingHistoryContainer.appendChild(row);
        });
    }

    // Initialize the dashboard with user data and bookings
    populateUserDetails();
    renderBookings();

    // Logout Functionality
    logoutButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default anchor behavior

        // Clear user-related data from local storage
        localStorage.removeItem('loggedUser');
        localStorage.removeItem('userProfileData');
        localStorage.removeItem('rentalCarDetail');
        // Optionally clear other keys if applicable
        localStorage.removeItem('lastCarDetail'); 
        localStorage.removeItem('payments'); 

        // Redirect to the Landing Page
        window.location.href = '../Landing_Page/index.html';
    });
});
