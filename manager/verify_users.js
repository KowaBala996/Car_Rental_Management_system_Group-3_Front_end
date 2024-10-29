document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('myModal');
    const closeButton = document.querySelector('.modal .close');
    const userTableBody = document.getElementById('user-requests');
    const messageArea = document.getElementById('message-area');
    let userRequests = []; // Define userRequests globally

    // Fetch customer data from API
    async function getAllCustomerData() {
        const getAllCustomerDetails = 'http://localhost:5255/api/Customer/Get-All-Customer';
        try {
            const response = await fetch(getAllCustomerDetails);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            userRequests = data; // Assign data to the global variable
            populateUserTable(); // Populate table after fetching data
        } catch (error) {
            console.error('Error fetching customer data:', error);
            messageArea.textContent = 'Error fetching customer data. Please try again later.';
            messageArea.style.color = 'red';
        }
    }

    // Populate the user table with data
    function populateUserTable() {
        userTableBody.innerHTML = ''; // Clear the table before populating
        userRequests.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.phone}</td>
                <td>${user.drivingLicenseNumber|| 'Pending'}</td>
                <td>${user.profileStatus || ' Not Verify'}</td>
                  <td><img src="../asset/download.jpg" alt="Car Image 2" style="width: 100px; height: auto;"></td> 
                <td>
                    <button class="view-btn" data-user-id="${user.id}">View</button>
                    <button class="verify-btn" data-user-id="${user.id}">Verify</button>
                    <button class="reject-btn" data-user-id="${user.id}">Reject</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    }

    // Fetch and display user data in the modal
    function openModal(userId) {
        const user = userRequests.find(u => String(u.id) === userId); // Compare as strings
        if (!user) {
            console.error(`No user found with ID ${userId}`);
            return;
        }

        document.getElementById('name').textContent = user.name;
        document.getElementById('email').textContent = user.email;
        document.getElementById('phone').textContent = user.phone;
        document.getElementById('customerNicnumber').textContent = user.nic;
        document.getElementById('address').textContent = user.address;
        document.getElementById('license-number').textContent = user.drivingLicenseNumber;
        document.getElementById('proof-type').textContent = user.proofType;
        document.getElementById('proof-number').textContent = user.proofIdNumber;
        document.getElementById('postal-code').textContent = user.postalCode;

        modal.style.display = 'block';
    }

    // Close the modal
    function closeModal() {
        modal.style.display = 'none';
    }

    // Update user status
    async function updateUserStatus(userId, status) {
        const userIndex = userRequests.findIndex(u => String(u.id) === userId); // Compare as strings
        if (userIndex === -1) {
            console.error(`User with ID ${userId} not found.`);
            return;
        }

        userRequests[userIndex].profileStatus = status;

        // Prepare data for update
        const selectedCustomer = userRequests[userIndex];
        const formData = new FormData();
        formData.append("id", selectedCustomer.id);
        formData.append("address", selectedCustomer.address);
        formData.append("postalCode", selectedCustomer.postalCode);
        formData.append("drivingLicenseNumber", selectedCustomer.drivingLicenseNumber);
        formData.append("proofIdNumber", selectedCustomer.proofIdNumber);
        formData.append("profileStatus", status); 
        formData.append("frontImagePath", selectedCustomer.frontImagePath);
        

        try {
            await updateCustomerData(formData);
            messageArea.textContent = `User ${selectedCustomer.name} has been ${status.toLowerCase()}.`;
            messageArea.style.color = status === 'Verified' ? 'green' : 'red';
            populateUserTable(); // Refresh the table with updated data
            closeModal(); // Close the modal after update
        } catch (error) {
            console.error('Error updating customer data:', error);
            messageArea.textContent = 'Error updating customer data. Please try again.';
            messageArea.style.color = 'red';
        }
    }

    async function updateCustomerData(formData) {
        const updateCusDetails = 'http://localhost:5255/api/Customer/Update-Customer';
        const response = await fetch(updateCusDetails, {
            method: 'PUT',
            body: formData
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        console.log('Customer updated successfully:', data);
    }

    userTableBody.addEventListener('click', (e) => {
        const userId = e.target.getAttribute('data-user-id');
        if (!userId) {
            console.error('No user ID found on clicked element.');
            return;
        }

        if (e.target.classList.contains('view-btn')) {
            openModal(userId);
        } else if (e.target.classList.contains('verify-btn')) {
            updateUserStatus(userId, 'Verified');
        } else if (e.target.classList.contains('reject-btn')) {
            updateUserStatus(userId, 'Rejected');
        }
    });

    // Event listeners for modal close
    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    }); 

    // Fetch and initialize the table with customer data
    getAllCustomerData();
});
