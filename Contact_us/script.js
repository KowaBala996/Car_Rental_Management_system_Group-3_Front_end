document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.getElementById('contactForm');

    const logoutButton = document.getElementById('logoutButton');

    // Logout function to clear loggedUser from localStorage and redirect to login page
    logoutButton.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior

        // Remove loggedUser from localStorage
        localStorage.removeItem('loggedUser');

        // Redirect to login page after logging out
        window.location.href = '../Customer_login/login.html';
    });



    // Retrieve existing form data array from localStorage, or initialize it as an empty array
    let formDataArray = JSON.parse(localStorage.getItem('formDataArray')) || [];

    // Function to display stored data (Optional, can be used to log or show previously submitted data)
    function displayStoredData() {
        console.log("Stored Form Data:", formDataArray);
    }

    // Display the stored data for debugging purposes
    displayStoredData();

    // Add validation event listener on form submission
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form submission initially for validation

        // Retrieve form input values
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        // Validate form fields
        let valid = true;

        // Name validation
        if (name === "") {
            document.getElementById('nameError').textContent = "Name is required.";
            valid = false;
        } else {
            document.getElementById('nameError').textContent = "";
        }

        // Phone validation (basic example: 10 digits)
        const phonePattern = /^[0-9]{10}$/;
        if (!phonePattern.test(phone)) {
            document.getElementById('phoneError').textContent = "Please enter a valid 10-digit phone number.";
            valid = false;
        } else {
            document.getElementById('phoneError').textContent = "";
        }

        // Email validation
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(email)) {
            document.getElementById('emailError').textContent = "Please enter a valid email address.";
            valid = false;
        } else {
            document.getElementById('emailError').textContent = "";
        }

        // Message validation
        if (message === "") {
            document.getElementById('messageError').textContent = "Message is required.";
            valid = false;
        } else {
            document.getElementById('messageError').textContent = "";
        }

        // If form is valid, save data to localStorage
        if (valid) {
            // Create an object to store form data
            const formData = {
                name: name,
                phone: phone,
                email: email,
                message: message
            };

            // Add the new form data to the array
            formDataArray.push(formData);

            // Save the updated array back to localStorage
            localStorage.setItem('formDataArray', JSON.stringify(formDataArray));

            // Optionally display the stored data
            displayStoredData();

            // Show success message or submit the form
            alert("Form data has been saved!");

            // Uncomment the line below if you want to proceed with form submission
            // contactForm.submit();
        } else {
            alert("Please fix the errors before submitting.");
        }
        location.reload();
    });

    // FAQ toggle functionality
    const faqButtons = document.querySelectorAll('.faq-answer');

    // Loop through each button
    faqButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Get the corresponding answer content
            const answerContent = this.nextElementSibling;

            // Toggle the visibility of the answer content
            if (answerContent.style.display === "none") {
                answerContent.style.display = "block"; // Show the answer
            } else {
                answerContent.style.display = "none"; // Hide the answer
            }
        });
    });
});

