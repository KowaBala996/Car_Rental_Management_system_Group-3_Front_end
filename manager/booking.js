
async function loadBookingDetails() {
    const bookingData = await fetchData('https://yourapi.com/api/bookings');
    const carData = await fetchData('https://yourapi.com/api/cars');
    const customerData = await fetchData('https://yourapi.com/api/customers');

    const bookingTableBody = document.getElementById('booking-requests');
    bookingTableBody.innerHTML = '';

    if (Array.isArray(bookingData) && bookingData.length > 0) {
        bookingData.forEach(booking => {
            const car = carData.find(c => c.carId === booking.rentalCarId);
            const customer = customerData.find(cust => cust.customerId === booking.customerId);

            const bookingRow = document.createElement('tr');
            bookingRow.innerHTML = `
                <td>${booking.paymentId || 'N/A'}</td>
                <td>${new Date(booking.paymentDate).toLocaleDateString() || 'N/A'}</td>
                <td>${customer ? customer.customerId : 'N/A'}</td>
                <td>${booking.rentalCarId || 'N/A'}</td>
                <td>${booking.bookingAmount || '0'}</td>
                <td>${car ? new Date(car.bookingStartDate).toLocaleDateString() : 'N/A'}</td>
                <td>${car ? new Date(car.bookingEndDate).toLocaleDateString() : 'N/A'}</td>
                <td>${booking.paymentStatus || 'Pending'}</td>
                <td>
                    <button class="action-button approve" onclick="updateBookingStatus('${booking.paymentId}', 'Approved')">Approve</button>
                    <button class="action-button reject" onclick="updateBookingStatus('${booking.paymentId}', 'Rejected')">Reject</button>
                    <button class="action-button view" onclick="openBookingModal('${booking.paymentId}')">View Details</button>
                </td>
                <td>
                    <button class="rentalBtn" onclick="openRentalModal('${booking.paymentId}')">Rental</button>
                </td>
            `;
            bookingTableBody.appendChild(bookingRow);
        });
    } else {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="10">No booking requests available.</td>`;
        bookingTableBody.appendChild(row);
    }
}

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch data');
    return await response.json();
}

async function openRentalModal(bookingId) {
    const bookingData = await fetchData('https://yourapi.com/api/bookings');
    const carData = await fetchData('https://yourapi.com/api/cars');
    const customerData = await fetchData('https://yourapi.com/api/customers');

    const booking = bookingData.find(b => b.paymentId === bookingId);
    const car = carData.find(c => c.carId === booking.rentalCarId);
    const customer = customerData.find(cust => cust.customerId === booking.customerId);

    if (booking && car && customer) {
        document.getElementById('modalBookingId').textContent = booking.paymentId;
        document.getElementById('modalCustomerName').textContent = customer.customerName;
        document.getElementById('modalCarModel').textContent = car.model;

        const modal = document.getElementById("rentalModal");
        modal.style.display = "block";

        document.querySelector(".close-rental-modal").onclick = () => {
            modal.style.display = "none";
        };

        document.getElementById('confirmRental').onclick = async () => {
            const rentalStartDate = document.getElementById('rentalStartDate').value;
            const halfPayment = document.getElementById('halfPayment').value;

            if (!rentalStartDate || !halfPayment) {
                alert("Please enter all required fields.");
                return;
            }

            const rentalDetails = {
                bookingId: booking.paymentId,
                customerId: customer.customerId,
                rentalCarId: booking.rentalCarId,
                bookingAmount: booking.bookingAmount,
                paymentStatus: booking.paymentStatus || 'Pending',
                rentalDateFrom: rentalStartDate,
                halfPayment: halfPayment
            };

            await fetch('https://yourapi.com/api/rentals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rentalDetails)
            });

            const rentalButton = document.querySelector(`.rentalBtn[onclick="openRentalModal('${booking.paymentId}')"]`);
            if (rentalButton) {
                rentalButton.textContent = 'Rented';
                rentalButton.disabled = true;
            }

            modal.style.display = "none";
            loadBookingDetails();
        };
    }
}

async function updateBookingStatus(paymentId, status) {
    await fetch(`https://yourapi.com/api/bookings/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status })
    });
    loadBookingDetails();
}

