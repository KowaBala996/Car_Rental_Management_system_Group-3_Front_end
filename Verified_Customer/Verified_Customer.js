document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById('logoutButton');

    // Logout function to clear loggedUser from localStorage and redirect to login page
    logoutButton.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior

        // Remove loggedUser from localStorage
        localStorage.removeItem('loggedUser');

        // Redirect to login page after logging out
        window.location.href = '../Customer_login/login.html';
    });
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Get car ID and customer ID from URL parameters
const rentalCarId = getQueryParam('carid');
const renterId = getQueryParam('customerid');

// Fetch the car details from local storage
let carDetailsArray = JSON.parse(localStorage.getItem('bookingCar')) || [];
const selectedCar = carDetailsArray.find(car => car.carId == rentalCarId);

// Fetch the customer details from local storage
let customerDetailsArray = JSON.parse(localStorage.getItem('userProfileData')) || [];
const selectedCustomer = customerDetailsArray.find(customer => customer.customerId == renterId);

// If both car and customer details are found, display them; otherwise, show an error
if (selectedCar && selectedCustomer) {
    displayBookingDetails(selectedCar, selectedCustomer);
} else {
    displayError();
}

// Function to display the booking details
function displayBookingDetails(car, customer) {
    const bookingSummarySection = document.querySelector('.booking-summary');

    const bookingDetailsHTML = `
        <div class="booking-details">
            <h2>Car Details</h2>
            <p><strong>Brand:</strong> ${car.brand}</p>
            <p><strong>Model:</strong> ${car.model}</p>
            <p><strong>Fuel:</strong> ${car.fuel}</p>
            <p><strong>Transmission:</strong> ${car.transmission}</p>
            <p><strong>Seats:</strong> ${car.seats}</p>
            <p><strong>Total Hours:</strong> ${car.totalHours}</p>
            <p><strong>Total Price:</strong> Rs.${car.totalPrice}</p>
            <img src="${car.image}" alt="${car.brand} ${car.model}" style="max-width:300px;">
            
            <h2>Renter Details</h2>
            <p><strong>Renter ID:</strong> ${customer.customerId}</p>
            <p><strong>Name:</strong> ${customer.customerName}</p>
            <p><strong>Email:</strong> <a href="mailto:${customer.customerEmail}">${customer.customerEmail}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${customer.customerPhone}">${customer.customerPhone}</a></p>
            
            <button id="registerButton">Booking Payment</button>
        </div>
    `;

    bookingSummarySection.innerHTML = bookingDetailsHTML;

    // Event listener for the advanced payment button
    const registerButton = document.getElementById('registerButton');
    registerButton.addEventListener('click', function () {
        window.location.href = `../Customer_payment/Cus_payment.html?carid=${rentalCarId}&customerid=${renterId}`; // Redirect to the payment page
    });
}

// Function to display an error message if details are not found
function displayError() {
    const bookingSummarySection = document.querySelector('.booking-summary');
    bookingSummarySection.innerHTML = `
        <div class="error-message">
            <p>Sorry, the car or renter details could not be found. Please try again later or contact support.</p>
        </div>
    `;
}
