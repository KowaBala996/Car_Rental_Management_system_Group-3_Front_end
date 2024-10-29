document.addEventListener("DOMContentLoaded", function () {
    const closeButton = document.querySelector(".close-button");
    const loginInfo = document.querySelector(".login-info");
    const loginForm = document.querySelector(".login-form");
    const registerLink = document.getElementById("registerLink");

    closeButton.addEventListener("click", () => {
        loginInfo.style.display = "none";
    });

    function encryption(password) {
        // Base64 encoding is not a secure encryption method for passwords
        return btoa(password); // For demonstration purposes; consider stronger encryption for production
    }

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const carId = getQueryParam('carid');

    // Update register link if carId is present in the URL parameters
    if (carId) {
        registerLink.href = `../Customer_Register/Register.html?carid=${carId}`;
    }

    // Fetch customer data from the API
    async function GetAllCustomerData() {
        const getAllCarDetails = 'http://localhost:5255/api/Customer/Get-All-Customer';
        let cusAll = [];
        try {
            const response = await fetch(getAllCarDetails);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            cusAll = data;
        } catch (error) {
            console.error('Error fetching customer data:', error);
        }
        return cusAll;
    }

    // Login form submission event listener
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const Nic = document.getElementById("nic").value.trim();
        const Password = encryption(document.getElementById("password").value); // Encrypt password for comparison
        console.log(Password)

        // Validate that NIC and password fields are not empty
        if (!Nic || !Password) {
            document.getElementById('demo1').innerHTML = "NIC or Password cannot be empty.";
            return;
        }

        // Fetch customer data
        const cusAll = await GetAllCustomerData();

        // Check for a matching customer with the provided NIC and password
        let customer = cusAll.find(c => c.nic === Nic && c.password === Password);

        if (customer) {
            document.getElementById('demo1').innerHTML = "Login successful! Redirecting...";
            document.getElementById('logincontinue').style.display = "none";
            document.getElementById('deleteX').style.display = "none";

            // Delay for 100 milliseconds before redirecting
            setTimeout(() => {
                const loggedUser = { "customerNicnumber": customer.nic, "password": customer.password };
                localStorage.setItem('loggedUser', JSON.stringify(loggedUser));

                // Redirect based on verification status and carId presence
                if (!carId && customer.profileStatus === "Verified") {
                    window.location.href = `../Car_Categories/get-car.html`;
                } else {
                    if (customer.profileStatus === "Verified") {
                        window.location.href = `../Verified_Customer/Verified_Customer.html?carid=${carId}&customerid=${customer.id}`;
                    } else {
                        window.location.href = `../Profile_Details/profileupdateform.html?carid=${carId}&customerid=${customer.id}`;
                    }
                }
            }, 100); // Adjust the time as needed

        } else {
            document.getElementById('demo1').innerHTML = "Incorrect NIC or password.";
            document.getElementById('logincontinue').style.display = "none";
            document.getElementById('deleteX').style.display = "none";
        }

        // Clear the form fields after submission
        event.target.reset();
    });
});
