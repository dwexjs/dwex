// Simple SPA router simulation
const routes = {
    '/': 'Home Page',
    '/about': 'About Page - This route is handled by the SPA!',
    '/contact': 'Contact Page - Client-side routing works!'
};

function updateContent() {
    const path = window.location.pathname;
    const app = document.getElementById('app');

    if (app) {
        const content = routes[path] || 'Page not found';
        app.innerHTML = `
            <h3>Current Route: ${path}</h3>
            <p>${content}</p>
            <p><small>This content is rendered client-side by app.js</small></p>
        `;
    }
}

// Handle navigation
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
        const path = new URL(e.target.href).pathname;

        // Don't intercept API calls
        if (path.startsWith('/api')) {
            return;
        }

        e.preventDefault();
        window.history.pushState({}, '', e.target.href);
        updateContent();
    }
});

// Handle back/forward
window.addEventListener('popstate', updateContent);

// Initial render
updateContent();

console.log('Dwex SPA example loaded! 🚀');
