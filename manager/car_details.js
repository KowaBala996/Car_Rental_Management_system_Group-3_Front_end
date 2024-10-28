

    const carTableBody = document.querySelector(".car-table tbody");
    const carForm = document.getElementById("carForm");
    const modal = document.getElementById("modal");
    const closeBtn = document.querySelector(".closeBtn");
    const addCarBtn = document.querySelector(".add-car");
    const searchInput = document.getElementById("searchInput");

    let cars = [];
    let editingIndex = -1;


    const getAllCarDetails = 'http://localhost:5255/api/Manager/get-all-cars';
    async function GetAllCarsData(){
        await fetch(getAllCarDetails).then((response) => {
            return response.json();
        }).then((data) => {
            cars = data;
            renderCarss()
            GetLastFullpaymentId();
        });
    }
    GetAllCarsData();

    const addCarApiURL = 'http://localhost:5255/api/Manager/add-car';
    async function AddCar(CarData){
        await fetch(addCarApiURL , {
            method:'POST',
            body:CarData
        })
        GetAllCarsData();
    }

    const deletCarApiURL = 'http://localhost:5255/api/Manager/delete-car/cr04'
    async function DeleteCarFromDatabase(id){
        await fetch(deletCarApiURL + id, {
            method:'DELETE'
        })
        GetAllCarsData();
    }

    const updateApiURL = 'https://localhost:7175/api/Manager/update-car'
    async function UpdateCar(CarData){
        await fetch(updateApiURL, {
            method:'PUT',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(CarData)
        })
    }

    // Function to fetch initial cars from the API
    // async function fetchCars() {
    //     try {
    //         const response = await fetch('https://yourapi.com/cars'); // Replace with your API endpoint
    //         if (!response.ok) throw new Error('Network response was not ok');
    //         cars = await response.json();
    //         renderCars();
    //     } catch (error) {
    //         console.error('Failed to fetch cars:', error);
    //     }
    // }

    // Function to render cars
    function renderCarss() {
        carTableBody.innerHTML = "";
        const searchTerm = searchInput.value.toLowerCase();
        const filteredCars = cars.filter(car => 
            car.brand.toLowerCase().includes(searchTerm) ||
            car.bodyType.toLowerCase().includes(searchTerm) ||
            car.model.toLowerCase().includes(searchTerm)
        );

        filteredCars.forEach((car, index) => {
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
                <td><img src="https://localhost:7175${car.imagePath}" alt="${car.model}" style="width: 100px; height: auto;" /></td>
                <td>${car.availableFrom}</td>
                <td>${car.availableTo}</td>
                <td>
                    <button class="edit-btn" onclick="updateCar('${car.carId}')" >Edit</button>
                    <button class="delete-btn"  onclick="DeleteCar('${car.carId}')">Delete</button>
                </td>
            `;
            carTableBody.appendChild(row);
        });
    }

    function DeleteCar(Id){
        DeleteCarFromDatabase(Id)
    }

    function updateCar(Id){

        
    }
    // Event listener for search input
    // searchInput.addEventListener("input", renderCars);

    // Function to add a new car
    // async function addCar(carData) {
    //     try {
    //         const response = await fetch('https://localhost:7175/api/Manager/add-car', { // Replace with your API endpoint
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(carData)
    //         });
    //         if (!response.ok) throw new Error('Failed to add car');
    //         const newCar = await response.json();
    //         cars.push(newCar);
    //         renderCars();
    //     } catch (error) {
    //         console.error('Error adding car:', error);
    //     }
    // }

    // Event listener for car form submission


    function generateInstallmentID(lastID) {
        let numericPart = parseInt(lastID.slice(1));
        numericPart++;
        let newID = "C" + numericPart.toString().padStart(3, "0");
        return newID;
    }
    
    let lastCarId;
    
    function GetLastFullpaymentId(){
        if(cars.length != 0){
            lastCarId = cars[cars.length - 1].carId
        }else{
            lastCarId = "C000";
        }    
    }


    carForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const id = generateInstallmentID(lastCarId);

        const imagePath = document.getElementById('image').files;

        const formdata = new FormData();
        formdata.append("carId" , id),
        formdata.append("brand" , carForm.brand.value),
        formdata.append("bodyType" , carForm.bodyType.value),
        formdata.append("model" ,  carForm.model.value),
        formdata.append("transmission" , carForm.transmission.value),
        formdata.append("fuelType" ,  carForm.fuelType.value),
        formdata.append("numberOfSeats" , parseInt(carForm.seats.value)),
        formdata.append("pricePerHour" , parseFloat(carForm.price.value)),
        formdata.append("imagePath" , imagePath[0]),
        formdata.append("availableFrom" , carForm.availableFrom.value),
        formdata.append("availableTo" , carForm.availableTo.value)
        AddCar(formdata)
        
        
        // const imageFile = formData.get("image");
        // if (imageFile) {
        //     const reader = new FileReader();
        //     reader.onloadend = async () => {
        //         carData.image = reader.result; // Set the image data to base64 format
        //         if (editingIndex === -1) {
        //             await addCar(carData); // Add new car
        //         } else {
        //             await updateCar(editingIndex, carData); // Update existing car
        //         }
        //         carForm.reset(); // Clear the form
        //         modal.style.display = "none"; // Close the modal
        //     };
        //     reader.readAsDataURL(imageFile);
        // }
    });

    // // Function to update a car
    // async function updateCar(index, carData) {
    //     try {
    //         const response = await fetch(`https://localhost:7175/api/Manager/update-car`, { // Replace with your API endpoint
    //             method: 'PUT',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(carData)
    //         });
    //         if (!response.ok) throw new Error('Failed to update car');
    //         cars[index] = { ...cars[index], ...carData };
    //         renderCars();
    //     } catch (error) {
    //         console.error('Error updating car:', error);
    //     }
    // }

    // // Function to delete a car
    // async function deleteCar(index) {
    //     try {
    //         const response = await fetch(`https://yourapi.com/cars/${cars[index].id}`, { // Replace with your API endpoint
    //             method: 'DELETE'
    //         });
    //         if (!response.ok) throw new Error('Failed to delete car');
    //         cars.splice(index, 1);
    //         renderCars();
    //     } catch (error) {
    //         console.error('Error deleting car:', error);
    //     }
    // }

    // Event delegation for edit and delete buttons
    // carTableBody.addEventListener("click", (e) => {
    //     const index = e.target.dataset.index;
    //     if (e.target.classList.contains("edit-btn")) {
    //         editingIndex = index;
    //         loadCarToForm(cars[index]);
    //         modal.style.display = "block"; // Show modal for editing
    //     } else if (e.target.classList.contains("delete-btn")) {
    //         if (confirm("Are you sure you want to delete this car?")) {
    //             deleteCar(index);
    //         }
    //     }
    // });

    // Load car data into the form for editing
    function loadCarToForm(car) {
        carForm.brand.value = car.brand;
        carForm.bodyType.value = car.bodyType;
        carForm.model.value = car.model;
        carForm.transmission.value = car.transmission;
        carForm.fuel.value = car.fuel;
        carForm.seats.value = car.seats;
        carForm.price.value = car.price;
        carForm.image.value = ""; // Clear file input
        carForm.availableFrom.value = car.availableFrom;
        carForm.availableTo.value = car.availableTo;
    }

    // Show modal when adding a new car
    addCarBtn.addEventListener("click", () => {
        modal.style.display = "block"; // Show modal for adding new car
        editingIndex = -1; // Reset editing index
        carForm.reset(); // Clear the form
    });

    // Close modal
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none"; // Hide the modal
    });

    // Fetch cars on page load
    // fetchCars();
    // loadProfilePicture();


// // Function to load the profile picture
// async function loadProfilePicture() {
//     const nic = 'your-nic-here'; // Replace with the actual NIC you want to load
//     try {
//         const response = await fetch(`https://yourapi.com/profile/${nic}`); // Replace with your API endpoint
//         if (!response.ok) throw new Error('Network response was not ok');
//         const profileData = await response.json();
        
//         const profilePicContainer = document.getElementById('profilepic-container');
//         profilePicContainer.innerHTML = `
//             <h2>Profile Picture:</h2>
//             <img src="${profileData.imagePath}" alt="Profile Picture" style="width: 150px; height: auto;" />
//         `;
//     } catch (error) {
//         console.error('Failed to load profile picture:', error);
//     }
// }