async function openBookingModal(bookingId) {
    const bookingData = await fetchData('https://yourapi.com/api/bookings');
    const carData = await fetchData('https://yourapi.com/api/cars');
    const customerData = await fetchData('https://yourapi.com/api/customers');

    const booking = bookingData.find(b => b.paymentId === bookingId);
    const car = carData.find(c => c.carId === booking.rentalCarId);
    const customer = customerData.find(cust => cust.customerId === booking.customerId);

    if (booking && car && customer) {
        document.getElementById('bookingId').textContent = booking.paymentId;
        document.getElementById('bookingDate').textContent = new Date(booking.paymentDate).toLocaleDateString();
        document.getElementById('customerid').textContent = customer.customerId;
        document.getElementById('name').textContent = customer.customerName;
        document.getElementById('rentalCarId').textContent = booking.rentalCarId;
        document.getElementById('email').textContent = customer.customerEmail;
        document.getElementById('phone').textContent = customer.customerPhone;
        document.getElementById('address').textContent = customer.customerAddress;
        document.getElementById('license-number').textContent = customer.licenseNumber;
        document.getElementById('paymentAmount').textContent = booking.bookingAmount;
        document.getElementById('paymentStatus').textContent = booking.paymentStatus;
        document.getElementById('proof-type').textContent = customer.proofType;
        document.getElementById('proof-number').textContent = customer.proofNumber;
        document.getElementById('brand').textContent = car.brand;
        document.getElementById('model').textContent = car.model;
        document.getElementById('fuel').textContent = car.fuel;
        document.getElementById('seats').textContent = car.seats;
        document.getElementById('price').textContent = car.totalPrice;
        document.getElementById('availableFrom').textContent = new Date(car.bookingStartDate).toLocaleDateString();
        document.getElementById('availableTo').textContent = new Date(car.bookingEndDate).toLocaleDateString();
    }

    const modal = document.getElementById("myModal");
    modal.style.display = "block";

    document.querySelector(".close").onclick = () => {
        modal.style.display = "none";
    };
}

window.onload = loadBookingDetails;











// function loadBookingDetails() {
//     const bookingData = JSON.parse(localStorage.getItem('bookingCarPayment')) || [];
//     const carData = JSON.parse(localStorage.getItem('bookingCar')) || [];
//     const customerData = JSON.parse(localStorage.getItem('userProfileData')) || [];

//     const bookingTableBody = document.getElementById('booking-requests');
//     bookingTableBody.innerHTML = '';

//     if (Array.isArray(bookingData) && bookingData.length > 0) {
//         bookingData.forEach(booking => {
//             const car = carData.find(c => c.carId === booking.rentalCarId);
//             const customer = customerData.find(cust => cust.customerId === booking.customerId);

//             const bookingRow = document.createElement('tr');
//             bookingRow.innerHTML = `
//                 <td>${booking.paymentId || 'N/A'}</td>
//                 <td>${new Date(booking.paymentDate).toLocaleDateString() || 'N/A'}</td>
//                 <td>${customer ? customer.customerId : 'N/A'}</td>
//                 <td>${booking.rentalCarId || 'N/A'}</td>
//                 <td>${booking.bookingAmount || '0'}</td>
//                 <td>${car ? new Date(car.bookingStartDate).toLocaleDateString() : 'N/A'}</td>
//                 <td>${car ? new Date(car.bookingEndDate).toLocaleDateString() : 'N/A'}</td>
//                 <td>${booking.paymentStatus || 'Pending'}</td>
//                 <td>
//                     <button class="action-button approve" onclick="updateBookingStatus('${booking.paymentId}', 'Approved')">Approve</button>
//                     <button class="action-button reject" onclick="updateBookingStatus('${booking.paymentId}', 'Rejected')">Reject</button>
//                     <button class="action-button view" onclick="openBookingModal('${booking.paymentId}')">View Details</button>
//                 </td>
//                 <td>
//                     <button class="rentalBtn" onclick="openRentalModal('${booking.paymentId}')">Rental</button>
//                 </td>
//             `;
//             bookingTableBody.appendChild(bookingRow);
//         });
//     } else {
//         const row = document.createElement('tr');
//         row.innerHTML = `<td colspan="10">No booking requests available.</td>`;
//         bookingTableBody.appendChild(row);
//     }
// }

// function openRentalModal(bookingId) {
//     const bookingData = JSON.parse(localStorage.getItem('bookingCarPayment')) || [];
//     const carData = JSON.parse(localStorage.getItem('bookingCar')) || [];
//     const customerData = JSON.parse(localStorage.getItem('userProfileData')) || [];

//     const booking = bookingData.find(b => b.paymentId === bookingId);
//     const car = carData.find(c => c.carId === booking.rentalCarId);
//     const customer = customerData.find(cust => cust.customerId === booking.customerId);

