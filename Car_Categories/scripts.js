document.addEventListener('DOMContentLoaded', () => {
    let carDetailsArray = JSON.parse(localStorage.getItem('bookingCar')) || [];

    const fetchCars = async () => {
        const response = await fetch('http://localhost:5255/api/Manager/get-all-cars'); // Replace with your API endpoint
        return response.ok ? await response.json() : [];
    };

    const saveBookingToLocalStorage = () => {
        localStorage.setItem('bookingCar', JSON.stringify(carDetailsArray));
    };

    const displayCars = (cars) => {
        const carList = document.getElementById('car-list');
        carList.innerHTML = '';
        cars.forEach(car => {
            const carDiv = document.createElement('div');
            carDiv.classList.add('car');
            carDiv.innerHTML = `
                <img src="${car.image}" alt="${car.model}">
                <h3>${car.brand} ${car.model}</h3>
                <p>${car.transmission} - ${car.fuel} - ${car.seats} Seats</p>
                <p>Pricing from Rs.${car.price}/hr</p>
                <button class="view-button">View</button>
            `;
            carDiv.querySelector('.view-button').addEventListener('click', () => {
                showCarDetails(car);
                scrollToTop();
            });
            carList.appendChild(carDiv);
        });
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const calculateTotalHours = (startDateTime, endDateTime) => {
        return Math.abs(endDateTime - startDateTime) / 36e5; 
    };

    const showCarDetails = (car) => {
        const carDetailsDiv = document.getElementById('car-details');
        const startDate = document.getElementById('start-date').value;
        const startTime = document.getElementById('start-time').value;
        const endDate = document.getElementById('end-date').value;
        const endTime = document.getElementById('end-time').value;

        if (!startDate || !startTime || !endDate || !endTime) {
            carDetailsDiv.innerHTML = "Please select both start and end dates and times.";
            return;
        }

        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);
        const totalHours = calculateTotalHours(startDateTime, endDateTime);
        const totalPrice = totalHours * car.price;

        const carDetails = {
            carId: car.id,
            brand: car.brand,
            model: car.model,
            image: car.image,
            transmission: car.transmission,
            fuel: car.fuel,
            seats: car.seats,
            hourlyRate: car.price,
            bookingStartDate: startDateTime.toISOString().slice(0, -5),
            bookingEndDate: endDateTime.toISOString().slice(0, -5),
            totalHours: totalHours.toFixed(2),
            totalPrice: totalPrice.toFixed(2)
        };

        carDetailsArray.push(carDetails);
        saveBookingToLocalStorage();

        carDetailsDiv.innerHTML = `
            <h2>${car.brand} ${car.model}</h2>
            <img src="${car.image}" alt="${car.model}" style="width: 300px; height: auto;">
            <p><strong>Transmission:</strong> ${car.transmission}</p>
            <p><strong>Fuel:</strong> ${car.fuel}</p>
            <p><strong>Seats:</strong> ${car.seats}</p>
            <p><strong>Price:</strong> Rs.${car.price}/hr</p>
            <p><strong>Rental Start Date:</strong> ${startDateTime.toLocaleString()}</p>
            <p><strong>Rental End Date:</strong> ${endDateTime.toLocaleString()}</p>
            <p><strong>Total Hours:</strong> ${totalHours.toFixed(2)} hours</p>
            <p><strong>Total Price:</strong> Rs.${totalPrice.toFixed(2)}</p>
            <button id="ContinueBooking">Continue</button>
        `;

        carDetailsDiv.classList.remove('hidden');
        carDetailsDiv.style.display = 'block';

        document.getElementById('ContinueBooking').addEventListener('click', () => {
            const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
            const isLoggedIn = loggedUser !== null;

            if (isLoggedIn) {
                const customers = JSON.parse(localStorage.getItem('userProfileData')) || [];
                let customer = customers.find(p => p.customerNicnumber === loggedUser.customerNicnumber);

                if (customer) {
                    window.location.href = `../Profile_Details/profileupdateform.html?carid=${car.id}&customerid=${customer.customerId}`;
                } else {
                    console.error('Customer not found');
                    alert('Customer information not found. Please contact support.');
                }
            } else {
                window.location.href = `../Customer_login/login.html?carid=${car.id}`;
            }
        });
    };

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

        fetchCars().then((carsData) => {
            const filteredCars = carsData.filter(car => {
                const carAvailableFrom = new Date(car.availableFrom);
                const carAvailableTo = new Date(car.availableTo);

                return (!brand || car.brand === brand) &&
                    (!bodyType || car.bodyType === bodyType) &&
                    (!transmission || car.transmission === transmission) &&
                    (!fuelType || car.fuel === fuelType) &&
                    (!seatsnumber || car.seats === seatsnumber) &&
                    (selectedPrice === 'all' || car.price === parseInt(selectedPrice, 10)) &&
                    (carAvailableFrom <= end && carAvailableTo >= start);
            });

            displayCars(filteredCars);
        });
    });

    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', () => {
        const startDate = document.getElementById('start-date').value;
        const startTime = document.getElementById('start-time').value;
        const endDate = document.getElementById('end-date').value;
        const endTime = document.getElementById('end-time').value;

        if (!startDate || !startTime || !endDate || !endTime) {
            document.getElementById('demo').innerHTML = "Please select both start and end dates and times.";
            return;
        }

        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);

        if (start > end) {
            document.getElementById('demo').innerHTML = "End date and time cannot be earlier than start date and time.";
            return;
        }

        fetchCars().then((carsData) => {
            const filteredCars = carsData.filter(car => {
                const carAvailableFrom = new Date(car.availableFrom);
                const carAvailableTo = new Date(car.availableTo);

                return carAvailableFrom <= end && carAvailableTo >= start;
            });

            if (filteredCars.length > 0) {
                displayCars(filteredCars);
            } else {
                document.getElementById('demo').innerHTML = "No cars available for the selected dates.";
                displayCars([]);
            }
        });
    });

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('start-date').setAttribute('min', today);
    document.getElementById('end-date').setAttribute('min', today);
});



















