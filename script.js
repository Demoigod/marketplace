// ===== SAMPLE DATA =====
const sampleMarketplaceItems = [
    {
        id: 1,
        title: "MacBook Pro 13\" 2020",
        category: "electronics",
        price: 899.99,
        description: "Excellent condition, barely used. Comes with charger and original box.",
        condition: "like-new",
        image: "laptop"
    },
    {
        id: 2,
        title: "Calculus Textbook",
        category: "books",
        price: 45.00,
        description: "Stewart's Calculus 8th Edition. Minimal highlighting, great condition.",
        condition: "good",
        image: "book"
    },
    {
        id: 3,
        title: "Study Desk",
        category: "furniture",
        price: 75.00,
        description: "Solid wood desk, perfect for dorm room. Easy to assemble.",
        condition: "good",
        image: "desk"
    },
    {
        id: 4,
        title: "Tutoring Services - Math",
        category: "services",
        price: 25.00,
        description: "Experienced tutor offering help with calculus, algebra, and statistics. $25/hour.",
        condition: "new",
        image: "service"
    },
    {
        id: 5,
        title: "iPhone 12 Pro",
        category: "electronics",
        price: 599.99,
        description: "128GB, Pacific Blue. Excellent condition with screen protector.",
        condition: "like-new",
        image: "phone"
    },
    {
        id: 6,
        title: "Winter Jacket",
        category: "clothing",
        price: 60.00,
        description: "North Face jacket, size M. Warm and waterproof.",
        condition: "good",
        image: "jacket"
    },
    {
        id: 7,
        title: "Gaming Mouse",
        category: "electronics",
        price: 35.00,
        description: "Logitech G502, RGB lighting, programmable buttons.",
        condition: "like-new",
        image: "mouse"
    },
    {
        id: 8,
        title: "Chemistry Lab Manual",
        category: "books",
        price: 20.00,
        description: "Chem 101 lab manual, all experiments included.",
        condition: "fair",
        image: "book"
    }
];

const sampleResources = [
    {
        id: 1,
        title: "CS101 Final Exam 2023",
        type: "exam",
        course: "Introduction to Computer Science",
        year: 2023,
        description: "Complete final exam with solutions"
    },
    {
        id: 2,
        title: "Organic Chemistry Textbook",
        type: "textbook",
        course: "Organic Chemistry I",
        year: 2022,
        description: "Full PDF textbook with all chapters"
    },
    {
        id: 3,
        title: "Calculus II Midterm 2024",
        type: "exam",
        course: "Calculus II",
        year: 2024,
        description: "Practice problems and solutions"
    },
    {
        id: 4,
        title: "Physics Study Notes",
        type: "notes",
        course: "Physics 201",
        year: 2023,
        description: "Comprehensive study notes for all chapters"
    },
    {
        id: 5,
        title: "Biology Final Exam 2023",
        type: "exam",
        course: "General Biology",
        year: 2023,
        description: "Past exam paper with answer key"
    },
    {
        id: 6,
        title: "Linear Algebra Textbook",
        type: "textbook",
        course: "Linear Algebra",
        year: 2024,
        description: "Complete textbook PDF"
    },
    {
        id: 7,
        title: "Economics 101 Notes",
        type: "notes",
        course: "Microeconomics",
        year: 2024,
        description: "Detailed lecture notes and summaries"
    },
    {
        id: 8,
        title: "Statistics Midterm 2023",
        type: "exam",
        course: "Statistics 301",
        year: 2023,
        description: "Midterm exam with solutions"
    }
];

// ===== STATE MANAGEMENT =====
let currentCategory = 'all';
let currentResourceType = 'all';
let marketplaceItems = [...sampleMarketplaceItems];
let resources = [...sampleResources];

