document.addEventListener('DOMContentLoaded', () => {
    const getAllCarDetails = 'http://localhost:5255/api/Manager/get-all-cars';
    const getAllCustomerDetails = 'http://localhost:5255/api/Customer/Get-All-Customer';
    const bookingCarApiURL = 'http://localhost:5255/api/Booking';

    let cars = [];
    let customers = [];
    

    // Fetch all car details
    async function GetAllCarsData() {
        try {
            const response = await fetch(getAllCarDetails);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            cars = data;
            displayCars(cars);
        } catch (error) {
            console.error('Error fetching car data:', error);
        }
    }

  

    async function GetAllCustomerData() {
        await fetch(getAllCustomerDetails).then(response => response.json())
            .then(data => {
                customers = data;

            })
            .catch(error => console.error('Error fetching cars:', error));
    }

    // Add a booking
    async function AddBooking(carData) {
        try {
            await fetch(bookingCarApiURL, {
                method: 'POST',
                body: carData,
            });
            GetAllCarsData(); // Refresh car data after adding booking
        } catch (error) {
            console.error('Error adding booking:', error);
        }
    }

    let AllBookingPayment = [];
    let getAllBookingCar = [];


    // Load booking details from the API
    async function loadBookingDetails() {
        const getAllBookingPaymentUrl = 'http://localhost:5255/api/BookingPayment';
        const getAllBookingCarDetailsUrl = 'http://localhost:5255/api/Booking';
       
        try {
            // Fetch all booking payment data
            const paymentResponse = await fetch(getAllBookingPaymentUrl);
            if (!paymentResponse.ok) throw new Error(`HTTP error! Status: ${paymentResponse.status}`);
            AllBookingPayment = await paymentResponse.json();

            // Fetch all booking car details
            const carDetailsResponse = await fetch(getAllBookingCarDetailsUrl);
            if (!carDetailsResponse.ok) throw new Error(`HTTP error! Status: ${carDetailsResponse.status}`);
            getAllBookingCar = await carDetailsResponse.json();

          

            // Populate the booking table
            populateBookingTable();
        } catch (error) {
            console.error('Error loading booking details:', error);
        }
    }
    loadBookingDetails();
    getAllBookingCar.forEach(c=>c.bookingId==AllBookingPayment.bookingId)


    // Generate Booking ID
    function generateBookingID() {
        return "B" + Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit random number
    }

    // Display all cars
    const displayCars = (cars) => {
        const carList = document.getElementById('car-list');
        carList.innerHTML = ''; // Clear previous car listings
        cars.forEach(car => {
            const carDiv = document.createElement('div');
            carDiv.classList.add('car');
            carDiv.innerHTML = `
                <img src="http://localhost:5255${car.imagePath}" alt="${car.model}" style="width: 100px; height: auto;" />
                <h3>${car.brand} ${car.model}</h3>
                <p>${car.transmission} - ${car.fuelType} - ${car.numberOfSeats} Seats</p>
                <p>Pricing from Rs.${car.pricePerHour}/hr</p>
                <button class="view-button">View</button>
            `;
            const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));

            const viewButton = carDiv.querySelector('.view-button');

            viewButton.addEventListener('click', () => {
                if (!loggedUser) {
                    window.location.href = `../Customer_login/login.html?`;

                } else {

                    showCarDetails(car);
                    scrollToTop();
                }
            });
            carList.appendChild(carDiv);
        });
    };
    // Scroll to the top when viewing car details
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };
    // Calculate total rental hours
    const calculateTotalHours = (startDateTime, endDateTime) => {
        return Math.abs(endDateTime - startDateTime) / 36e5; // Convert milliseconds to hours
    };
    // Display selected car details and process booking
    const showCarDetails = (car) => {
        const carDetailsDiv = document.getElementById('car-details');
        const startDate = document.getElementById('start-date').value;
        const startTime = document.getElementById('start-time').value;
        const endDate = document.getElementById('end-date').value;
        const endTime = document.getElementById('end-time').value;

        // Ensure all date and time fields are filled
        if (!startDate || !startTime || !endDate || !endTime) {
            carDetailsDiv.innerHTML = "Please select both start and end dates and times.";
            return;
        }

        const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));


        let customer1 = customers.find(p => p.nic === loggedUser.customerNicnumber);

        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);
        const totalHours = calculateTotalHours(startDateTime, endDateTime);
        const totalPrice = totalHours * car.pricePerHour;

        const bookingId = generateBookingID();
        const formData = new FormData();
        formData.append("bookingId", bookingId);
        formData.append("customerId", customer1.id);
        formData.append("carId", car.carId);
        formData.append("startDate", startDateTime.toISOString().slice(0, -5));
        formData.append("endDate", endDateTime.toISOString().slice(0, -5));
        formData.append("totalPrice", totalPrice.toFixed(2));
        formData.append("status", 'booked');
        formData.append("createdDate", new Date().toISOString().slice(0, -5));
        // Add the booking
        AddBooking(formData);

        carDetailsDiv.innerHTML = `
            <h2>${car.brand} ${car.model}</h2>
            <img src="http://localhost:5255${car.imagePath}" alt="${car.model}" style="width: 100px; height: auto;" />
            <p><strong>Transmission:</strong> ${car.transmission}</p>
            <p><strong>Fuel:</strong> ${car.fuelType}</p>
            <p><strong>Seats:</strong> ${car.numberOfSeats}</p>
            <p><strong>Price:</strong> Rs.${car.pricePerHour}/hr</p>
            <p><strong>Rental Start Date:</strong> ${startDateTime.toLocaleString()}</p>
            <p><strong>Rental End Date:</strong> ${endDateTime.toLocaleString()}</p>
            <p><strong>Total Hours:</strong> ${totalHours.toFixed(2)} hours</p>
            <p><strong>Total Price:</strong> Rs.${totalPrice.toFixed(2)}</p>
            <button id="ContinueBooking">Continue</button>
        `;

        carDetailsDiv.style.display = 'block';

        document.getElementById('ContinueBooking').addEventListener('click', () => {
            const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
            console.log(loggedUser)
            const isLoggedIn = loggedUser !== null;

            if (isLoggedIn) {
                let customer1 = customers.find(p => p.nic === loggedUser.customerNicnumber);
                if (customer1.profileStatus = "Verified") {
                    window.location.href = `../Profile_Details/profileupdateform.html?carid=${car.carId}&customerid=${customer1.id}&bookingId=${bookingId}`;
                } else {
                    alert('Customer information not found. Please contact support.');
                }
            } else {
                window.location.href = `../Customer_login/login.html?carid=${car.carId}`;
            }
        });
    };

    // Filter form logic
    const filterForm = document.getElementById('filter-form');
    filterForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const brand = filterForm['brand'].value;
        const bodyType = filterForm['body-type'].value;
        const transmission = filterForm['transmission'].value;
        const fuelType = filterForm['fuel-type'].value;
        const seatsnumber = parseInt(filterForm['seats-number'].value, 10);
        const selectedPrice = filterForm['price-filter'].value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        // Validate start and end dates
        if (!startDate || !endDate) {
            document.getElementById('demo').innerHTML = "Please enter valid start and end dates.";
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            document.getElementById('demo').innerHTML = "End date cannot be earlier than start date.";
            return;
        }

        const filteredCars = cars.filter(car => {
            const carAvailableFrom = new Date(car.availableFrom);
            const carAvailableTo = new Date(car.availableTo);

            return (!brand || car.brand === brand) &&
                (!bodyType || car.bodyType === bodyType) &&
                (!transmission || car.transmission === transmission) &&
                (!fuelType || car.fuelType === fuelType) &&
                (!seatsnumber || car.numberOfSeats === seatsnumber) &&
                (selectedPrice === 'all' || car.pricePerHour === parseInt(selectedPrice, 10)) &&
                (carAvailableFrom <= end && carAvailableTo >= start);
        });

        displayCars(filteredCars);
    });

    // Search button logic
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', () => {
        const startDate = document.getElementById('start-date').value;
        const startTime = document.getElementById('start-time').value;
        const endDate = document.getElementById('end-date').value;
        const endTime = document.getElementById('end-time').value;

        if (!startDate || !startTime || !endDate || !endTime) {
            alert("Please select both start and end dates and times.");
            return;
        }

        GetAllCarsData();
    });

    // Call fetch functions
    GetAllCarsData();
    GetAllCustomerData();
});
