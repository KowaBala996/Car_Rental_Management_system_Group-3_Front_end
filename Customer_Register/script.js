document.addEventListener("DOMContentLoaded", function () {
    // Fetch the carId from the URL query parameters
    const carId = getQueryParam('carid');
    let cusAll = [];
    const getAllCustomerDetails = 'http://localhost:5255/api/Customer/Get-All-Customer';

    // Fetch all customer data to check for duplicates during registration
    async function GetAllCustomerData() {
        try {
            const response = await fetch(getAllCustomerDetails);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            cusAll = data;
        } catch (error) {
            console.error('Error fetching customer data:', error);
        }
    }

    GetAllCustomerData(); // Fetch customer data on page load

    // Encrypt password using Base64 encoding
    function Encryption(password) {
        return btoa(password);
    }

    // Get the value of a query parameter from the URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Generate a unique ID for each customer
    function generateUniqueId() {
        return 'cust_' + Math.floor(Math.random() * 1000);
    }

    // Validate password according to defined criteria
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

    // Toggle password visibility based on checkbox state
    document.getElementById('show-password').addEventListener('change', function () {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmpassword');
        const inputType = this.checked ? 'text' : 'password';
        passwordInput.type = inputType;
        confirmPasswordInput.type = inputType;
    });

    // Handle the registration form submission
    document.getElementById('registerForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission

        const addCustomerApiURL = 'http://localhost:5255/api/Customer/Add-Customer'; 
        

        // Function to send form data to the server
        async function AddCustomer(CarData) {
            try {
                const response = await fetch(addCustomerApiURL, {
                    method: 'POST',
                    body: CarData
                });
                console.log(response)
                if (!response.ok) throw new Error('Network response was not ok');
                return response; // Assuming the response returns JSON
            } catch (error) {
                console.error('Error adding customer:', error);
                throw error; // Re-throw to handle in the submit function
            }
        }

        // Fetch form values
        const customerName = document.getElementById('name').value.trim();
        const customerPhone = document.getElementById('phone').value.trim();
        const customerEmail = document.getElementById('email').value.trim().toLowerCase();
        const customerNicnumber = document.getElementById('nic').value.trim().toUpperCase();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmpassword').value.trim();
        const validatemessage = document.getElementById("Message");

        // Clear previous validation messages
        validatemessage.innerHTML = '';
        validatemessage.style.cssText = "font-size: 16px; width: 70%; text-align: center; background-color: lightblue;";

        // Validate form fields
        if (!customerName) {
            validatemessage.innerHTML = 'Please enter your name.';
            return;
        }

        if (!customerPhone || !/^(?:\+94|0)\d{9}$/.test(customerPhone)) {
            validatemessage.innerHTML = 'Please enter a valid phone number in the format +94 123456789.';
            return;
        }

        if (!customerEmail || !/\S+@\S+\.\S+/.test(customerEmail)) {
            validatemessage.innerHTML = 'Please enter a valid email address.';
            return;
        }

        if (!customerNicnumber || !/^\d{9}[vVxX]$|^\d{12}$/.test(customerNicnumber)) {
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

        // Check for duplicate entries
        const isEmailDuplicate = cusAll.some(customer => customer.Email === customerEmail);
        const isNicDuplicate = cusAll.some(customer => customer.Nic === customerNicnumber);
        const isPhoneDuplicate = cusAll.some(customer => customer.Phone === customerPhone);

        if (isEmailDuplicate) {
            validatemessage.innerHTML = 'The email is already registered.';
            return;
        }

        if (isNicDuplicate) {
            validatemessage.innerHTML = 'The NIC is already registered.';
            return;
        }

        if (isPhoneDuplicate) {
            validatemessage.innerHTML = 'The phone number is already registered.';
            return;
        }

        // Encrypt the password
        const encryptedPassword = Encryption(password);
        const uniqueId = generateUniqueId();

        // Create form data to send to the server
        const formdata = new FormData();
        formdata.append("id", uniqueId);
        formdata.append("nic", customerNicnumber);
        formdata.append("name", customerName);
        formdata.append("carId", carId);
        formdata.append("email", customerEmail);
        formdata.append("phone", customerPhone);
        formdata.append("password", encryptedPassword);
        

        // Submit the form data to the server
        
            let res=await AddCustomer(formdata);
            console.log(res.ok)
            if(res.ok){
                validatemessage.innerHTML = "Registered successfully!";
                // Redirect to login page with car ID if available
                 window.location.href = `../Customer_login/login.html${carId ? '?carid=' + carId : ''}`;
            }else{
                validatemessage.innerHTML = "Registration failed. Please try again.";

            }
       

        // Reset the form
        this.reset();
    });
});