// ===== DOM ELEMENTS =====
const uploadModal = document.getElementById('uploadModal');
const resourceModal = document.getElementById('resourceModal');
const authModal = document.getElementById('authModal');
const postItemBtn = document.getElementById('postItemBtn');
const uploadResourceBtn = document.getElementById('uploadResourceBtn');
const closeModalBtn = document.getElementById('closeModal');
const closeResourceModalBtn = document.getElementById('closeResourceModal');
const closeAuthModalBtn = document.getElementById('closeAuthModal');
const uploadForm = document.getElementById('uploadForm');
const resourceForm = document.getElementById('resourceForm');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const searchInput = document.getElementById('searchInput');
const marketplaceGrid = document.getElementById('marketplaceGrid');
const resourcesGrid = document.getElementById('resourcesGrid');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userMenu = document.getElementById('userMenu');
const dashboardLink = document.getElementById('dashboardLink');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    renderMarketplaceItems();
    renderResources();
    setupEventListeners();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Modal controls
    postItemBtn.addEventListener('click', () => {
        if (!isLoggedIn()) {
            openModal(authModal);
            showNotification('Please login to post items');
            return;
        }
        openModal(uploadModal);
    });
    uploadResourceBtn.addEventListener('click', () => {
        if (!isLoggedIn()) {
            openModal(authModal);
            showNotification('Please login to upload resources');
            return;
        }
        openModal(resourceModal);
    });
    closeModalBtn.addEventListener('click', () => closeModal(uploadModal));
    closeResourceModalBtn.addEventListener('click', () => closeModal(resourceModal));
    closeAuthModalBtn.addEventListener('click', () => closeModal(authModal));

    // Close modal on outside click
    uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) closeModal(uploadModal);
    });
    resourceModal.addEventListener('click', (e) => {
        if (e.target === resourceModal) closeModal(resourceModal);
    });
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeModal(authModal);
    });

    // Auth modal tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabType = e.target.dataset.tab;
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            if (tabType === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                document.getElementById('authModalTitle').textContent = 'Login';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
                document.getElementById('authModalTitle').textContent = 'Register';
            }
        });
    });

    // Form submissions
    uploadForm.addEventListener('submit', handleItemUpload);
    resourceForm.addEventListener('submit', handleResourceUpload);
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    // Auth buttons
    if (loginBtn) {
        loginBtn.addEventListener('click', () => openModal(authModal));
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Category filters
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            renderMarketplaceItems();
        });
    });

    // Resource filters
    document.querySelectorAll('.resource-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.resource-chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            currentResourceType = e.target.dataset.type;
            renderResources();
        });
    });

    // Search
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // File upload area
    const fileUploadArea = document.querySelector('.file-upload-area');
    const resourceFileInput = document.getElementById('resourceFile');

    if (fileUploadArea && resourceFileInput) {
        fileUploadArea.addEventListener('click', () => resourceFileInput.click());

        resourceFileInput.addEventListener('change', (e) => {
            const fileName = e.target.files[0]?.name;
            if (fileName) {
                fileUploadArea.querySelector('p').textContent = `Selected: ${fileName}`;
            }
        });
    }
}

// ===== MODAL FUNCTIONS =====
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== FORM HANDLERS =====
function handleItemUpload(e) {
    e.preventDefault();

    const newItem = {
        id: marketplaceItems.length + 1,
        title: document.getElementById('itemTitle').value,
        category: document.getElementById('itemCategory').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        description: document.getElementById('itemDescription').value,
        condition: document.getElementById('itemCondition').value,
        image: document.getElementById('itemCategory').value
    };

    marketplaceItems.unshift(newItem);
    renderMarketplaceItems();
    closeModal(uploadModal);
    uploadForm.reset();

    showNotification('Item posted successfully!');
}

function handleResourceUpload(e) {
    e.preventDefault();

    const newResource = {
        id: resources.length + 1,
        title: document.getElementById('resourceTitle').value,
        type: document.getElementById('resourceType').value,
        course: document.getElementById('resourceCourse').value,
        year: parseInt(document.getElementById('resourceYear').value) || new Date().getFullYear(),
        description: document.getElementById('resourceDescription').value
    };

    resources.unshift(newResource);
    renderResources();
    closeModal(resourceModal);
    resourceForm.reset();

    showNotification('Resource uploaded successfully!');
}

// ===== RENDER FUNCTIONS =====
function renderMarketplaceItems() {
    const filteredItems = marketplaceItems.filter(item => {
        if (currentCategory === 'all') return true;
        return item.category === currentCategory;
    });

    marketplaceGrid.innerHTML = filteredItems.map(item => createMarketplaceCard(item)).join('');
}

