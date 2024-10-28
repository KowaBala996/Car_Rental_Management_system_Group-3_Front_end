document.addEventListener("DOMContentLoaded", function () {
    const carId = getQueryParam('carid');

    function Encryption(password) {
        return btoa(password); // Basic Base64 encryption
    }


    async function registerUser() {
        const username = document.getElementById('name').value;
        const password = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const nic = document.getElementById('nic').value;
    
        const response = await fetch('https://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        alert(result.message || result.error);
    }
    

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    function generateUniqueId() {
        return 'cust_' + Math.floor(Math.random() * 1000);
    }

    function validatePassword(password) {
        const passwordErrors = [];
        if (password.length < 8) {
            passwordErrors.push('Password must be at least 8 characters long.');
        }
        if (!/[a-z]/.test(password)) {
            passwordErrors.push('Password must contain at least one lowercase letter.');
        }
        if (!/[A-Z]/.test(password)) {
            passwordErrors.push('Password must contain at least one uppercase letter.');
        }
        if (!/\d/.test(password)) {
            passwordErrors.push('Password must contain at least one digit.');
        }
        if (!/[@$!%*?&]/.test(password)) {
            passwordErrors.push('Password must contain at least one special character.');
        }
        return passwordErrors;
    }

    document.getElementById('show-password').addEventListener('change', function () {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmpassword');
        const inputType = this.checked ? 'text' : 'password';
        passwordInput.type = inputType;
        confirmPasswordInput.type = inputType;
    });

    document.getElementById('registerForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting traditionally

        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase(); 
        const nic = document.getElementById('nic').value.trim().toUpperCase();     
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmpassword').value.trim();
        const validatemessage = document.getElementById("Message");

        validatemessage.innerHTML = '';
        validatemessage.style.cssText = "font-size: 16px; width: 70%; text-align: center; background-color: lightblue;";

        // Validation
        if (!name) {
            validatemessage.innerHTML = 'Please enter your name.';
            return;
        }

        if (!phone || !/^(?:\+94|0)\d{9}$/.test(phone)) {
            validatemessage.innerHTML = 'Please enter a valid phone number in the format +94 123456789.';
            return;
        }

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            validatemessage.innerHTML = 'Please enter a valid email address.';
            return;
        }

        if (!nic || !/^\d{9}[vVxX]$|^\d{12}$/.test(nic)) {
            validatemessage.innerHTML = 'Please enter a valid NIC number (either 9 digits followed by V/v/X/x or 12 digits).';
            return;
        }

        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            validatemessage.innerHTML = passwordErrors.join('<br>');  
            return;
        }

        if (password !== confirmPassword) {
            validatemessage.innerHTML = 'Passwords do not match.';
            return;
        }

        const encryptedPassword = Encryption(password);
        const uniqueId = generateUniqueId();

        // Create the customer object
        const customer = { 
            id: uniqueId,
            name, 
            phone, 
            email, 
            nic, 
            password: encryptedPassword, 
        };

        // Fetch API call to submit the customer data to the server
        fetch('http://localhost:5255/api/Customer/Add-Customer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customer)
        })
        .then(response => {
            // Check if the response is OK (status 200-299)
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            console.log(data); // Log the response for debugging
            if (data.success) {
                validatemessage.innerHTML = "Registered successfully!";
                if (carId != null) {
                    window.location.href = `../Customer_login/login.html?carid=${carId}`;
                } else {
                    window.location.href = `../Customer_login/login.html`;
                }
            } else {
                // Handle cases where registration fails
                validatemessage.innerHTML = data.message || 'Registration failed!';
            }
        })
        .catch(error => {
            // Handle network or other errors
            validatemessage.innerHTML = `An error occurred: ${error.message}`;
            console.error('Error:', error);
        });

        this.reset(); // Reset the form after submission
    });
});
