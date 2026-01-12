document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    initNavigation();
});

function initCharts() {
    // 1. Weekly Sales Chart (Vertical Bar)
    const weeklyCtx = document.getElementById('weeklySalesChart').getContext('2d');
    new Chart(weeklyCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Sales ($)',
                data: [450, 680, 520, 940, 710, 320, 280],
                backgroundColor: '#368CBF',
                borderRadius: 8,
                barThickness: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { drawBorder: false, color: '#f3f4f6' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    // 2. Monthly Profit Chart (Donut)
    const profitCtx = document.getElementById('profitDonutChart').getContext('2d');
    new Chart(profitCtx, {
        type: 'doughnut',
        data: {
            labels: ['Gross Profit', 'Net Profit'],
            datasets: [{
                data: [75, 25],
                backgroundColor: ['#368CBF', '#E6DBC9'],
                borderWidth: 0,
                cutout: '80%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Simple search interaction
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            console.log('Search focused');
        });
    }

    // Logout button interaction
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = 'index.html';
            }
        });
    }
}