function createMarketplaceCard(item) {
    const imageGradients = {
        laptop: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        book: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        desk: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        service: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        phone: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        jacket: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        mouse: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    };

    const gradient = imageGradients[item.image] || 'linear-gradient(135deg, #368CBF 0%, #E6DBC9 100%)';

    return `
        <div class="marketplace-item" data-id="${item.id}">
            <div class="item-image" style="background: ${gradient}"></div>
            <div class="item-content">
                <span class="item-category">${item.category}</span>
                <h3 class="item-title">${item.title}</h3>
                <p class="item-description">${item.description}</p>
                <div class="item-footer">
                    <span class="item-price">$${item.price.toFixed(2)}</span>
                    <span class="item-condition">${formatCondition(item.condition)}</span>
                </div>
            </div>
        </div>
    `;
}

function renderResources() {
    const filteredResources = resources.filter(resource => {
        if (currentResourceType === 'all') return true;
        return resource.type === currentResourceType;
    });

    resourcesGrid.innerHTML = filteredResources.map(resource => createResourceCard(resource)).join('');
}

function createResourceCard(resource) {
    const icons = {
        exam: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
        </svg>`,
        textbook: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2"/>
        </svg>`,
        notes: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2"/>
        </svg>`
    };

    return `
        <div class="resource-card" data-id="${resource.id}">
            <div class="resource-header">
                <div class="resource-icon">
                    ${icons[resource.type] || icons.exam}
                </div>
                <div class="resource-info">
                    <span class="resource-type">${resource.type}</span>
                    <h3 class="resource-title">${resource.title}</h3>
                    <p class="resource-course">${resource.course}</p>
                </div>
            </div>
            <div class="resource-meta">
                <span class="resource-year">${resource.year}</span>
                <button class="download-btn" onclick="downloadResource(${resource.id})">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 11V3M8 11L5 8M8 11L11 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 13H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Download
                </button>
            </div>
        </div>
    `;
}

// ===== UTILITY FUNCTIONS =====
function formatCondition(condition) {
    const conditionMap = {
        'new': 'New',
        'like-new': 'Like New',
        'good': 'Good',
        'fair': 'Fair'
    };
    return conditionMap[condition] || condition;
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();

    // Filter marketplace items
    const filteredItems = sampleMarketplaceItems.filter(item => {
        return item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query);
    });

    marketplaceItems = filteredItems;
    renderMarketplaceItems();

    // Filter resources
    const filteredResources = sampleResources.filter(resource => {
        return resource.title.toLowerCase().includes(query) ||
            resource.course.toLowerCase().includes(query) ||
            resource.type.toLowerCase().includes(query);
    });

    resources = filteredResources;
    renderResources();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function downloadResource(id) {
    const resource = resources.find(r => r.id === id);
    if (resource) {
        showNotification(`Downloading: ${resource.title}`);
        // In a real application, this would trigger an actual download
        console.log('Downloading resource:', resource);
    }
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #368CBF;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
        z-index: 3000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== AUTHENTICATION FUNCTIONS =====
function checkAuthStatus() {
    if (isLoggedIn()) {
        const session = getCurrentSession();
        updateUIForLoggedInUser(session);
    } else {
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser(session) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userMenu) userMenu.style.display = 'block';
    if (dashboardLink) dashboardLink.style.display = 'block';
    if (document.getElementById('userName')) {
        document.getElementById('userName').textContent = session.name.split(' ')[0];
    }
}

function updateUIForLoggedOutUser() {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (userMenu) userMenu.style.display = 'none';
    if (dashboardLink) dashboardLink.style.display = 'none';
}

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const result = loginUser(email, password);

    if (result.success) {
        showNotification('Login successful!');
        closeModal(authModal);
        loginForm.reset();
        checkAuthStatus();
    } else {
        showNotification(result.message);
    }
}

function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    const result = registerUser(email, password, name, role);

    if (result.success) {
        showNotification('Registration successful! Please login.');
        // Switch to login tab
        document.querySelector('[data-tab="login"]').click();
        registerForm.reset();
    } else {
        showNotification(result.message);
    }
}

function handleLogout(e) {
    e.preventDefault();
    logoutUser();
    showNotification('Logged out successfully');
    checkAuthStatus();
    // Redirect to home if on dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
    }
}

