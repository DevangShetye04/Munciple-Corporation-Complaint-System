// Global variables
//let complaints = JSON.parse(localStorage.getItem('complaints')) || [];
let complaintCounter = parseInt(localStorage.getItem('complaintCounter')) || 1;

// DOM elements
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
//const complaintForm = document.getElementById('complaintForm');
const successModal = document.getElementById('successModal');
const closeModalBtn = document.querySelector('.close');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeFormValidation();
    initializeModal();
    loadComplaintsTable();
    populateSampleData();
});

// Navigation functionality
function initializeNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            showPage(targetPage);
            
            // Update active nav link
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showPage(pageId) {
    // Hide all pages
    pages.forEach(page => page.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    if (pageId === "admin") {
        loadComplaintsTable();
    }

    
    // Update URL hash
    window.location.hash = pageId;
}

// Form validation and submission
function initializeFormValidation() {
    if (complaintForm) {
        complaintForm.addEventListener('submit', handleComplaintSubmission);
    }
}
/*
function handleComplaintSubmission(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(complaintForm);
    const complaintData = {
        id: generateComplaintId(),
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        category: formData.get('category'),
        address: formData.get('address'),
        description: formData.get('description'),
        fileUpload: formData.get('fileUpload'),
        status: 'pending',
        assignedOfficer: 'Not Assigned',
        date: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    // Validate form data
    if (!validateComplaintData(complaintData)) {
        return;
    }
    
    // Add complaint to storage
    complaints.push(complaintData);
    localStorage.setItem('complaints', JSON.stringify(complaints));
    complaintCounter++;
    localStorage.setItem('complaintCounter', complaintCounter.toString());
    
    // Show success modal
    showSuccessModal(complaintData.id);
    
    // Reset form
    complaintForm.reset();
}
*/
const complaintForm = document.getElementById("complaintForm");

complaintForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
        fullName: document.getElementById("fullName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        category: document.getElementById("category").value,
        address: document.getElementById("address").value,
        description: document.getElementById("description").value,
        fileUpload: document.getElementById("fileUpload").value
    };

    try {
        const res = await fetch("http://localhost:5000/complaints", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const result = await res.json();
        if (result.success) {
            alert("✅ Complaint registered successfully!");
            complaintForm.reset();
        } else {
            alert("❌ Failed: " + result.message);
        }
    } catch (err) {
        alert("⚠️ Error: " + err.message);
    }
});

function validateComplaintData(data) {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showError('Please enter a valid email address');
        return false;
    }
    
    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
        showError('Please enter a valid phone number');
        return false;
    }
    
    // Required fields validation
    const requiredFields = ['fullName', 'category', 'address', 'description'];
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
            return false;
        }
    }
    
    return true;
}

function generateComplaintId() {
    const year = new Date().getFullYear();
    const paddedCounter = complaintCounter.toString().padStart(3, '0');
    return `MC${year}${paddedCounter}`;
}

