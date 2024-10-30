document.addEventListener("DOMContentLoaded", function () {
    const profileForm = document.getElementById("profile-form");
    const licenseFrontInput = document.getElementById("image");
    const notificationDiv = document.querySelector(".notification");

    const carid = getQueryParam('carid');
    const customerid = getQueryParam('customerid');
    const bookingId = getQueryParam('bookingId');


    loadProfileData();

    profileForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!validateCustomerDetails() || !validateLicenseNumber()) {
            return;
        }

        saveProfileData();
        showNotification("Profile updated successfully!");
        scrollToTop();
    });

    function validateCustomerDetails() {
        const address = document.getElementById("address").value.trim();
        const postalCode = document.getElementById("postal-code").value.trim();

        if (!address) {
            showNotification("Address is required!");
            return false;
        }
        if (!postalCode) {
            showNotification("Postal Code is required!");
            return false;
        }
        return true;
    }

    function validateLicenseNumber() {
        const licenseNumber = document.getElementById("license-number").value.trim();
        // Regex to match Sri Lankan Driving License Number format
        const licenseNumberPattern = /^[A-Z]\d{7,9}$/; // Adjusted to match the format

        if (!licenseNumberPattern.test(licenseNumber)) {
            showNotification("Invalid Driving License Number format!");
            return false;
        }
        return true;
    }

    async function saveProfileData() {
        const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
        const profileStatus = licenseFrontInput.files[0] && allowedExtensions.test(licenseFrontInput.files[0].name)
            ? "Pending"
            : "Documents upload pending";

        const cusAll = await getAllCustomerData();
        const selectedCustomer = cusAll.find(customer => customer.id == customerid);

        if (selectedCustomer) {
            const imagePath = document.getElementById('image').files[0];

            const formData = new FormData();
            formData.append("id", selectedCustomer.id);
            formData.append("address", document.getElementById("address").value || "");
            formData.append("postalCode", document.getElementById("postal-code").value || "");
            formData.append("drivingLicenseNumber", document.getElementById("license-number").value || "");
            formData.append("frontImagePath", imagePath[0]);
            formData.append("proofIdNumber", document.getElementById("proof-number").value || "");
            formData.append("profileStatus", profileStatus);

            await updateCustomerData(formData);
        }
    }

    async function loadProfileData() {
        const storedProfileData = await getAllCustomerData();
        const imagePath = document.getElementById('image').files[0];


        if (storedProfileData.length > 0) {
            const currentProfile = storedProfileData.find(profile => profile.id === customerid);

            if (currentProfile) {
                document.getElementById("name").value = currentProfile.name || "";
                document.getElementById("email").value = currentProfile.email || "";
                document.getElementById("phone").value = currentProfile.phone || "";
                document.getElementById("customerNicnumber").value = currentProfile.nic || "";
                document.getElementById("address").value = currentProfile.address || "";
                document.getElementById("postal-code").value = currentProfile.postalCode || "";
                document.getElementById("license-number").value = currentProfile.drivingLicenseNumber || "";
                document.getElementById("proof-type").value = currentProfile.proofType || "";
                document.getElementById("proof-number").value = currentProfile.proofIdNumber || "";

                const verificationStatusSpan = document.querySelector(".verification-status .status");
                verificationStatusSpan.textContent = currentProfile.profileStatus || "Pending";

                // Set fields as read-only
                document.getElementById("name").readOnly = true;
                document.getElementById("email").readOnly = true;
                document.getElementById("phone").readOnly = true;
                document.getElementById("customerNicnumber").readOnly = true;

                // Redirect based on profile status
                if (currentProfile.profileStatus === "Verified") {
                    if (carid) {
                        window.location.href = `../Verified_Customer/Verified_Customer.html?carid=${carid}&customerid=${customerid}&bookingId=${bookingId}`;
                    } else {
                        window.location.href = `../Car_Categories/get-car.html?customerid=${customerid}`;
                    }
                }
            } else {
                console.log("No matching profile found for this customer.");
            }
        }
    }

    async function updateCustomerData(formData) {
        const updateCusDetails = 'http://localhost:5255/api/Customer/Update-Customer';
        try {
            const response = await fetch(updateCusDetails, {
                method: 'PUT',
                body: formData
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            console.log('Customer updated successfully:', data);
        } catch (error) {
            console.error('Error updating customer data:', error);
        }
    }

    async function getAllCustomerData() {
        const getAllCustomerDetails = 'http://localhost:5255/api/Customer/Get-All-Customer';
        let storedProfileData = [];
        try {
            const response = await fetch(getAllCustomerDetails);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            storedProfileData = data;
        } catch (error) {
            console.error('Error fetching customer data:', error);
        }
        return storedProfileData;
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

    document.querySelector('#logoutButton').addEventListener('click', function (event) {
        event.preventDefault();

        // Remove loggedUser from localStorage
        localStorage.removeItem('loggedUser');

        // Redirect to the login page after logout
        window.location.href = '../Customer_login/login.html';
    });

    // Scroll to the top when viewing car details
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };
});
