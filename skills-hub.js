import { isLoggedIn, checkAuthStatus } from './auth.js';
import { initNavigation } from './navbar.js';

// Define static skills data for MVP (since we don't have a skills DB table yet)
const SKILLS_DATA = [
    {
        id: 1,
        title: "Intro to Python Programming",
        category: "tech",
        description: "Learn the basics of Python, the most popular language for data science and web dev.",
        difficulty: "Beginner",
        icon: "🐍",
        link: "#",
        color: "#e0f2fe"
    },
    {
        id: 2,
        title: "Graphic Design Basics",
        category: "design",
        description: "Master the fundamentals of composition, color theory, and typography.",
        difficulty: "Beginner",
        icon: "🎨",
        link: "#",
        color: "#fce7f3"
    },
    {
        id: 3,
        title: "Personal Finance 101",
        category: "business",
        description: "Budgeting, saving, and investing tips specifically for students.",
        difficulty: "Beginner",
        icon: "💰",
        link: "#",
        color: "#dcfce7"
    },
    {
        id: 4,
        title: "Public Speaking Mastery",
        category: "soft-skills",
        description: "Overcome fear and deliver impactful presentations in class and beyond.",
        difficulty: "Intermediate",
        icon: "🎤",
        link: "#",
        color: "#fef3c7"
    },
    {
        id: 5,
        title: "Web Development Bootcamp",
        category: "tech",
        description: "Build your first website using HTML, CSS, and modern JavaScript.",
        difficulty: "Intermediate",
        icon: "💻",
        link: "#",
        color: "#e0f2fe"
    },
    {
        id: 6,
        title: "Study Smarter, Not Harder",
        category: "academic",
        description: "Proven techniques to improve memory retention and ace your exams.",
        difficulty: "Beginner",
        icon: "🧠",
        link: "#",
        color: "#f3e8ff"
    },
    {
        id: 7,
        title: "Digital Marketing Essentials",
        category: "business",
        description: "Learn how to market yourself and products in the digital age.",
        difficulty: "Beginner",
        icon: "📱",
        link: "#",
        color: "#dcfce7"
    },
    {
        id: 8,
        title: "Advanced Excel for Business",
        category: "tech",
        description: "Pivot tables, VLOOKUPs, and macros to boost your productivity.",
        difficulty: "Advanced",
        icon: "📊",
        link: "#",
        color: "#e0f2fe"
    }
];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Auth
    const isAuth = await checkAuthStatus();
    if (!isAuth) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Init global navigation (sidebar)
    // We need to make sure the sidebar links are populated
    // Note: We'll need to update admin.js/navbar.js to include this link nicely
    // For now, we reuse the existing init logic which might inject the standard sidebar
    // We will need to customize it to show "Skills Hub" as active
    await initNavigation();

    // Manually mark "Skills Hub" as active if it exists in sidebar
    // Since we haven't updated sidebar HTML generation yet, we will do that in next step.

    // 3. Render Skills
    renderSkills(SKILLS_DATA);

    // 4. Setup Filters
    setupFilters();
});

function renderSkills(skills) {
    const grid = document.getElementById('skillsGrid');
    if (!grid) return;

    if (skills.length === 0) {
        grid.innerHTML = '<p class="empty-state">No skills found in this category.</p>';
        return;
    }

    grid.innerHTML = skills.map(skill => createSkillCard(skill)).join('');
}

function createSkillCard(skill) {
    let diffClass = 'diff-beginner';
    if (skill.difficulty === 'Intermediate') diffClass = 'diff-intermediate';
    if (skill.difficulty === 'Advanced') diffClass = 'diff-advanced';

    return `
        <div class="skill-card">
            <div class="skill-cover" style="background: linear-gradient(135deg, ${skill.color} 0%, #ffffff 100%);">
                <div class="skill-icon-lg">${skill.icon}</div>
            </div>
            <div class="skill-content">
                <div class="skill-category">${skill.category.replace('-', ' ')}</div>
                <h3 class="skill-title">${skill.title}</h3>
                <p class="skill-desc">${skill.description}</p>
                
                <div class="skill-meta">
                    <div class="skill-difficulty ${diffClass}">
                        <div class="diff-dot"></div>
                        ${skill.difficulty}
                    </div>
                    <a href="${skill.link}" class="skill-action">Start Learning</a>
                </div>
            </div>
        </div>
    `;
}

function setupFilters() {
    const tabs = document.querySelectorAll('.skill-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            // Add to click
            tab.classList.add('active');

            const category = tab.dataset.category;
            if (category === 'all') {
                renderSkills(SKILLS_DATA);
            } else {
                const filtered = SKILLS_DATA.filter(s => s.category === category);
                renderSkills(filtered);
            }
        });
    });
}
