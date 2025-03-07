document.addEventListener('DOMContentLoaded', () => {
    // Initialize Charts
    initializeCharts();

    // Handle Navigation
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    const sections = document.querySelectorAll('.dashboard-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show/hide sections
            sections.forEach(section => {
                section.classList.add('d-none');
                if (section.id === targetId) {
                    section.classList.remove('d-none');
                }
            });
        });
    });

    // Handle Form Submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Show success message
            showToast('Changes saved successfully!');
        });
    });

    // Mobile Sidebar Toggle
    const sidebarToggle = document.createElement('button');
    sidebarToggle.className = 'btn btn-link d-md-none';
    sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.querySelector('.navbar-brand').after(sidebarToggle);

    sidebarToggle.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });

    // Handle Notifications
    const notificationItems = document.querySelectorAll('.notification-item');
    notificationItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            // Mark as read
            item.style.opacity = '0.6';
            const badge = document.querySelector('.notifications-dropdown .badge');
            badge.textContent = parseInt(badge.textContent) - 1;
        });
    });

    // Initialize date pickers
    if (typeof flatpickr !== 'undefined') {
        flatpickr('input[type="date"]', {
            enableTime: false,
            dateFormat: 'Y-m-d'
        });
    }
});

function initializeCharts() {
    // Detection Analytics Chart
    const ctx = document.getElementById('detectionChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Accidents', 'Near Misses', 'Safe Passages'],
                datasets: [{
                    data: [15, 25, 60],
                    backgroundColor: [
                        '#dc3545',
                        '#ffc107',
                        '#28a745'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

function showToast(message) {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastHtml = `
        <div class="toast" role="alert">
            <div class="toast-header">
                <strong class="me-auto">Notification</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toast = toastContainer.lastElementChild;
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateChartsTheme(theme);
    });
}

function updateChartsTheme(theme) {
    Chart.defaults.color = theme === 'dark' ? '#fff' : '#666';
    Chart.defaults.borderColor = theme === 'dark' ? '#404040' : '#ddd';
    
    // Update all charts
    Chart.instances.forEach(chart => {
        chart.update();
    });
}

// Initialize theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
if (themeToggle) {
    themeToggle.checked = savedTheme === 'dark';
}
updateChartsTheme(savedTheme);
