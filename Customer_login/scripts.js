document.addEventListener("DOMContentLoaded", function () {
    const closeButton = document.querySelector(".close-button");
    const loginInfo = document.querySelector(".login-info");
    const loginForm = document.querySelector(".login-form");
    const registerLink = document.getElementById("registerLink");

    // Close login info display
    closeButton.addEventListener("click", () => {
        loginInfo.style.display = "none";
    });


    async function loginUser() {
        const username = document.getElementById('nic').value;
        const password = document.getElementById('password').value;

        const response = await fetch('http://localhost:5255/api/Customer/Get-All-Customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nic, password })
        });

        const result = await response.json();
        alert(result.message || result.error);
    }



    // Function to encrypt the password
    function encryption(password) {
        return btoa(password); // Base64 encoding for demonstration; use a stronger method for production
    }

    // Function to get query parameters from the URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const carId = getQueryParam('carid');

    // Update register link if carId is present
    if (carId) {
        registerLink.href = `../Customer_Register/Register.html?carid=${carId}`;
    }

    // Login form submission event listener
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nic = document.getElementById("nic").value.trim();
        const password = encryption(document.getElementById("password").value); // Encrypt password for comparison

        // Validate that NIC and password fields are not empty
        if (!nic || !password) {
            document.getElementById('demo1').innerHTML = "NIC or Password cannot be empty.";
            return;
        }

        // Prepare the request URL with query parameters
        const requestUrl = `https://localhost:7175/api/Customer/Get-All-Customer`;

        try {
            // Send a GET request to the login API endpoint
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Check if the response is ok (status code 200-299)
            if (!response.ok) {
                throw new Error('Failed to retrieve customers');
            }

            // Get the response data (all customers)
            const customers = await response.json();

            // Find the customer with matching NIC and encrypted password
            const customer = customers.find(c => c.customerNicnumber === nic && c.password === password);

            if (customer) {
                document.getElementById('demo1').innerHTML = "Login successful! Redirecting...";
                document.getElementById('logincontinue').style.display = "none";
                document.getElementById('deleteX').style.display = "none";

                // Delay for 100 milliseconds before redirecting
                setTimeout(() => {
                    const loggedUser = { "customerNicnumber": customer.customerNicnumber, "password": customer.password };
                    localStorage.setItem('loggedUser', JSON.stringify(loggedUser));

                    // Redirect based on verification status and carId presence
                    if (!carId && customer.profileStatus === "Verified") {
                        window.location.href = `../Landing_Page/index.html`;
                    } else {
                        if (customer.profileStatus === "Verified") {
                            window.location.href = `../Verified_Customer/Verified_Customer.html?carid=${carId}&customerid=${customer.customerId}`;
                        } else {
                            window.location.href = `../Profile_Details/profileupdateform.html?carid=${carId}&customerid=${customer.customerId}`;
                        }
                    }
                }, 100); // Adjust the time as needed

            } else {
                document.getElementById('demo1').innerHTML = "Incorrect NIC or password.";
                document.getElementById('logincontinue').style.display = "none";
                document.getElementById('deleteX').style.display = "none";
            }
        } catch (error) {
            document.getElementById('demo1').innerHTML = "Error: " + error.message;
            document.getElementById('logincontinue').style.display = "none";
            document.getElementById('deleteX').style.display = "none";
        }

        // Clear the form fields after submission
        event.target.reset();
    });
});
