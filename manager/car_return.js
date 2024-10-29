const addReturnDetailUrl = 'http://localhost:5255/api/ReturnDetail';
const rentalDetailsUrl = 'http://localhost:5255/api/RentalDetail';
const bookingDetailsUrl = 'http://localhost:5255/api/Booking';
const returnDetailsUrl = 'http://localhost:5255/api/ReturnDetail';

let rentalDetail = [];
let bookingDetail = [];
let returnDetail = [];

// Fetch rental details
async function fetchRentalDetails() {
    try {
        const response = await fetch(rentalDetailsUrl);
        rentalDetail = await response.json();
    } catch (error) {
        console.error('Error fetching rental details:', error);
    }
}

// Fetch booking details
async function fetchBookingDetails() {
    try {
        const response = await fetch(bookingDetailsUrl);
        bookingDetail = await response.json();
    } catch (error) {
        console.error('Error fetching booking details:', error);
    }
}

// Fetch return details
async function fetchReturnDetails() {
    try {
        const response = await fetch(returnDetailsUrl);
        returnDetail = await response.json();
    } catch (error) {
        console.error('Error fetching return details:', error);
    }
}

// Add new return detail
async function AddReturnDetail(formData) {
    try {
        const response = await fetch(addReturnDetailUrl, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) throw new Error("Failed to add return detail.");
        alert("Return detail added successfully!"); // Success message
    } catch (error) {
        console.error('Error adding return detail:', error);
        alert("Failed to add return detail. Please try again.");
    }
    
}

// Populate rental car ID options and handle form submission
async function populateRentalCarIdOptions() {
    await Promise.all([fetchRentalDetails(), fetchBookingDetails(), fetchReturnDetails()]);

    const rentalIdSelect = document.getElementById("rentalCarId");
    const rentalStartDateInput = document.getElementById("startDate");
    const returnDateInput = document.getElementById("returnDate");
    const conditionDetails = document.getElementById("condition");
    const extraPaymentInput = document.getElementById("extraPayment");

    rentalIdSelect.innerHTML = '<option value=""></option>'; 
    rentalDetail.forEach(booking => {
        const option = document.createElement('option');
        option.value = booking.rentalId;
        option.textContent = booking.rentalId;
        rentalIdSelect.appendChild(option);
    });

    rentalIdSelect.addEventListener('change', function () {
        const selectedRentalCarId = this.value;
        const selectedRentalDetail = rentalDetail.find(r => r.rentalId === selectedRentalCarId);
        const bookingCarDetails = selectedRentalDetail ? bookingDetail.find(c => c.bookingId === selectedRentalDetail.bookingId) : null;

        rentalStartDateInput.value = selectedRentalDetail ? bookingCarDetails.startDate : '';
        returnDateInput.value = selectedRentalDetail ? selectedRentalDetail.returnDate : ''; // Set return date here
    });

    document.getElementById('booking-form').addEventListener("submit", async function (event) {
        event.preventDefault();

        const ReturnId = 'Ret_' + String(Math.floor(1000 + Math.random() * 9000)); // Generate unique Return ID

        // Gather form data
        const formData = new FormData();
        formData.append("returnId", ReturnId);
        formData.append("rentalId", rentalIdSelect.value); // Get selected rental ID
        formData.append("startDate", rentalStartDateInput.value); // Get start date
        formData.append("returnDate", returnDateInput.value); // Get return date
        formData.append("extraPayment", extraPaymentInput.value); // Get extra payment
        formData.append("condition", conditionDetails.value); // Get condition

        // Call the AddReturnDetail function with the form data
        await AddReturnDetail(formData);

        // Refresh the table with updated return details and close the modal
        await fetchReturnDetails();
        populateTable(returnDetail);
        closeModal();
    });

    populateTable(returnDetail);
}

// Populate table with return details
function populateTable(details) {
    const tableBody = document.querySelector('.car-table tbody');
    tableBody.innerHTML = ''; // Clear existing rows
    details.forEach(returnDetail => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${returnDetail.returnId}</td>
            <td>${returnDetail.rentalId}</td>
            <td>${returnDetail.returnDate}</td>
            <td>${returnDetail.lateFees || 'N/A'}</td>
            <td>${returnDetail.condition}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Modal functionality
const modal = document.getElementById("myModal");
const btn = document.getElementById("openModalBtn");
const span = document.getElementById("closeModalBtn");

btn.onclick = function () {
    modal.style.display = "block";
};

span.onclick = closeModal;

window.onclick = function (event) {
    if (event.target === modal) {
        closeModal();
    }
};

function closeModal() {
    modal.style.display = "none";
}

// Populate options and table on page load
document.addEventListener("DOMContentLoaded", populateRentalCarIdOptions);
