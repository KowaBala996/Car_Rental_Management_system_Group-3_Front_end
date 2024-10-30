let AllBookingPayment = [];
let getAllBookingCar = [];
let customers = [];
let cars = [];

// Load booking details from the API
async function loadBookingDetails() {
    const getAllBookingPaymentUrl = 'http://localhost:5255/api/BookingPayment';
    const getAllBookingCarDetailsUrl = 'http://localhost:5255/api/Booking';
    const getAllCustomerDetailsUrl = 'http://localhost:5255/api/Customer/Get-All-Customer';
    const getAllCarDetailsUrl = 'http://localhost:5255/api/Manager/get-all-cars';

    try {
        // Fetch all booking payment data
        const paymentResponse = await fetch(getAllBookingPaymentUrl);
        if (!paymentResponse.ok) throw new Error(`HTTP error! Status: ${paymentResponse.status}`);
        AllBookingPayment = await paymentResponse.json();

        // Fetch all booking car details
        const carDetailsResponse = await fetch(getAllBookingCarDetailsUrl);
        if (!carDetailsResponse.ok) throw new Error(`HTTP error! Status: ${carDetailsResponse.status}`);
        getAllBookingCar = await carDetailsResponse.json();

        // Fetch all customer details
        const customerResponse = await fetch(getAllCustomerDetailsUrl);
        if (!customerResponse.ok) throw new Error(`HTTP error! Status: ${customerResponse.status}`);
        customers = await customerResponse.json();

        // Fetch all car details
        const carResponse = await fetch(getAllCarDetailsUrl);
        if (!carResponse.ok) throw new Error(`HTTP error! Status: ${carResponse.status}`);
        cars = await carResponse.json();

        // Populate the booking table
        populateBookingTable();
    } catch (error) {
        console.error('Error loading booking details:', error);
    }
}

