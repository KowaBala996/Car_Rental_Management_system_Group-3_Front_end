let AllBookingPayment = [];
let getAllBookingCar = [];
let customers = [];
let cars = [];

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
                <td class="status-cell">${booking.bookingStatus || 'Pending'}</td>
                <td>
                    <button class="action-button approve" onclick="updateBookingStatus('${booking.bookingId}', 'Approved')">Approve</button>
                    <button class="action-button reject" onclick="updateBookingStatus('${booking.bookingId}', 'Rejected')">Reject</button>
                    <button class="action-button view" onclick="openBookingModal('${booking.bookingId}')">View Details</button>
                </td>
                <td>
                    <button class="rentalBtn" onclick="openRentalModal('${booking.bookingId}')">Rental</button>
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

async function openRentalModal(bookingId) {
    const modal = document.getElementById("rentalModal");
    modal.style.display = "block"; // Show the modal

    const BookingCar = getAllBookingCar.find(b => b.bookingId === bookingId);
    const BookingPay = AllBookingPayment.find(b => b.bookingId === bookingId);
    const customer = customers.find(c => c.id === BookingCar?.customerId);
    const car = cars.find(c => c.id === BookingCar?.carId);

    if (BookingPay && car && customer) {
        document.getElementById('modalBookingId').textContent = BookingPay.bookingId;
        document.getElementById('modalCustomerName').textContent = customer.name;
        document.getElementById('modalCarModel').textContent = car.model;

        // Set up the close button event
        const closeRentalModalBtn = document.querySelector(".close-rental-modal");
        closeRentalModalBtn.onclick = function() {
            modal.style.display = "none"; // Close the modal when clicked
        };

        // Set up the confirm button event
        document.getElementById('confirmRental').onclick = () => {
            const rentalStartDate = document.getElementById('rentalStartDate').value;
            const fullPayment = document.getElementById('halfPayment').value;

            if (!rentalStartDate || !fullPayment) {
                alert("Please enter all required fields.");
                return;
            }

            // Process rental confirmation logic here if needed
            modal.style.display = "none"; // Close the modal after confirmation
            loadBookingDetails(); // Reload booking details
        };
    }
    closeRentalModalBtn.onclick = function() {
        console.log("Close button clicked"); // Debugging line
        modal.style.display = "none"; // Close the modal when clicked
    };
    
}


// Close the modal when the user clicks anywhere outside of it
window.onclick = function(event) {
    const modal = document.getElementById("rentalModal");
    if (event.target === modal) {
        modal.style.display = "none"; // Close the modal if clicked outside
    }
}


// Close the modal when the user clicks anywhere outside of it
window.onclick = function(event) {
    const modal = document.getElementById("rentalModal");
    if (event.target === modal) {
        modal.style.display = "none"; // Close the modal if clicked outside
    }
}

// Call loadBookingDetails on window load
window.onload = loadBookingDetails;
