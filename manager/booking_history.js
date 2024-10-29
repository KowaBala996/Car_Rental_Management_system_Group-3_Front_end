document.addEventListener("DOMContentLoaded", () => {
    const bookingHistoryTable = document.getElementById("booking-history");

    async function loadBookingHistory() {
        let RentalDetails = [];
        let AllBookingPayment = [];
        let getAllBookingCar = [];
        let customers = [];
    
      

        const getAllRentalDetails = 'http://localhost:5255/api/RentalDetail';
        const getAllBookingPayment = 'http://localhost:5255/api/BookingPayment';
        const getAllBookingCarDetails = 'http://localhost:5255/api/Booking';
        const getAllCustomerDetails = 'http://localhost:5255/api/Customer/Get-All-Customer';


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

        // Fetch booking payment details
        async function GetAllBookingPayment() {
            try {
                const response = await fetch(getAllBookingPayment);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                AllBookingPayment = await response.json();
            } catch (error) {
                console.error('Error fetching booking payment data:', error);
            }
        }

        // Fetch booking car details
        async function GetAllBookingCarDetails() {
            try {
                const response = await fetch(getAllBookingCarDetails);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                getAllBookingCar = await response.json();
            } catch (error) {
                console.error('Error fetching booking car data:', error);
            }
        }
        async function GetAllCustomerData() {
            try {
                const response = await fetch(getAllCustomerDetails);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                customers = data; 
            } catch (error) {
                console.error('Error fetching customer data:', error);
            }
           
    
        }

        // Execute fetch functions in sequence
        await GetAllRentalData();
        await GetAllBookingPayment();
        await GetAllBookingCarDetails();
        await GetAllCustomerData();

        // Populate the booking history table
        if (Array.isArray(RentalDetails) && RentalDetails.length > 0) {
            RentalDetails.forEach(rentalCarDetail => {
                const BookingCar = getAllBookingCar.find(b => b.bookingId === rentalCarDetail.bookingId) ||[];
                const customer = customers.find(c => c.id ===BookingCar.customerId) || [];

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${rentalCarDetail.bookingId || 'N/A'}</td>
                    <td>${rentalCarDetail.rentalId || 'N/A'}</td>
                    <td>${customer.id || 'N/A'}</td>
                    <td>${rentalCarDetail.rentalDate || 'N/A'}</td>
                    <td>${BookingCar.startDate || 'N/A'}</td>
                    <td>${BookingCar.endDate || 'N/A'}</td>
                    <td>${rentalCarDetail.fullPayment || '0'}</td>
                    <td>${rentalCarDetail.status || 'Pending'}</td>
                    <td>${(rentalCarDetail.status === "Approved") ? "Confirmed" : "Pending"}</td>
                `;
                bookingHistoryTable.appendChild(row);
            });
        } else {
            // If there is no booking history, show a message
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="9">No booking history available.</td>`;
            bookingHistoryTable.appendChild(row);
        }
    }

    // Call the function to load the booking history when the page is loaded
    loadBookingHistory();
});
