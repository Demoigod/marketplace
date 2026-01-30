import{c as r}from"./auth-B4SlU3WG.js";/* empty css              */import{i as s}from"./navbar-CPDaB8ME.js";const c=[{id:1,title:"Intro to Python Programming",category:"tech",description:"Learn the basics of Python, the most popular language for data science and web dev.",difficulty:"Beginner",icon:"🐍",link:"#",color:"#e0f2fe"},{id:2,title:"Graphic Design Basics",category:"design",description:"Master the fundamentals of composition, color theory, and typography.",difficulty:"Beginner",icon:"🎨",link:"#",color:"#fce7f3"},{id:3,title:"Personal Finance 101",category:"business",description:"Budgeting, saving, and investing tips specifically for students.",difficulty:"Beginner",icon:"💰",link:"#",color:"#dcfce7"},{id:4,title:"Public Speaking Mastery",category:"soft-skills",description:"Overcome fear and deliver impactful presentations in class and beyond.",difficulty:"Intermediate",icon:"🎤",link:"#",color:"#fef3c7"},{id:5,title:"Web Development Bootcamp",category:"tech",description:"Build your first website using HTML, CSS, and modern JavaScript.",difficulty:"Intermediate",icon:"💻",link:"#",color:"#e0f2fe"},{id:6,title:"Study Smarter, Not Harder",category:"academic",description:"Proven techniques to improve memory retention and ace your exams.",difficulty:"Beginner",icon:"🧠",link:"#",color:"#f3e8ff"},{id:7,title:"Digital Marketing Essentials",category:"business",description:"Learn how to market yourself and products in the digital age.",difficulty:"Beginner",icon:"📱",link:"#",color:"#dcfce7"},{id:8,title:"Advanced Excel for Business",category:"tech",description:"Pivot tables, VLOOKUPs, and macros to boost your productivity.",difficulty:"Advanced",icon:"📊",link:"#",color:"#e0f2fe"}];document.addEventListener("DOMContentLoaded",async()=>{if(!await r()){window.location.href="index.html";return}await s(),o(c),l()});function o(i){const e=document.getElementById("skillsGrid");if(e){if(i.length===0){e.innerHTML='<p class="empty-state">No skills found in this category.</p>';return}e.innerHTML=i.map(t=>d(t)).join("")}}function d(i){let e="diff-beginner";return i.difficulty==="Intermediate"&&(e="diff-intermediate"),i.difficulty==="Advanced"&&(e="diff-advanced"),`
        <div class="skill-card">
            <div class="skill-cover" style="background: linear-gradient(135deg, ${i.color} 0%, #ffffff 100%);">
                <div class="skill-icon-lg">${i.icon}</div>
            </div>
            <div class="skill-content">
                <div class="skill-category">${i.category.replace("-"," ")}</div>
                <h3 class="skill-title">${i.title}</h3>
                <p class="skill-desc">${i.description}</p>
                
                <div class="skill-meta">
                    <div class="skill-difficulty ${e}">
                        <div class="diff-dot"></div>
                        ${i.difficulty}
                    </div>
                    <a href="${i.link}" class="skill-action">Start Learning</a>
                </div>
            </div>
        </div>
    `}function l(){const i=document.querySelectorAll(".skill-tab");i.forEach(e=>{e.addEventListener("click",()=>{i.forEach(n=>n.classList.remove("active")),e.classList.add("active");const t=e.dataset.category;if(t==="all")o(c);else{const n=c.filter(a=>a.category===t);o(n)}})})}
