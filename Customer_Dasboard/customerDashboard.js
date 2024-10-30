document.addEventListener('DOMContentLoaded', () => {
    const userDetailsContainer = document.getElementById('user-details-container');
    const bookingHistoryContainer = document.getElementById('booking-history');
    const userNameDisplay = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-button');

    async function GetAllCustomerData() {
        const getAllCarDetails = 'http://localhost:5255/api/Customer/Get-All-Customer';
        let cusAll = [];
        try {
            const response = await fetch(getAllCarDetails);
            if (!response.ok) throw new Error('Network response was not ok');
            cusAll = await response.json();
        } catch (error) {
            console.error('Error fetching customer data:', error);
        }
        return cusAll;
    }

    async function initializeDashboard() {
        const cusAll = await GetAllCustomerData();
        const loggedUser = JSON.parse(localStorage.getItem('loggedUser')) || {};
        const loggedUserData = cusAll.find(user => user.nic === loggedUser.customerNicnumber);

        userNameDisplay.textContent = loggedUserData 
        ? `Hello ${loggedUserData.name}! .`
    :   `Hello! You've successfully logged in with your NIC Number: ${loggedUserData.customerNicnumber}.`;
        userNameDisplay.style.opacity = 1;

        populateUserDetails(loggedUserData);
        await renderBookings(loggedUserData.id);
    }

    function populateUserDetails(loggedUserData) {
        userDetailsContainer.innerHTML = ''; 
        if (loggedUserData) {
            const userDiv = document.createElement('div');
            userDiv.classList.add('user-details');
            userDiv.innerHTML = `
                
                <p><strong>Email:</strong> ${loggedUserData.email}</p>
                <p><strong>Phone:</strong> ${loggedUserData.phone}</p>
                <p><strong>Address:</strong> ${loggedUserData.address || "N/A"}</p>
                <p><strong>License Number:</strong> ${loggedUserData.drivingLicenseNumber}</p>
                <p><strong>Proof Number:</strong> ${loggedUserData.proofIdNumber}</p>
                <p><strong>Postal Code:</strong> ${loggedUserData.postalCode}</p>
                <p><strong>Profile Status:</strong> ${loggedUserData.profileStatus}</p>
            `;
            userDetailsContainer.appendChild(userDiv);
        }
    }

    async function renderBookings(customerId) {
        
        const rentalDetails = await fetchData('http://localhost:5255/api/RentalDetail');
        const bookingCars = await fetchData('http://localhost:5255/api/Booking');
        const getAllCarDetails = await fetchData('http://localhost:5255/api/Manager/get-all-cars');


        bookingHistoryContainer.innerHTML = '';

        const userBookings = bookingCars.filter(b => b.customerId === customerId);
        if (userBookings.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="9" style="text-align:center;">No bookings available.</td>';
            bookingHistoryContainer.appendChild(row);
            return;
        }

        userBookings.forEach(b => {
            const rentalDetail = rentalDetails.find(r => r.bookingId === b.bookingId) || {};
           const carname =getAllCarDetails.find(c=>c.carId==b.carId)
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${b.bookingId || "N/A"}</td>
                <td>${b.customerId || "N/A"}</td>
                <td>${carname.brand || "N/A"}</td>
                <td>${carname.model || "N/A"}</td>
                <td>${b.startDate || "N/A"}</td>
                <td>${b.endDate || "N/A"}</td>
                <td>${rentalDetail.fullPayment || "Not Pay"}</td>
                <td>${rentalDetail.status || "Pending"}</td>
                <td>${rentalDetail.rentalDate || "Not rent"}</td>
            `;
            bookingHistoryContainer.appendChild(row);
        });
    }

    // Fetch data from a given URL
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            return [];
        }
    }

    initializeDashboard();

    logoutButton.addEventListener('click', (event) => {
        event.preventDefault(); 
        localStorage.removeItem('loggedUser');
        
        window.location.href = '../Landing_Page/index.html';
    });
});