// Track complaint functionality
function trackComplaint() {
    const complaintId = document.getElementById('complaintId').value.trim();
    
    if (!complaintId) {
        showError('Please enter a complaint ID');
        return;
    }
    
    const complaint = complaints.find(c => c.id === complaintId);
    const trackResult = document.getElementById('trackResult');
    
    if (complaint) {
        trackResult.innerHTML = `
            <div class="complaint-status">
                <h3>Complaint Details</h3>
                <span class="status-badge status-${complaint.status.replace('-', '')}">${complaint.status.toUpperCase()}</span>
            </div>
            <div class="complaint-details">
                <p><strong>ID:</strong> ${complaint.id}</p>
                <p><strong>Name:</strong> ${complaint.fullName}</p>
                <p><strong>Category:</strong> ${complaint.category}</p>
                <p><strong>Description:</strong> ${complaint.description}</p>
                <p><strong>Date Submitted:</strong> ${new Date(complaint.date).toLocaleDateString()}</p>
                <p><strong>Assigned Officer:</strong> ${complaint.assignedOfficer}</p>
            </div>
        `;
        trackResult.style.display = 'block';
    } else {
        trackResult.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Complaint not found. Please check the ID and try again.</p>
            </div>
        `;
        trackResult.style.display = 'block';
    }
}

// Admin dashboard functionality
/*function loadComplaintsTable() {
    const tableBody = document.getElementById('complaintsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    complaints.forEach(complaint => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${complaint.id}</td>
            <td>${complaint.fullName}</td>
            <td>${complaint.category}</td>
            <td><span class="status-badge status-${complaint.status.replace('-', '')}">${complaint.status.toUpperCase()}</span></td>
            <td>${complaint.assignedOfficer}</td>
            <td>${new Date(complaint.date).toLocaleDateString()}</td>
            <td>
                <button class="action-btn view" onclick="viewComplaint('${complaint.id}')">View</button>
                <button class="action-btn edit" onclick="editComplaint('${complaint.id}')">Edit</button>
                <button class="action-btn delete" onclick="deleteComplaint('${complaint.id}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}*/
// Admin dashboard functionality (fetch from backend)
async function loadComplaintsTable() {
    const tableBody = document.getElementById('complaintsTableBody');
    if (!tableBody) return;

    try {
        const res = await fetch("http://localhost:5000/complaints");
        const data = await res.json();

        tableBody.innerHTML = "";

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-search" style="font-size: 2rem; color: #6b7280; margin-bottom: 1rem;"></i>
                        <p>No complaints found in database</p>
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach((complaint, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${complaint._id || index + 1}</td>
                <td>${complaint.fullName}</td>
                <td>${complaint.category}</td>
                <td><span class="status-badge status-pending">PENDING</span></td>
                <td>${complaint.assignedOfficer || "Not Assigned"}</td>
                <td>${new Date().toLocaleDateString()}</td>
                <td>
                    <button class="action-btn view" onclick="viewComplaint('${complaint._id}')">View</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error("❌ Failed to fetch complaints:", err);
        tableBody.innerHTML = `
            <tr><td colspan="7" style="text-align:center; color:red;">Error loading complaints</td></tr>
        `;
    }
}


function filterComplaints() {
    const searchTerm = document.getElementById('adminSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filteredComplaints = complaints.filter(complaint => {
        const matchesSearch = complaint.fullName.toLowerCase().includes(searchTerm) ||
                             complaint.id.toLowerCase().includes(searchTerm) ||
                             complaint.category.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || complaint.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    displayFilteredComplaints(filteredComplaints);
}

function displayFilteredComplaints(filteredComplaints) {
    const tableBody = document.getElementById('complaintsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filteredComplaints.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-search" style="font-size: 2rem; color: #6b7280; margin-bottom: 1rem;"></i>
                    <p>No complaints found matching your criteria</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredComplaints.forEach(complaint => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${complaint.id}</td>
            <td>${complaint.fullName}</td>
            <td>${complaint.category}</td>
            <td><span class="status-badge status-${complaint.status.replace('-', '')}">${complaint.status.toUpperCase()}</span></td>
            <td>${complaint.assignedOfficer}</td>
            <td>${new Date(complaint.date).toLocaleDateString()}</td>
            <td>
                <button class="action-btn view" onclick="viewComplaint('${complaint.id}')">View</button>
                <button class="action-btn edit" onclick="editComplaint('${complaint.id}')">Edit</button>
                <button class="action-btn delete" onclick="deleteComplaint('${complaint.id}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function viewComplaint(complaintId) {
    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
        alert(`Complaint Details:\n\nID: ${complaint.id}\nName: ${complaint.fullName}\nEmail: ${complaint.email}\nPhone: ${complaint.phone}\nCategory: ${complaint.category}\nStatus: ${complaint.status}\nDescription: ${complaint.description}\nDate: ${new Date(complaint.date).toLocaleDateString()}`);
    }
}

function editComplaint(complaintId) {
    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
        const newStatus = prompt('Enter new status (pending/in-progress/resolved):', complaint.status);
        if (newStatus && ['pending', 'in-progress', 'resolved'].includes(newStatus)) {
            complaint.status = newStatus;
            complaint.assignedOfficer = prompt('Enter assigned officer:', complaint.assignedOfficer) || complaint.assignedOfficer;
            
            localStorage.setItem('complaints', JSON.stringify(complaints));
            loadComplaintsTable();
            showSuccess('Complaint updated successfully!');
        }
    }
}

function deleteComplaint(complaintId) {
    if (confirm('Are you sure you want to delete this complaint?')) {
        complaints = complaints.filter(c => c.id !== complaintId);
        localStorage.setItem('complaints', JSON.stringify(complaints));
        loadComplaintsTable();
        showSuccess('Complaint deleted successfully!');
    }
}

// Modal functionality
function initializeModal() {
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === successModal) {
            closeModal();
        }
    });
}

function showSuccessModal(complaintId) {
    document.getElementById('generatedComplaintId').textContent = complaintId;
    successModal.style.display = 'block';
}

function closeModal() {
    successModal.style.display = 'none';
}

// Utility functions
function showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    showNotification(notification);
}

function showSuccess(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    showNotification(notification);
}

function showNotification(notification) {
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideIn 0.3s ease;
    `;
    
    if (notification.classList.contains('error')) {
        notification.style.backgroundColor = '#ef4444';
    } else {
        notification.style.backgroundColor = '#10b981';
    }
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Populate sample data for demonstration
/*function populateSampleData() {
    if (complaints.length === 0) {
        const sampleComplaints = [
            {
                id: 'MC2024001',
                fullName: 'John Smith',
                email: 'john.smith@email.com',
                phone: '555-123-4567',
                category: 'road',
                address: '123 Main Street, City Center',
                description: 'Large pothole on Main Street causing traffic issues',
                status: 'pending',
                assignedOfficer: 'Not Assigned',
                date: '2024-01-15T10:30:00.000Z',
                timestamp: 1705315800000
            },
            {
                id: 'MC2024002',
                fullName: 'Sarah Johnson',
                email: 'sarah.j@email.com',
                phone: '555-987-6543',
                category: 'waste',
                address: '456 Oak Avenue, Downtown',
                description: 'Garbage not collected for 3 days',
                status: 'in-progress',
                assignedOfficer: 'Mike Wilson',
                date: '2024-01-14T14:20:00.000Z',
                timestamp: 1705231200000
            },
            {
                id: 'MC2024003',
                fullName: 'David Brown',
                email: 'david.brown@email.com',
                phone: '555-456-7890',
                category: 'water',
                address: '789 Pine Road, Suburbia',
                description: 'Low water pressure in the entire neighborhood',
                status: 'resolved',
                assignedOfficer: 'Lisa Chen',
                date: '2024-01-13T09:15:00.000Z',
                timestamp: 1705146900000
            }
        ];
        
        complaints = sampleComplaints;
        complaintCounter = 4;
        localStorage.setItem('complaints', JSON.stringify(complaints));
        localStorage.setItem('complaintCounter', complaintCounter.toString());
    }
}*/

// Handle page load with hash
window.addEventListener('load', function() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        showPage(hash);
        navLinks.forEach(nav => {
            if (nav.getAttribute('data-page') === hash) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });
    }
});

// Add event listeners for admin search and filter
document.addEventListener('DOMContentLoaded', function() {
    const adminSearch = document.getElementById('adminSearch');
    const statusFilter = document.getElementById('statusFilter');
    
    if (adminSearch) {
        adminSearch.addEventListener('input', filterComplaints);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterComplaints);
    }
});