//     if (booking && car && customer) {
//         document.getElementById('modalBookingId').textContent = booking.paymentId;
//         document.getElementById('modalCustomerName').textContent = customer.customerName;
//         document.getElementById('modalCarModel').textContent = car.model;

//         const modal = document.getElementById("rentalModal");
//         modal.style.display = "block";

//         const closeRentalModalBtn = document.querySelector(".close-rental-modal");
//         closeRentalModalBtn.onclick = () => {
//             modal.style.display = "none";
//         };

//         document.getElementById('confirmRental').onclick = () => {
//             const rentalStartDate = document.getElementById('rentalStartDate').value;
//             const halfPayment = document.getElementById('halfPayment').value;
//             const existingRentalDetails = JSON.parse(localStorage.getItem('rentalCarDetail')) || [];


//             if (!rentalStartDate || !halfPayment) {
//                 alert("Please enter all required fields."); 
//                 return; 
//             }

//             const rentalDetails = {
//                 bookingId: booking.paymentId,
//                 customerId: customer.customerId,
//                 rentalCarId: booking.rentalCarId,
//                 bookingAmount: booking.bookingAmount,
//                 paymentStatus: booking.paymentStatus || 'Pending',
//                 availableFrom: new Date(car.bookingStartDate).toLocaleDateString(),
//                 availableTo: new Date(car.bookingEndDate).toLocaleDateString(),
//                 rentalDateFrom: rentalStartDate,
//                 halfPayment: halfPayment
//             };

//             existingRentalDetails.push(rentalDetails);
//             localStorage.setItem('rentalCarDetail', JSON.stringify(existingRentalDetails));

//             const rentalButton = document.querySelector(`.rentalBtn[onclick="openRentalModal('${booking.paymentId}')"]`);
//             if (rentalButton) { 
//                 rentalButton.textContent = 'Rented';
//                 rentalButton.disabled = true; 
//             }

//             modal.style.display = "none"; 
//             loadBookingDetails(); 
//         };
//     }
// }

// function updateBookingStatus(paymentId, status) {
//     const bookingData = JSON.parse(localStorage.getItem('bookingCarPayment')) || [];
//     const booking = bookingData.find(b => b.paymentId === paymentId);
    
//     if (booking) {
//         booking.paymentStatus = status || 'Pending';
//         localStorage.setItem('bookingCarPayment', JSON.stringify(bookingData));
//         loadBookingDetails(); 
//     }
// }

// function openBookingModal(bookingId) {
//     const bookingData = JSON.parse(localStorage.getItem('bookingCarPayment')) || [];
//     const carData = JSON.parse(localStorage.getItem('bookingCar')) || [];
//     const customerData = JSON.parse(localStorage.getItem('userProfileData')) || [];

//     const booking = bookingData.find(b => b.paymentId === bookingId);
//     const car = carData.find(c => c.carId === booking.rentalCarId);
//     const customer = customerData.find(cust => cust.customerId === booking.customerId);

//     if (booking && car && customer) {
//         document.getElementById('bookingId').textContent = booking.paymentId;
//         document.getElementById('bookingDate').textContent = new Date(booking.paymentDate).toLocaleDateString();
//         document.getElementById('customerid').textContent = customer.customerId;
//         document.getElementById('name').textContent = customer.customerName;
//         document.getElementById('rentalCarId').textContent = booking.rentalCarId;
//         document.getElementById('email').textContent = customer.customerEmail;
//         document.getElementById('phone').textContent = customer.customerPhone;
//         document.getElementById('address').textContent = customer.customerAddress;
//         document.getElementById('license-number').textContent = customer.licenseNumber;
//         document.getElementById('paymentAmount').textContent = booking.bookingAmount;
//         document.getElementById('paymentStatus').textContent = booking.paymentStatus;
//         document.getElementById('proof-type').textContent = customer.proofType;
//         document.getElementById('proof-number').textContent = customer.proofNumber;
//         document.getElementById('brand').textContent = car.brand;
//         document.getElementById('model').textContent = car.model;
//         document.getElementById('fuel').textContent = car.fuel;
//         document.getElementById('seats').textContent = car.seats;
//         document.getElementById('price').textContent = car.totalPrice;
//         document.getElementById('availableFrom').textContent = new Date(car.bookingStartDate).toLocaleDateString();
//         document.getElementById('availableTo').textContent = new Date(car.bookingEndDate).toLocaleDateString();
//     }

//     const modal = document.getElementById("myModal");
//     modal.style.display = "block";

//     const closeBtn = document.querySelector(".close");
//     closeBtn.onclick = () => {
//         modal.style.display = "none";
//     };
// }

// window.onload = loadBookingDetails;
