// Notifications toggle functionality
document.getElementById('notification-button').addEventListener('click', function () {
    const dropdown = document.getElementById('notification-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

// Optional: Close dropdown if clicked outside
window.onclick = function (event) {
    if (!event.target.matches('.notification-button')) {
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
        }
    }
};

// Fetch notifications from localStorage
let formDataArray = JSON.parse(localStorage.getItem('formDataArray')) || [];

// Function to update notifications based on formDataArray
function updateNotifications() {
    const dropdown = document.getElementById('notification-dropdown');
    dropdown.innerHTML = ''; // Clear existing notifications

    // If there are no entries, show a message
    if (formDataArray.length === 0) {
        dropdown.innerHTML = '<ul><li>No new notifications</li></ul>';
        document.getElementById('notification-count').textContent = ''; // Clear count
    } else {
        // Populate notifications with the latest form entries
        const notificationList = document.createElement('ul');
        formDataArray.forEach((data) => {
            const listItem = document.createElement('li');
            // Display all the data: name, phone, email, message
            listItem.textContent = `New message from ${data.name}: ${data.message}, Phone: ${data.phone}, Email: ${data.email}`;
            notificationList.appendChild(listItem);
        });
        dropdown.appendChild(notificationList);
        document.getElementById('notification-count').textContent = formDataArray.length; // Update count
    }
}

// Call updateNotifications when the document loads
document.addEventListener('DOMContentLoaded', updateNotifications);

const contactForm = document.getElementById('contactForm'); // Assuming this is the ID of your contact form
if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        const formData = {
            name: name,
            phone: phone,
            email: email,
            message: message
        };

        formDataArray.push(formData);
        localStorage.setItem('formDataArray', JSON.stringify(formDataArray));
        updateNotifications();

        alert("Form data has been saved!");
    });
}

let cars = [];
const getAllCarDetails = 'http://localhost:5255/api/Manager/get-all-cars';

async function GetAllCarsData() {
    try {
        const response = await fetch(getAllCarDetails);
        const data = await response.json();
        cars = data;

        const uniqueBrands = [...new Set(cars.map(car => car.brand))];
        document.getElementById('totalBrands').textContent = uniqueBrands.length;
        document.getElementById('TotalCars').textContent = cars.length;
    } catch (error) {
        console.error('Error fetching cars:', error);
    }
}

GetAllCarsData();

let userRequests = [];

async function getAllCustomerData() {
    const getAllCustomerDetails = 'http://localhost:5255/api/Customer/Get-All-Customer';

    const response = await fetch(getAllCustomerDetails);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    userRequests = data;

    document.getElementById('todayusers').textContent = userRequests.length;
    populateUserTable();
}

getAllCustomerData();

let AllBookingPayment = [];
const getAllBookingPaymentUrl = 'http://localhost:5255/api/BookingPayment';

async function fetchAllBookingPayments() {
    const paymentResponse = await fetch(getAllBookingPaymentUrl);
    if (!paymentResponse.ok) throw new Error(`HTTP error! Status: ${paymentResponse.status}`);

    AllBookingPayment = await paymentResponse.json();
    document.getElementById('todaybooking').textContent = AllBookingPayment.length;
}

fetchAllBookingPayments();

let RentalDetails = [];
const getAllRentalDetails = 'http://localhost:5255/api/RentalDetail';

// Fetch rental details
async function GetAllRentalData() {
    try {
        const response = await fetch(getAllRentalDetails);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        RentalDetails = await response.json();
    } catch (error) {
        console.error('Error fetching rental data:', error);
    }
}

const returnDetailsUrl = 'http://localhost:5255/api/ReturnDetail';
let returnDetail = [];

async function fetchReturnDetails() {
    try {
        const response = await fetch(returnDetailsUrl);
        returnDetail = await response.json();
    } catch (error) {
        console.error('Error fetching return details:', error);
    }
}

// Call the functions to fetch data and update charts
GetAllRentalData();
fetchReturnDetails();

// Render charts
function renderCharts() {
    // Calculate total payments
    const totalBookingPayment = AllBookingPayment.reduce((sum, a) => sum + a.amount, 0);
    const totalRentalPayment = RentalDetails.reduce((sum, a) => sum + a.fullPayment, 0);
    const totalReturnPayment = returnDetail.reduce((sum, a) => sum + a.lateFees, 0);

    // Pie Chart
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    const pieChart = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ['Booking Payments', 'Rental Payments', 'Return Payments'],
            datasets: [{
                data: [totalBookingPayment, totalRentalPayment, totalReturnPayment],
                backgroundColor: ['#3498db', '#2ecc71', '#e74c3c']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Bar Chart
    const ctxBar = document.getElementById('barChart').getContext('2d');
    const barChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Booking Payments', 'Rental Payments', 'Return Payments'],
            datasets: [{
                label: 'Total Amount (Rs)',
                data: [totalBookingPayment, totalRentalPayment, totalReturnPayment],
                backgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Call renderCharts after fetching all necessary data
Promise.all([fetchAllBookingPayments(), GetAllRentalData(), fetchReturnDetails()])
    .then(renderCharts)
    .catch(error => console.error('Error in fetching data:', error));

// Logout functionality
document.getElementById('logout-button').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent default anchor click behavior
    window.location.href = 'index.html'; // Redirect to login page
});
