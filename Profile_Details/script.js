document.addEventListener("DOMContentLoaded", function () {
    const profileForm = document.getElementById("profile-form");
    const licenseFrontInput = document.getElementById("license-front");
    const licenseFrontPreview = document.getElementById("licenseFrontPreview");
    const notificationDiv = document.querySelector(".notification");

    const carid = getQueryParam('carid');
    const customerid = getQueryParam('customerid');

    loadProfileData();

    licenseFrontInput.addEventListener("change", function () {
        previewImage(licenseFrontInput, licenseFrontPreview);
    });

    profileForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Validate form before submission
        if (!validateCustomerDetails() || !validateLicenseNumber()) {
            return;
        }

        const profileData = {
            id: customerid || generateUniqueId(),
            name: document.getElementById("name").value,
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value,
            nic: document.getElementById("customerNicnumber").value,
            address: document.getElementById("address").value,
            postalCode: document.getElementById("postal-code").value,
            drivingLicenseNumber: document.getElementById("license-number").value,
            proofNumber: document.getElementById("proof-number").value
        };

        saveProfileData(profileData);
    });

    function previewImage(inputElement, previewElement) {
        const file = inputElement.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            previewElement.style.display = "block";
            previewElement.src = e.target.result;
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    }

    function validateCustomerDetails() {
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();
        const postalCode = document.getElementById("postal-code").value.trim();

        if (!name || !email || !phone || !address || !postalCode) {
            showNotification("All fields are required!");
            return false;
        }

        return true;
    }

    function validateLicenseNumber() {
        const licenseNumber = document.getElementById("license-number").value.trim();
        const licenseNumberPattern = /^[A-Z]\d{7,9}$/;

        if (!licenseNumberPattern.test(licenseNumber)) {
            showNotification("Invalid Driving License Number format!");
            return false;
        }
        return true;
    }

    function saveProfileData(profileData) {
        const formData = new FormData();
        formData.append("profileData", JSON.stringify(profileData));

        if (licenseFrontInput.files[0]) {
            formData.append("licenseFront", licenseFrontInput.files[0]);
        }

        fetch('https://localhost:7175/api/Customer/Add-Customer', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log("Profile saved:", data);
            if (data.success) {
                showNotification("Profile updated successfully!");
            } else {
                showNotification("Error updating profile.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            showNotification("Error saving profile data!");
        });
    }

    function loadProfileData() {
        fetch(`https://localhost:7175/api/Customer/Get-Customer-By-Nic/${customerid}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                document.getElementById("name").value = data.name || "";
                document.getElementById("email").value = data.email || "";
                document.getElementById("phone").value = data.phone || "";
                document.getElementById("address").value = data.address || "";
                document.getElementById("postal-code").value = data.postalCode || "";
                document.getElementById("license-number").value = data.drivingLicenseNumber || "";
                document.getElementById("proof-type").value = data.proofType || "";
                document.getElementById("proof-number").value = data.proofIdNumber || ""; 

                const verificationStatusSpan = document.querySelector(".verification-status .status");
                verificationStatusSpan.textContent = data.profileStatus || "Pending";

                // Load and show the uploaded license image
                if (data.licenseFrontImage) {
                    licenseFrontPreview.src = data.licenseFrontImage;
                    licenseFrontPreview.style.display = "block";
                }

                // Redirect based on verification status
                if (data.profileStatus === "Verified") {
                    if (carid) {
                        window.location.href = `../Verified_Customer/Verified_Customer.html?carid=${carid}&customerid=${customerid}`;
                    } else {
                        window.location.href = `../Car_Categories/get-car.html?customerid=${customerid}`;
                    }
                }
            }
        })
        .catch(error => {
            console.error("Error loading profile data:", error);
        });
    }

    function showNotification(message) {
        notificationDiv.textContent = message;
        notificationDiv.style.display = "block";
        setTimeout(() => {
            notificationDiv.style.display = "none";
        }, 5000);
    }

    document.querySelector('.user-dropdown').addEventListener('click', function () {
        const content = document.querySelector('.user-dropdown-content');
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
    });

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    function generateUniqueId() {
        return 'id-' + Math.random().toString(36).substr(2, 9);
    }

    function ProfilePicLoading(nic) {
        // Assuming 'students' is an array of student objects available in the scope
        const student = students.find(s => s.nic === nic);
        if (student) {
            const imagePath = student.imagePath;
            const imageFullPath = `http://localhost:5251${imagePath}`.trim();

            const profilePicContainer = document.getElementById('profilepic-container');
            profilePicContainer.innerHTML = 
                `<img src="${imageFullPath}" alt="${student.fullName}" id="profile-picture" class="profile-picture">`;
        }
    }
});