// document.addEventListener('DOMContentLoaded', () => {
//     let carDetailsArray = JSON.parse(localStorage.getItem('bookingCar')) || [];

//     const getCarsFromLocalStorage = () => {
//         const storedCars = localStorage.getItem('cars');
//         return storedCars ? JSON.parse(storedCars) : [];
//     };

//     const saveCarDetailsToLocalStorage = () => {
//         localStorage.setItem('bookingCar', JSON.stringify(carDetailsArray));
//     };

//     const displayCars = (cars) => {
//         const carList = document.getElementById('car-list');
//         carList.innerHTML = '';
//         cars.forEach(car => {
//             const carDiv = document.createElement('div');
//             carDiv.classList.add('car');
//             carDiv.innerHTML = `
//                 <img src="${car.image}" alt="${car.model}">
//                 <h3>${car.brand} ${car.model}</h3>
//                 <p>${car.transmission} - ${car.fuel} - ${car.seats} Seats</p>
//                 <p>Pricing from Rs.${car.price}/hr</p>
//                 <button class="view-button">View</button>
//             `;
//             carDiv.querySelector('.view-button').addEventListener('click', () => {
//                 showCarDetails(car);
//                 scrollToTop();
//             });
//             carList.appendChild(carDiv);
//         });
//     };

//     const scrollToTop = () => {
//         window.scrollTo({
//             top: 0,
//             behavior: 'smooth'
//         });
//     };

//     const calculateTotalHours = (startDateTime, endDateTime) => {
//         return Math.abs(endDateTime - startDateTime) / 36e5; 
//     };

//     const showCarDetails = (car) => {
//         const carDetailsDiv = document.getElementById('car-details');
//         const startDate = document.getElementById('start-date').value;
//         const startTime = document.getElementById('start-time').value;
//         const endDate = document.getElementById('end-date').value;
//         const endTime = document.getElementById('end-time').value;

//         if (!startDate || !startTime || !endDate || !endTime) {
//             carDetailsDiv.innerHTML = "Please select both start and end dates and times.";
//             return;
//         }

//         const startDateTime = new Date(`${startDate}T${startTime}`);
//         const endDateTime = new Date(`${endDate}T${endTime}`);
//         const totalHours = calculateTotalHours(startDateTime, endDateTime);
//         const totalPrice = totalHours * car.price;

//         // Get ID from local storage
//         const carsData = getCarsFromLocalStorage();
//         const carId = carsData.find(c => c.brand === car.brand && c.model === car.model).id; // Get the ID based on car's brand and model

//         const carDetails = {
//             carId: carId, // Use the retrieved car ID
//             brand: car.brand,
//             model: car.model,
//             image: car.image,
//             transmission: car.transmission,
//             fuel: car.fuel,
//             seats: car.seats,
//             hourlyRate: car.price, 
//             bookingStartDate: startDateTime.toISOString().slice(0, -5), 
//             bookingEndDate: endDateTime.toISOString().slice(0, -5), 
//             totalHours: totalHours.toFixed(2),
//             totalPrice: totalPrice.toFixed(2)
//         };

//         carDetailsArray.push(carDetails);
//         saveCarDetailsToLocalStorage();

