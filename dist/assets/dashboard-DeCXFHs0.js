import{i,a as d,g as l,c as o,e}from"./navbar-DPq7TFUX.js";/* empty css               */document.addEventListener("DOMContentLoaded",async()=>{if(await i(),!await d()){window.location.href="index.html";return}const s=await l();if(!s){window.location.href="index.html";return}document.getElementById("dashboardUserName").textContent=s.name,s.role==="seller"?r(s):c(s);const t=document.getElementById("logoutBtn");t&&t.addEventListener("click",async a=>{a.preventDefault(),await o(),window.location.href="index.html"})});async function c(s){const t=await e(),a=`
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon buyer">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3 class="stat-value">${t.totalPurchases}</h3>
                    <p class="stat-label">Total Purchases</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon buyer">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3 class="stat-value">$${parseFloat(t.totalSpent).toFixed(2)}</h3>
                    <p class="stat-label">Total Spent</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon buyer">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3 class="stat-value">${t.totalDownloads}</h3>
                    <p class="stat-label">Resources Downloaded</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon buyer">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3 class="stat-value">${t.savedItemsCount}</h3>
                    <p class="stat-label">Saved Items</p>
                </div>
            </div>
        </div>
        
        <div class="dashboard-section">
            <h2 class="section-title">Purchase History</h2>
            ${n(s.purchases)}
        </div>
        
        <div class="dashboard-section">
            <h2 class="section-title">Downloaded Resources</h2>
            ${h(s.downloads)}
        </div>
    `;document.getElementById("dashboardContent").innerHTML=a}async function r(s){const t=await e(),a=`
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon seller">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M20 7h-4V5l-2-2h-4L8 5v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zm10 15H4V9h16v11z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3 class="stat-value">${t.totalListings}</h3>
                    <p class="stat-label">Total Listings</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon seller">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3 class="stat-value">${t.activeListings}</h3>
                    <p class="stat-label">Active Listings</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon seller">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3 class="stat-value">${t.totalSales}</h3>
                    <p class="stat-label">Total Sales</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon seller">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3 class="stat-value">$${parseFloat(t.totalRevenue).toFixed(2)}</h3>
                    <p class="stat-label">Total Revenue</p>
                </div>
            </div>
        </div>
        
        <div class="dashboard-section">
            <h2 class="section-title">My Listings</h2>
            ${v(s.listings)}
        </div>
        
        <div class="dashboard-section">
            <h2 class="section-title">Sales History</h2>
            ${p(s.sales)}
        </div>
        
        <div class="dashboard-section">
            <h2 class="section-title">Uploaded Resources</h2>
            ${u(s.uploadedResources)}
        </div>
    `;document.getElementById("dashboardContent").innerHTML=a}function n(s){return!s||s.length===0?'<p class="empty-state">No purchases yet. Start shopping!</p>':`
        <div class="table-container">
            <table class="dashboard-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${s.map(t=>`
                        <tr>
                            <td>${t.item_title}</td>
                            <td><span class="category-badge">${t.category}</span></td>
                            <td class="price">$${parseFloat(t.price).toFixed(2)}</td>
                            <td>${new Date(t.purchase_date).toLocaleDateString()}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `}function h(s){return!s||s.length===0?'<p class="empty-state">No downloads yet. Check out free resources!</p>':`
        <div class="table-container">
            <table class="dashboard-table">
                <thead>
                    <tr>
                        <th>Resource Title</th>
                        <th>Course</th>
                        <th>Type</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${s.map(t=>`
                        <tr>
                            <td>${t.resource?t.resource.title:"Unknown Resource"}</td>
                            <td>${t.resource?t.resource.course:"-"}</td>
                            <td><span class="category-badge">${t.resource?t.resource.type:"N/A"}</span></td>
                            <td>${new Date(t.download_date).toLocaleDateString()}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `}function v(s){return!s||s.length===0?'<p class="empty-state">No listings yet. Post your first item!</p>':`
        <div class="listings-grid">
            ${s.map(t=>`
                <div class="listing-card ${t.status}">
                    <div class="listing-header">
                        <h3>${t.title}</h3>
                        <span class="status-badge ${t.status}">${t.status}</span>
                    </div>
                    <p class="listing-description">${t.description}</p>
                    <div class="listing-footer">
                        <span class="listing-price">$${parseFloat(t.price).toFixed(2)}</span>
                        <div style="text-align: right;">
                            <span class="listing-views">${t.views||0} views</span>
                            <br>
                            <span style="font-size: 0.8rem; color: var(--text-secondary);">${new Date(t.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>
    `}function p(s){return!s||s.length===0?'<p class="empty-state">No sales yet. Keep promoting your listings!</p>':`
        <div class="table-container">
            <table class="dashboard-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${s.map(t=>`
                        <tr>
                            <td>${t.item_title}</td>
                            <td><span class="category-badge">${t.category}</span></td>
                            <td class="price">$${parseFloat(t.price).toFixed(2)}</td>
                            <td>${new Date(t.purchase_date).toLocaleDateString()}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `}function u(s){return!s||s.length===0?'<p class="empty-state">No resources uploaded yet. Share your knowledge!</p>':`
        <div class="table-container">
            <table class="dashboard-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Course</th>
                        <th>Type</th>
                        <th>Downloads</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${s.map(t=>`
                        <tr>
                            <td>${t.title}</td>
                            <td>${t.course}</td>
                            <td><span class="category-badge">${t.type}</span></td>
                            <td>${t.downloads||0}</td>
                            <td>${new Date(t.created_at).toLocaleDateString()}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `}
