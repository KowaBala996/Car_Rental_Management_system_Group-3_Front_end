const carTableBody = document.querySelector(".car-table tbody");
const carForm = document.getElementById("carForm");
const modal = document.getElementById("modal");
const closeBtn = document.querySelector(".closeBtn");
const addCarBtn = document.querySelector(".add-car");
const searchInput = document.getElementById("searchInput");

let cars = [];
let editingIndex = -1;
let lastCarId = "C000";

const getAllCarDetails = 'http://localhost:5255/api/Manager/get-all-cars';
const addCarApiURL = 'http://localhost:5255/api/Manager/add-car';
const deletCarApiURL = 'http://localhost:5255/api/Manager/delete-car/';
const updateApiURL = 'http://localhost:5255/api/Manager/update-car';

// Fetch and render all cars on page load
async function GetAllCarsData() {
    await fetch(getAllCarDetails).then(response => response.json())
        .then(data => {
            cars = data;
            renderCars();
            GetLastCarId();
        })
        .catch(error => console.error('Error fetching cars:', error));
}

GetAllCarsData();

// Render cars in the table
function renderCars() {
    carTableBody.innerHTML = "";
    const searchTerm = searchInput.value.toLowerCase();
    const filteredCars = cars.filter(car =>
        car.brand.toLowerCase().includes(searchTerm) ||
        car.bodyType.toLowerCase().includes(searchTerm) ||
        car.model.toLowerCase().includes(searchTerm)
    );

    filteredCars.forEach(car => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${car.carId}</td>
            <td>${car.brand}</td>
            <td>${car.bodyType}</td>
            <td>${car.model}</td>
            <td>${car.transmission}</td>
            <td>${car.fuelType}</td>
            <td>${car.numberOfSeats}</td>
            <td>Rs ${car.pricePerHour}</td>
            <td><img src="http://localhost:5255${car.imagePath}" alt="${car.model}" style="width: 100px; height: auto;" /></td>
            <td>${car.availableFrom}</td>
            <td>${car.availableTo}</td>
            <td>
                <button class="edit-btn" onclick="updateCar('${car.carId}')">Edit</button>
                <button class="delete-btn" onclick="DeleteCar('${car.carId}')">Delete</button>
            </td>
        `;
        carTableBody.appendChild(row);
    });
}

// Add new car to the database
async function AddCar(formData) {
    await fetch(addCarApiURL, {
        method: 'POST',
        body: formData
    });
    GetAllCarsData();
}

// Delete car from the database
async function DeleteCarFromDatabase(id) {
    await fetch(deletCarApiURL + id, {
        method: 'DELETE'
    });
    GetAllCarsData();
}

// Update existing car in the database
async function UpdateCar(formData) {
    await fetch(updateApiURL, {
        method: 'PUT',
        body: formData
    });
    GetAllCarsData();
}

// Delete car handler
function DeleteCar(id) {
    DeleteCarFromDatabase(id);
}

// Open modal and load car details for editing
function updateCar(id) {
    const editCar = cars.find(c => c.carId === id);
    if (editCar) {
        editingIndex = cars.indexOf(editCar);
        modal.style.display = "block";
        carForm.brand.value = editCar.brand;
        carForm.bodyType.value = editCar.bodyType;
        carForm.model.value = editCar.model;
        carForm.transmission.value = editCar.transmission;
        carForm.fuelType.value = editCar.fuelType;
        carForm.seats.value = parseInt(editCar.numberOfSeats);
        carForm.price.value = editCar.pricePerHour;
        carForm.availableFrom.value = editCar.availableFrom;
        carForm.availableTo.value = editCar.availableTo;
    }
}

// Handle form submission for adding/updating car
carForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const carId = generateCarID(lastCarId);
    const imagePath = document.getElementById('image').files[0];

    const formData = new FormData();
    formData.append("carId", carId);
    formData.append("brand", carForm.brand.value);
    formData.append("bodyType", carForm.bodyType.value);
    formData.append("model", carForm.model.value);
    formData.append("transmission", carForm.transmission.value);
    formData.append("fuelType", carForm.fuelType.value);
    formData.append("numberOfSeats", parseInt(carForm.seats.value));
    formData.append("pricePerHour", parseFloat(carForm.price.value));
    formData.append("imagePath", imagePath);
    formData.append("availableFrom", carForm.availableFrom.value);
    formData.append("availableTo", carForm.availableTo.value);

    if (editingIndex === -1) {
        await AddCar(formData); // Add new car
    } else {
        await UpdateCar(formData); // Update existing car
        editingIndex = -1;
    }
    carForm.reset();
    modal.style.display = "none";
});

// Search filter
searchInput.addEventListener("input", renderCars);

// Generate a new Car ID based on the last ID
function generateCarID(lastID) {
    let numericPart = parseInt(lastID.slice(1));
    numericPart++;
    let newID = "C" + numericPart.toString().padStart(3, "0");
    return newID;
}

// Get the last car ID from the cars array
function GetLastCarId() {
    if (cars.length != 0) {
        lastCarId = cars[cars.length - 1].carId;
    } else {
        lastCarId = "C000";
    }
}

// Show modal for adding a new car
addCarBtn.addEventListener("click", () => {
    modal.style.display = "block";
    editingIndex = -1;
    carForm.reset();
});

// Close modal
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

