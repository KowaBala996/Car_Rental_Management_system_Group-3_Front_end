document.addEventListener("DOMContentLoaded", async function () {
    const logoutButton = document.getElementById('logoutButton');

    logoutButton.addEventListener('click', function (event) {
        event.preventDefault();
        localStorage.removeItem('loggedUser');
        window.location.href = '../Customer_login/login.html';
    });

    await Promise.all([GetAllCarsData(), GetAllCustomerData(), GetAllBookingData()]); // Fetch all necessary data
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const rentalCarId = getQueryParam('carid');
const renterCusId = getQueryParam('customerid');
const bookingId = getQueryParam('bookingId');



const getAllBookingDetails = 'http://localhost:5255/api/Booking';
const getAllCarDetails = 'http://localhost:5255/api/Manager/get-all-cars';
const getAllCustomerDetails = 'http://localhost:5255/api/Customer/Get-All-Customer';

let cars = [];
let customers = [];
let Booking = [];

// Fetch all car details
async function GetAllCarsData() {
    try {
        const response = await fetch(getAllCarDetails);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        cars = data;

        if (rentalCarId) {
            const rentalCar = cars.find(car => car.carId === rentalCarId);
            const selectedCustomer = customers.find(customer => customer.id === renterCusId);
            if (rentalCar && selectedCustomer) {
                displayBookingDetails(rentalCar, selectedCustomer);
            } else {
                displayError();
            }
        } else {
            displayError();
        }
    } catch (error) {
        console.error('Error fetching car data:', error);
    }
}

// Fetch all customer details
async function GetAllCustomerData() {
    try {
        const response = await fetch(getAllCustomerDetails);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        customers = data; // Store all customers
    } catch (error) {
        console.error('Error fetching customer data:', error);
    }
}

async function GetAllBookingData() {
    try {
        const response = await fetch(getAllBookingDetails);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        Booking = data; // Store booking data if needed
    } catch (error) {
        console.error('Error fetching booking data:', error);
    }
}

function displayBookingDetails(car, customer) {
    const bookingSummarySection = document.querySelector('.booking-summary');

    const bookingDetailsHTML = `
        <div class="booking-details">
            <h2>Car Details</h2>
            <p><strong>Brand:</strong> ${car.brand}</p>
            <p><strong>Model:</strong> ${car.model}</p>
            <p><strong>Fuel:</strong> ${car.fuelType}</p>
            <p><strong>Transmission:</strong> ${car.transmission}</p>
            <p><strong>Seats:</strong> ${car.numberOfSeats}</p>
            <p><strong>Price Per Hour:</strong> ${car.pricePerHour}</p>
            <img src="http://localhost:5255${car.imagePath}" alt="${car.model}" style="width: 100px; height: auto;" />
            <h2>Renter Details</h2>
            <p><strong>Name:</strong> ${customer.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${customer.email}">${customer.email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${customer.phone}">${customer.phone}</a></p>
            <button id="registerButton">Booking Payment</button>
        </div>
    `;

    bookingSummarySection.innerHTML = bookingDetailsHTML;

    const registerButton = document.getElementById('registerButton');
    registerButton.addEventListener('click', function () {
        window.location.href = `../Customer_payment/Cus_payment.html?carid=${rentalCarId}&customerid=${renterCusId}&bookingId=${bookingId}`; 
    });
   
}

function displayError() {
    const bookingSummarySection = document.querySelector('.booking-summary');
    bookingSummarySection.innerHTML = `
        <div class="error-message">
            <p>Choose our rental car hire service for affordable rates, a diverse fleet, and exceptional customer support. Your journey begins here!</p>
            <button><a href="../Car_Categories/get-car.html">Book a Car Now</a></button>
        </div>
    `;
} ;