// Populate the booking table with data
function populateBookingTable() {
    const bookingTableBody = document.getElementById('booking-requests');
    bookingTableBody.innerHTML = '';
    const currentDate = new Date().toLocaleDateString();

    if (AllBookingPayment.length > 0) {
        AllBookingPayment.forEach(booking => {
            const BookingCar = getAllBookingCar.find(b => b.bookingId === booking.bookingId);
            const bookingRow = document.createElement('tr');
            bookingRow.setAttribute('data-booking-id', booking.bookingId);
            bookingRow.innerHTML = `
                <td>${booking.bookingId || 'N/A'}</td>
                <td>${booking.paymentId || 'N/A'}</td>
                <td>${booking.paymentMethod || 'N/A'}</td>
                <td>${booking.receiptNumber || 'N/A'}</td>
                <td class="status-cell">${booking.status || 'Pending'}</td>
                <td>${new Date(booking.paymentDate).toLocaleDateString() || 'N/A'}</td>
                <td>${currentDate || 'N/A'}</td>
                <td>${BookingCar?.customerId || 'N/A'}</td>
                <td>${BookingCar?.carId || 'N/A'}</td>
                <td>${booking.amount || '0'}</td>
                <td>${new Date(BookingCar?.startDate).toLocaleDateString() || 'N/A'}</td>
                <td>${new Date(BookingCar?.endDate).toLocaleDateString() || 'N/A'}</td>
                <td class="status-cell">${booking.bookingStatus || 'Approved'}</td>
                <td>
                    <button class="action-button approve" onclick="updateBookingStatus('${booking.bookingId}', 'Approved')">Approve</button>
                    <button class="action-button reject" onclick="updateBookingStatus('${booking.bookingId}', 'Rejected')">Reject</button>
                    <button class="action-button view" onclick="openBookingModal('${booking.bookingId}')">View Details</button>
                </td>
                <td>
                    <button class="rentalBtn" id="rentalBtn-${booking.bookingId}" onclick="openRentalModal('${booking.bookingId}')">Rental</button>
                </td>

            `;
            bookingTableBody.appendChild(bookingRow);
        });
    } else {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="15">No booking requests available.</td>`;
        bookingTableBody.appendChild(row);
    }
}

// Update booking payment data on the server
async function updateBookingPaymentData(formData) {
    const updateBookingStatusUrl = `http://localhost:5255/api/BookingPayment/${formData.get('bookingId')}`;
    try {
        const response = await fetch(updateBookingStatusUrl, {
            method: 'PUT',
            body: formData
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        console.log('Booking payment updated successfully:', data);
    } catch (error) {
        console.error('Error updating booking payment data:', error);
    }
}

// Update booking status to Approved or Rejected
async function updateBookingStatus(bookingId, newStatus) {
    const booking = AllBookingPayment.find(b => b.bookingId === bookingId);

    if (booking) {
        const formData = new FormData();
        formData.append("paymentId", booking.paymentId);
        formData.append("bookingId", booking.bookingId);
        formData.append("amount", booking.amount);
        formData.append("paymentMethod", booking.paymentMethod);
        formData.append("status", newStatus);
        formData.append("paymentDate", booking.paymentDate);
        formData.append("receiptNumber", booking.receiptNumber);

        await updateBookingPaymentData(formData);
        loadBookingDetails(); // Reload booking details to reflect changes
    }
}


// Open rental modal and populate it with booking details
async function openRentalModal(bookId) {
    const modal = document.getElementById("rentalModal");
    modal.style.display = "block"; // Show the modal

    const BookingCar = getAllBookingCar.find(b => b.bookingId === bookId);
    const BookingPay = AllBookingPayment.find(b => b.bookingId === bookId);
    const customer = customers.find(c => c.id === BookingCar?.customerId);
    const car = cars.find(c => c.carId === BookingCar?.carId);
    

    if (BookingPay) {
        document.getElementById('modalBookingId').textContent = BookingCar.bookingId;
        document.getElementById('modalCustomerName').textContent = customer.name;
        document.getElementById('modalCarModel').textContent = car.model;
        document.getElementById('totalPrice').textContent = BookingCar.totalPrice;

        // Set up rental form submission
        const rentalForm = document.getElementById('rentalForm');
        rentalForm.onsubmit = async (e) => {
            e.preventDefault(); // Prevent default form submission

            const fullPayment = document.getElementById('fullPayment1').value;
            const rentalStartDate = document.getElementById('rentalStartDate').value; // Ensure you have this input in your form

            if (!rentalStartDate || !fullPayment) {
                alert("Please enter all required fields.");
                return;
            }

            const rentalId = 'Ren_' + Math.floor(Math.random() * 1000);

            const formData = new FormData();
            formData.append("rentalId", rentalId);
            formData.append("bookingId", BookingCar.bookingId);
            formData.append("rentalDate", rentalStartDate);
            formData.append("fullPayment", fullPayment);
            formData.append("status", "Rented");

            await AddRentalDetail(formData);


            loadBookingDetails(); // Reload booking details to reflect changes
            const closeRentalModalBtn = document.querySelector(".close-rental-modal");
            closeRentalModalBtn.onclick = function () {
                modal.style.display = "none";
            };
            
        };
        const rentalButton = document.getElementById(`rentalBtn-${bookId}`);
        rentalButton.textContent = "Rented"; // Update button text

        // Close modal button
        const submitRental = document.querySelector("#submitRental");
        submitRental.onclick = function () {
            modal.style.display = "none";
        };
        
    }

    // Close the modal when the user clicks outside of it
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none"; // Close the modal if clicked outside
        }
    }
}


function openBookingModal(bookingId) {
    // Fetch the booking car and payment details based on bookingId
    const BookingCar = getAllBookingCar.find(b => b.bookingId === bookingId);
    const BookingPay = AllBookingPayment.find(b => b.bookingId === bookingId);
    const car = cars.find(c => c.carId === BookingCar?.carId); // Ensure we use carId from BookingCar
    const customer = customers.find(c => c.id === BookingCar?.customerId); // Ensure we use customerId from BookingCar

    // If all relevant data is found, populate the modal
    if (BookingCar && car && customer) {
        document.getElementById('bookingId').textContent = BookingCar.bookingId;
        document.getElementById('bookingDate').textContent = new Date(BookingPay.paymentDate).toLocaleDateString();
        document.getElementById('customerid').textContent = customer.id;
        document.getElementById('name').textContent = customer.name;
        document.getElementById('rentalCarId').textContent = BookingCar.carId;
        document.getElementById('email').textContent = customer.email;
        document.getElementById('phone').textContent = customer.phone;
        document.getElementById('address').textContent = customer.address;
        document.getElementById('license-number').textContent = customer.drivingLicenseNumber;
        document.getElementById('paymentAmount').textContent = BookingCar.totalPrice;
        document.getElementById('paymentStatus').textContent = BookingPay.status;
        document.getElementById('proof-number').textContent = customer.proofIdNumber;
        document.getElementById('brand').textContent = car.brand;
        document.getElementById('model').textContent = car.model;
        document.getElementById('fuel').textContent = car.fuelType;
        document.getElementById('seats').textContent = car.numberOfSeats;
        document.getElementById('price').textContent = car.pricePerHour;
        document.getElementById('availableFrom').textContent = new Date(BookingCar.startDate).toLocaleDateString();
        document.getElementById('availableTo').textContent = new Date(BookingCar.endDate).toLocaleDateString();
    }

    // Display the modal
    const modal = document.getElementById("myModal");
    modal.style.display = "block";

    // Close modal functionality
    const closeBtn = document.querySelector(".close");
    closeBtn.onclick = () => {
        modal.style.display = "none";
    };

    // Close the modal when clicking outside of it
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none"; // Close the modal if clicked outside
        }
    };
}

// Add rental details to the server
async function AddRentalDetail(formData) {
    const addRentalDetailURL = 'http://localhost:5255/api/RentalDetail';
    await fetch(addRentalDetailURL, {
        method: 'POST',
        body: formData
    });
    GetAllCarsData(); // Ensure to refresh the car data after adding rental
}

// Call loadBookingDetails on window load
window.onload = loadBookingDetails;