//         carDetailsDiv.innerHTML = `
//             <h2>${car.brand} ${car.model}</h2>
//             <img src="${car.image}" alt="${car.model}" style="width: 300px; height: auto;">
//             <p><strong>Transmission:</strong> ${car.transmission}</p>
//             <p><strong>Fuel:</strong> ${car.fuel}</p>
//             <p><strong>Seats:</strong> ${car.seats}</p>
//             <p><strong>Price:</strong> Rs.${car.price}/hr</p>
//             <p><strong>Rental Start Date:</strong> ${startDateTime.toLocaleString()}</p>
//             <p><strong>Rental End Date:</strong> ${endDateTime.toLocaleString()}</p>
//             <p><strong>Total Hours:</strong> ${totalHours.toFixed(2)} hours</p>
//             <p><strong>Total Price:</strong> Rs.${totalPrice.toFixed(2)}</p>
//             <button id="ContinueBooking">Continue</button>
//         `;

//         carDetailsDiv.classList.remove('hidden');
//         carDetailsDiv.style.display = 'block';

//         document.getElementById('ContinueBooking').addEventListener('click', () => {
//             const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
//             const isLoggedIn = loggedUser !== null;

//             if (isLoggedIn) {
//                 const customers = JSON.parse(localStorage.getItem('userProfileData')) || [];
//                 let customer = customers.find(p => p.customerNicnumber === loggedUser.customerNicnumber);

//                 if (customer) {
//                     window.location.href = `../Profile_Details/profileupdateform.html?carid=${carId}&customerid=${customer.customerId}`;
//                 } else {
//                     console.error('Customer not found');
//                     alert('Customer information not found. Please contact support.');
//                 }
//             } else {
//                 window.location.href = `../Customer_login/login.html?carid=${carId}`;
//             }
//         });
//     };

//     const carsData = getCarsFromLocalStorage();
//     displayCars(carsData);

//     const filterForm = document.getElementById('filter-form');
//     filterForm.addEventListener('submit', (event) => {
//         event.preventDefault();

//         const brand = filterForm['brand'].value;
//         const bodyType = filterForm['body-type'].value;
//         const transmission = filterForm['transmission'].value;
//         const fuelType = filterForm['fuel-type'].value;
//         const seatsnumber = parseInt(filterForm['seats-number'].value, 10);
//         const selectedPrice = filterForm['price-filter'].value;
//         const startDate = document.getElementById('start-date').value;
//         const endDate = document.getElementById('end-date').value;

//         if (!startDate || !endDate) {
//             document.getElementById('demo').innerHTML = "Please enter valid start and end dates.";
//             return;
//         }

//         const start = new Date(startDate);
//         const end = new Date(endDate);

//         if (start > end) {
//             document.getElementById('demo').innerHTML = "End date cannot be earlier than start date.";
//             return;
//         }

//         const filteredCars = carsData.filter(car => {
//             const carAvailableFrom = new Date(car.availableFrom);
//             const carAvailableTo = new Date(car.availableTo);

//             return (!brand || car.brand === brand) &&
//                 (!bodyType || car.bodyType === bodyType) &&
//                 (!transmission || car.transmission === transmission) &&
//                 (!fuelType || car.fuel === fuelType) &&
//                 (!seatsnumber || car.seats === seatsnumber) &&
//                 (selectedPrice === 'all' || car.price === parseInt(selectedPrice, 10)) &&
//                 (carAvailableFrom <= end && carAvailableTo >= start);
//         });

//         displayCars(filteredCars);
//     });

//     const searchButton = document.getElementById('search-button');
//     searchButton.addEventListener('click', () => {
//         const startDate = document.getElementById('start-date').value;
//         const startTime = document.getElementById('start-time').value;
//         const endDate = document.getElementById('end-date').value;
//         const endTime = document.getElementById('end-time').value;

//         if (!startDate || !startTime || !endDate || !endTime) {
//             document.getElementById('demo').innerHTML = "Please select both start and end dates and times.";
//             return;
//         }

//         const start = new Date(`${startDate}T${startTime}`);
//         const end = new Date(`${endDate}T${endTime}`);

//         if (start > end) {
//             document.getElementById('demo').innerHTML = "End date and time cannot be earlier than start date and time.";
//             return;
//         }

//         const filteredCars = carsData.filter(car => {
//             const carAvailableFrom = new Date(car.availableFrom);
//             const carAvailableTo = new Date(car.availableTo);

//             return carAvailableFrom <= end && carAvailableTo >= start;
//         });

//         if (filteredCars.length > 0) {
//             displayCars(filteredCars);
//         } else {
//             document.getElementById('demo').innerHTML = "No cars available for the selected dates.";
//             displayCars([]);
//         }
//     });

//     const today = new Date().toISOString().split('T')[0];
//     document.getElementById('start-date').setAttribute('min', today);
//     document.getElementById('end-date').setAttribute('min', today);
//     document.addEventListener("DOMContentLoaded", function () {
//         const logoutButton = document.getElementById('logoutButton');

//         logoutButton.addEventListener('click', function (event) {
//             event.preventDefault(); // Prevent the default link behavior
//             localStorage.removeItem('loggedUser'); // Clear the logged user from local storage
//             window.location.href = '../Customer_login/login.html'; // Redirect to login page
//         });
//     });
// });
